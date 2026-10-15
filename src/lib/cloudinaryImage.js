/**
 * cloudinaryImage.js — Cloudinary URL optimizer + image normalizer
 *
 * Two exports:
 *   cldUrl(src, opts)              — inject f_auto,q_auto (+ width) into Cloudinary URLs
 *   normalizeProductImages(images) — safely handle any legacy image format and return
 *                                    a clean array of { src, alt } objects
 */

const CDN = 'res.cloudinary.com'
const PLACEHOLDER = ''   // empty string → renders the 👗 fallback in cards

/* ── cldUrl ─────────────────────────────────────────────────────────
 * Takes any image src:
 *   • Cloudinary URL  → injects f_auto,q_auto[,w_N,c_limit]
 *   • Already-transformed Cloudinary URL → returned unchanged
 *   • Local path / null / undefined → returned unchanged (fallback)
 *
 * @param {string|null|undefined} src
 * @param {{ width?: number }}    opts
 * @returns {string}
 */
export function cldUrl(src, opts = {}) {
  if (!src || typeof src !== 'string') return ''

  // Not a Cloudinary URL → return unchanged (local path / placeholder)
  if (!src.includes(CDN)) return src

  // Already has auto transformations → skip double-inject
  if (src.includes('f_auto') || src.includes('q_auto')) return src

  const { width } = opts
  const t = ['f_auto', 'q_auto', ...(width ? [`w_${width}`, 'c_limit'] : [])].join(',')

  // Correct injection: transforms go AFTER /upload/ and BEFORE version (v123...)
  // Input:  /upload/v1790331656/ecommerce/...
  // Output: /upload/f_auto,q_auto/v1790331656/ecommerce/...
  // Also handles URLs without a version segment:
  // Input:  /upload/ecommerce/...
  // Output: /upload/f_auto,q_auto/ecommerce/...
  return src.replace(/\/upload\//, `/upload/${t}/`)
}

/* ── normalizeProductImages ─────────────────────────────────────────
 * Accepts any of these legacy / new formats and returns a clean array
 * of renderable { src: string, alt: string } objects.
 *
 * Handled formats:
 *   • string[]                  — plain secure_url array  (current schema)
 *   • string (JSON)             — JSON-encoded array
 *   • string (single URL)       — bare URL string
 *   • { url }[]                 — {url: '...'} objects
 *   • { secure_url }[]          — {secure_url: '...'} objects
 *   • { src }[]                 — {src: '...'} objects
 *   • { publicId / public_id }  — Cloudinary public_id (reconstructed)
 *   • null / undefined          — returns []
 *
 * @param {any}    images  - product.images from the API
 * @param {string} [name]  - product name for alt text
 * @returns {{ src: string, alt: string }[]}
 */
export function normalizeProductImages(images, name = 'Product') {
  if (!images) return []

  // Unwrap JSON string or space-separated URL string
  let arr = images
  if (typeof arr === 'string') {
    if (arr.startsWith('[') || arr.startsWith('"')) {
      // JSON-encoded array
      try { arr = JSON.parse(arr) } catch { arr = [arr] }
    } else if (arr.includes(' https://') || arr.includes(' http://')) {
      // Space-separated URLs — split on whitespace between URLs
      arr = arr.trim().split(/\s+/).filter(Boolean)
    } else if (arr.length > 0) {
      arr = [arr]
    } else {
      return []
    }
  }

  if (!Array.isArray(arr)) return []

  const results = []
  for (const item of arr) {
    if (!item) continue
    let src = ''

    if (typeof item === 'string') {
      src = item.trim()
    } else if (typeof item === 'object') {
      src = (
        item.secure_url ||
        item.url        ||
        item.src        ||
        item.image      ||
        ''
      ).trim()

      // Reconstruct from public_id if no URL present
      if (!src && (item.publicId || item.public_id)) {
        const pid = (item.publicId || item.public_id).trim()
        const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
        if (cloud && pid) {
          src = `https://res.cloudinary.com/${cloud}/image/upload/${pid}`
        }
      }
    }

    // Skip empty, blob: or local filesystem paths that won't resolve in browser
    if (!src) continue
    if (src.startsWith('blob:')) continue
    if (/^[A-Za-z]:\\/.test(src)) continue   // Windows path
    if (src.startsWith('/tmp/')) continue

    results.push({ src, alt: name })
  }

  return results
}

/* ── getProductImageSrc ─────────────────────────────────────────────
 * Convenience: get the first valid image src from a product, or ''
 *
 * @param {any}    images  - product.images
 * @param {number} [width] - optional Cloudinary width transform
 * @returns {string}
 */
export function getProductImageSrc(images, width) {
  const normalized = normalizeProductImages(images)
  if (!normalized.length) return ''
  return width ? cldUrl(normalized[0].src, { width }) : normalized[0].src
}
