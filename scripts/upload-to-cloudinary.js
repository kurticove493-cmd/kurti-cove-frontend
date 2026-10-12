/**
 * scripts/upload-to-cloudinary.js
 *
 * Uploads all public/ static images to Cloudinary.
 * Saves a mapping of localPath → secure_url in cloudinary-urls.json.
 * Resume-safe: skips already-uploaded files.
 * Never modifies original files.
 *
 * Usage:
 *   npm run upload:images
 *   node scripts/upload-to-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary'
import { config }           from 'dotenv'
import { createReadStream } from 'fs'
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { readdir, stat }    from 'fs/promises'
import path                 from 'path'
import os                   from 'os'
import sharp                from 'sharp'

/* ── Load env vars ── */
config({ path: '.env.local' })
config({ path: '.env' })          // fallback

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY     = process.env.CLOUDINARY_API_KEY
const API_SECRET  = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌  Missing Cloudinary credentials.')
  console.error('    Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local')
  process.exit(1)
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET })

/* ── Config ── */
const PUBLIC_DIR    = path.resolve('public')
const URLS_FILE     = path.resolve('cloudinary-urls.json')
const CONCURRENCY   = 4
const MAX_BYTES     = 9 * 1024 * 1024   // 9 MB — compress before upload
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const SKIP_EXTS     = new Set(['.svg', '.ico', '.zip', '.pdf', '.txt', '.json', '.md'])

/* ── Helpers ── */
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9._/-]/g, '-')   // replace special chars with hyphen
    .replace(/-{2,}/g, '-')            // collapse consecutive hyphens
    .replace(/(^-|-$)/g, '')

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files   = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...(await collectImages(full)))
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase()
      if (IMAGE_EXTS.has(ext)) files.push(full)
    }
  }
  return files
}

function uploadBuffer(buffer, publicId, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type:    'image',
        folder,
        public_id:        publicId,
        overwrite:        true,
        unique_filename:  false,
        use_filename:     true,
      },
      (err, result) => err ? reject(err) : resolve(result)
    )
    stream.end(buffer)
  })
}

async function uploadFile(filePath, urls) {
  const relative  = path.relative(PUBLIC_DIR, filePath)  // e.g. hero/image1.png
  const localKey  = '/' + relative.replace(/\\/g, '/')   // e.g. /hero/image1.png

  if (urls[localKey]) {
    return { status: 'skipped', key: localKey }
  }

  const fileSize  = statSync(filePath).size
  // For root-level files (no subfolder), use 'ecommerce/root' as folder
  const relDir    = path.dirname(relative).replace(/\\/g, '/')
  const folder    = relDir === '.' ? 'ecommerce/root' : 'ecommerce/' + slugify(relDir)
  const baseName  = path.basename(filePath, path.extname(filePath))
  const publicId  = slugify(baseName)

  let buffer
  if (fileSize > MAX_BYTES) {
    // Compress locally before upload to stay under the 10MB Cloudinary limit
    const tmpFile = path.join(os.tmpdir(), `kc_${Date.now()}_${baseName}.jpg`)
    await sharp(filePath)
      .rotate()                                          // auto-orient EXIF
      .resize({ width: 2400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmpFile)
    buffer = readFileSync(tmpFile)
  } else {
    buffer = readFileSync(filePath)
  }

  const result = await uploadBuffer(buffer, publicId, folder)
  urls[localKey] = result.secure_url
  return { status: 'uploaded', key: localKey, url: result.secure_url }
}

/* ── Pool runner ── */
async function runWithConcurrency(tasks, concurrency) {
  let idx = 0
  const results = []
  async function worker() {
    while (idx < tasks.length) {
      const i    = idx++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

/* ── Main ── */
async function main() {
  console.log('\n📦  Kurti Cove — Upload static images to Cloudinary\n')

  /* Load existing mapping */
  const urls = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, 'utf8')) : {}

  /* Collect all image files */
  const files = await collectImages(PUBLIC_DIR)
  console.log(`Found ${files.length} image files in public/\n`)

  let uploaded = 0, skipped = 0, failed = 0

  const tasks = files.map((f) => async () => {
    try {
      const r = await uploadFile(f, urls)
      if (r.status === 'skipped') {
        console.log(`⏭  Skipped (already uploaded): ${r.key}`)
        skipped++
      } else {
        console.log(`✅  Uploaded: ${r.key}`)
        console.log(`    → ${r.url}`)
        uploaded++
        /* Incrementally save after each upload */
        writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2))
      }
    } catch (err) {
      console.error(`❌  Failed: ${f}`)
      console.error(`    ${err.message}`)
      failed++
    }
  })

  await runWithConcurrency(tasks, CONCURRENCY)

  /* Final save */
  writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2))

  /* ── Patch src/lib/staticImg.js with the new URL map ── */
  const STATIC_IMG_FILE = path.resolve('src/lib/staticImg.js')
  if (existsSync(STATIC_IMG_FILE)) {
    let src = readFileSync(STATIC_IMG_FILE, 'utf8')
    const mapJson = JSON.stringify(urls, null, 2)
    src = src.replace(
      /\/\/ BEGIN_STATIC_MAP[\s\S]*?\/\/ END_STATIC_MAP/,
      `// BEGIN_STATIC_MAP\nconst urlMap = ${mapJson}\n// END_STATIC_MAP`
    )
    writeFileSync(STATIC_IMG_FILE, src)
    console.log('\n✅  Updated src/lib/staticImg.js with Cloudinary URL map')
  }

  console.log(`\n─────────────────────────────────────────`)
  console.log(`✅  Uploaded : ${uploaded}`)
  console.log(`⏭  Skipped  : ${skipped}`)
  console.log(`❌  Failed   : ${failed}`)
  console.log(`\n📄  URL map saved to: cloudinary-urls.json`)
  console.log(`─────────────────────────────────────────\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
