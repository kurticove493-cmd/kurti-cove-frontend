/**
 * staticImg.js — static image → Cloudinary URL mapper
 *
 * Works in both Server and Client components.
 * Falls back to local path if no Cloudinary URL is mapped.
 *
 * Run `npm run upload:images` to populate cloudinary-urls.json,
 * then run `npm run generate:static-map` (or the upload script auto-
 * generates it) so this module has URLs to serve.
 *
 * Usage:
 *   import { staticImg } from '@/lib/staticImg'
 *   <img src={staticImg('/hero/image1.png')} />
 */

import { cldUrl } from './cloudinaryImage.js'

// ── Inline URL map ────────────────────────────────────────────────────
// This file is auto-updated by scripts/upload-to-cloudinary.js.
// Until the script runs, urlMap is empty and all images use local paths.
// DO NOT edit the block between BEGIN / END markers manually.
// BEGIN_STATIC_MAP
const urlMap = {
  "/bg image/best seller bg.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331647/ecommerce/bg-image/best-seller-bg.jpg",
  "/bg image/offer image.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331647/ecommerce/bg-image/offer-image.jpg",
  "/bg image/for sale.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331647/ecommerce/bg-image/for-sale.jpg",
  "/bg image/newarrival.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331647/ecommerce/bg-image/newarrival.jpg",
  "/bg image/salebg.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331649/ecommerce/bg-image/salebg.jpg",
  "/category grid/a-line.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331649/ecommerce/category-grid/a-line.jpg",
  "/bg image/sale image.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331649/ecommerce/bg-image/sale-image.png",
  "/bg image/sale mobile image.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331649/ecommerce/bg-image/sale-mobile-image.png",
  "/category grid/co-ord.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331650/ecommerce/category-grid/co-ord.jpg",
  "/category grid/cotton.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331650/ecommerce/category-grid/cotton.jpg",
  "/category grid/embroidery.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331650/ecommerce/category-grid/embroidery.jpg",
  "/category grid/festive.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331650/ecommerce/category-grid/festive.jpg",
  "/category grid/long.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331651/ecommerce/category-grid/long.jpg",
  "/category grid/printed.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331651/ecommerce/category-grid/printed.jpg",
  "/category grid/rayon.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331651/ecommerce/category-grid/rayon.jpg",
  "/category grid/short.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331651/ecommerce/category-grid/short.jpg",
  "/category grid/streight.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331652/ecommerce/category-grid/streight.jpg",
  "/customer review/combo.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331652/ecommerce/customer-review/combo.jpg",
  "/customer review/cotton.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331652/ecommerce/customer-review/cotton.jpg",
  "/customer review/embroidery.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331652/ecommerce/customer-review/embroidery.png",
  "/customer review/festive.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331653/ecommerce/customer-review/festive.jpg",
  "/customer review/short.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331653/ecommerce/customer-review/short.jpg",
  "/customer review/printed.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331653/ecommerce/customer-review/printed.jpg",
  "/festive look/co-ord.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331653/ecommerce/festive-look/co-ord.jpg",
  "/festive look/embroidery.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331654/ecommerce/festive-look/embroidery.jpg",
  "/festive look/landscape.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331654/ecommerce/festive-look/landscape.jpg",
  "/festive look/printed.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331654/ecommerce/festive-look/printed.jpg",
  "/festive look/landscape1.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331654/ecommerce/festive-look/landscape1.png",
  "/festive look/short.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331655/ecommerce/festive-look/short.jpg",
  "/for mobile hero/34c535f4-1e26-436c-af3b-2f5985c86a77.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331655/ecommerce/for-mobile-hero/34c535f4-1e26-436c-af3b-2f5985c86a77.png",
  "/for mobile hero/image1ba5eea5e-70c3-4509-a37a-9578cd09125d.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331655/ecommerce/for-mobile-hero/image1ba5eea5e-70c3-4509-a37a-9578cd09125d.png",
  "/for mobile hero/image2.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331656/ecommerce/for-mobile-hero/image2.png",
  "/hero/image1.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331656/ecommerce/hero/image1.png",
  "/for mobile hero/image3.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331656/ecommerce/for-mobile-hero/image3.png",
  "/hero/image2.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331657/ecommerce/hero/image2.png",
  "/hero/image3.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331657/ecommerce/hero/image3.png",
  "/hero/image4.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331657/ecommerce/hero/image4.png",
  "/icons/upi-icon.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331658/ecommerce/icons/upi-icon.webp",
  "/icons/phonepe-icon.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331658/ecommerce/icons/phonepe-icon.webp",
  "/icons/google-pay-icon.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331657/ecommerce/icons/google-pay-icon.webp",
  "/shop-banner/image1.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331659/ecommerce/shop-banner/image1.png",
  "/shop-banner/image1.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331660/ecommerce/shop-banner/image1.webp",
  "/shop-banner/image2.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331660/ecommerce/shop-banner/image2.webp",
  "/shop-banner/image3.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331660/ecommerce/shop-banner/image3.png",
  "/shop-banner/image2.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331660/ecommerce/shop-banner/image2.png",
  "/shops/karachi.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331661/ecommerce/shops/karachi.jpg",
  "/shop-banner/image3.webp": "https://res.cloudinary.com/arerzgij/image/upload/v1790331661/ecommerce/shop-banner/image3.webp",
  "/shops/mall.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331661/ecommerce/shops/mall.jpg",
  "/shops/plaza.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331662/ecommerce/shops/plaza.jpg",
  "/shops/shopjpg.jpg": "https://res.cloudinary.com/arerzgij/image/upload/v1790331662/ecommerce/shops/shopjpg.jpg",
  "/logo.png": "https://res.cloudinary.com/arerzgij/image/upload/v1790331901/ecommerce/root/logo.png"
}
// END_STATIC_MAP

/**
 * Returns the Cloudinary URL for a public/ image, optimized with
 * f_auto,q_auto (+ optional width), or the original local path as fallback.
 *
 * @param {string}             localPath - e.g. '/hero/image1.png'
 * @param {{ width?: number }} opts
 * @returns {string}
 */
export function staticImg(localPath, opts = {}) {
  if (!localPath) return ''
  const cloud = urlMap[localPath]
  return cloud ? cldUrl(cloud, opts) : localPath
}
