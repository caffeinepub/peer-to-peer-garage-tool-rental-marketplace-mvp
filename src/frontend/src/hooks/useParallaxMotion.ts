import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface ParallaxOffset {
  x: number;
  y: number;
  scrollY: number;
}

export function useParallaxMotion(): ParallaxOffset {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0, scrollY: 0 });

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // Conservative range: -10 to 10
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setOffset((prev) => ({ ...prev, x, y }));
    };

    const handleScroll = () => {
      const scrollY = window.scrollY * 0.3; // Conservative scroll parallax
      setOffset((prev) => ({ ...prev, scrollY }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);

  return offset;
}
