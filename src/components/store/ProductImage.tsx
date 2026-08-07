import { useState } from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackChar?: string;
}

/**
 * Renders a product image, falling back to a branded letter tile
 * when the product has no image (legacy data) or the image fails to load.
 */
export default function ProductImage({
  src,
  alt,
  className,
  fallbackChar,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div className={["product-tile", className].filter(Boolean).join(" ")} aria-label={alt}>
        {(fallbackChar || alt.charAt(0) || "?").toUpperCase()}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
