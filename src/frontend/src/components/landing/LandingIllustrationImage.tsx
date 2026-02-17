import { ImgHTMLAttributes } from 'react';

interface LandingIllustrationImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function LandingIllustrationImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  ...props
}: LandingIllustrationImageProps) {
  if (!alt || alt.trim() === '') {
    console.warn('LandingIllustrationImage: alt text is required for accessibility');
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={`max-w-full h-auto ${className}`}
      {...props}
    />
  );
}
