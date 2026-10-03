/**
 * POST /api/admin/upload
 * App Router API Route — server-side Cloudinary upload.
 *
 * Accepts multipart/form-data with one or more files under the key "images".
 * Returns JSON: { success: true, images: [{ secure_url, public_id }, …] }
 *
 * Credentials never leave the server — CLOUDINARY_API_SECRET is not
 * prefixed with NEXT_PUBLIC_ and is never sent to the browser.
 */

import { v2 as cloudinary } from 'cloudinary'
import { NextResponse }     from 'next/server'

/* Configure once per cold-start */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/avif', 'image/gif',
])
const MAX_SIZE_BYTES = 10 * 1024 * 1024   // 10 MB

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type:   'image',
        folder:          folder || 'ecommerce/products',
        overwrite:       true,
        unique_filename: true,
      },
      (err, result) => err ? reject(err) : resolve(result)
    ).end(buffer)
  })
}

export async function POST(request) {
  try {
    /* Verify Cloudinary is configured */
    if (!process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, msg: 'Cloudinary is not configured on the server.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const folder   = formData.get('folder') || 'ecommerce/products'
    const files    = formData.getAll('images')

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, msg: 'No images provided.' },
        { status: 400 }
      )
    }

    const results = []

    for (const file of files) {
      /* Validate type */
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, msg: `Invalid file type: ${file.type}. Only images are allowed.` },
          { status: 400 }
        )
      }

      /* Validate size */
      const buffer = Buffer.from(await file.arrayBuffer())
      if (buffer.byteLength > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, msg: `File too large (max 10 MB): ${file.name}` },
          { status: 400 }
        )
      }

      const result = await uploadBuffer(buffer, folder)
      results.push({
        secure_url: result.secure_url,
        public_id:  result.public_id,
      })
    }

    return NextResponse.json({ success: true, images: results }, { status: 200 })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { success: false, msg: err.message || 'Upload failed.' },
      { status: 500 }
    )
  }
}
