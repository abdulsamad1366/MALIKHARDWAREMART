/**
 * @file CategoryCard.tsx
 * @description Category display card for homepage and directory listings.
 * Utilizes local placeholder image fallback per Section 5.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { handleImageError } from '@/lib/imageFallback';

export interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  placeholderImage?: string;
}

/**
 * CategoryCard component.
 */
export default function CategoryCard({
  name,
  slug,
  description,
  placeholderImage,
}: CategoryCardProps) {
  const imageSrc = placeholderImage || '/images/products/default-product.png';

  return (
    <Link href={`/category/${slug}`} className="category-card">
      <img
        src={imageSrc}
        alt={name}
        className="category-card-image"
        onError={handleImageError}
        loading="lazy"
      />
      <div className="category-card-body">
        <h3 className="category-card-title">{name}</h3>
        {description && <p className="category-card-desc">{description}</p>}
        <div className="category-card-action">
          <span>Browse Products</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
