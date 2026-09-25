/**
 * @file imageFallback.ts
 * @description Helper functions to resolve product and category fallback images
 * according to the strict placeholder policy in Section 5.
 */

/**
 * Resolves a reliable local image URL for a catalog product.
 * @param {string | null | undefined} imageUrl - Product custom image URL from DB
 * @param {string | null | undefined} categorySlug - Slug of the associated category
 * @param {string | null | undefined} categoryPlaceholder - Category fallback image
 * @returns {string} Safe local image URL
 */
export function getProductImageUrl(
  imageUrl?: string | null,
  categorySlug?: string | null,
  categoryPlaceholder?: string | null
): string {
  // 1. If explicit product image URL exists, use it
  if (imageUrl && imageUrl.trim().length > 0) {
    return imageUrl;
  }

  // 2. If category specific placeholder exists, prioritize it
  if (categoryPlaceholder && categoryPlaceholder.trim().length > 0) {
    return categoryPlaceholder;
  }

  // 3. Match against known category slug patterns
  if (categorySlug) {
    const slug = categorySlug.toLowerCase();
    if (slug.includes('tool')) return '/images/products/category-tools.png';
    if (slug.includes('fastener') || slug.includes('bolt') || slug.includes('screw'))
      return '/images/products/category-fasteners.png';
    if (slug.includes('elect')) return '/images/products/category-electrical.png';
    if (slug.includes('plumb') || slug.includes('pipe') || slug.includes('valve'))
      return '/images/products/category-plumbing.png';
    if (slug.includes('paint') || slug.includes('chem') || slug.includes('seal'))
      return '/images/products/category-paints.png';
    if (slug.includes('safe') || slug.includes('gear'))
      return '/images/products/category-safety.png';
    if (slug.includes('hard') || slug.includes('door') || slug.includes('lock'))
      return '/images/products/category-hardware.png';
  }

  // 4. Default global product image per Section 5
  return '/images/products/default-product.png';
}

/**
 * Image error event handler that safely swaps a broken image with default-product.png.
 * @param {React.SyntheticEvent<HTMLImageElement, Event>} e - Image error event
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const target = e.currentTarget;
  // Prevent infinite loops if fallback itself fails
  if (!target.src.endsWith('/images/products/default-product.png')) {
    target.src = '/images/products/default-product.png';
  }
}
