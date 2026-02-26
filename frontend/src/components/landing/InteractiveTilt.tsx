import { useRef, useState, useEffect, ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface InteractiveTiltProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  disabled?: boolean;
}

export default function InteractiveTilt({
  children,
  className = '',
  intensity = 1,
  disabled = false,
}: InteractiveTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(true);

  useEffect(() => {
    // Detect if device has fine pointer (mouse) vs coarse (touch)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Disable for reduced motion, touch devices, or when explicitly disabled
  const isDisabled = disabled || prefersReducedMotion || !isFinePointer;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angles (max ±8 degrees)
    const tiltX = ((y - centerY) / centerY) * -8 * intensity;
    const tiltY = ((x - centerX) / centerX) * 8 * intensity;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const transform = isDisabled
    ? 'none'
    : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`;

  const shadowIntensity = isHovered && !isDisabled ? 0.15 : 0.05;
  const shadowX = tilt.y * 0.5;
  const shadowY = tilt.x * 0.5;

  return (
    <div
      ref={containerRef}
      className={`interactive-tilt-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: isHovered && !isDisabled ? 'transform 0.1s ease-out, box-shadow 0.3s ease' : 'transform 0.5s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        boxShadow: isDisabled
          ? undefined
          : `${shadowX}px ${shadowY + 10}px ${20 + shadowIntensity * 30}px rgba(0, 0, 0, ${shadowIntensity})`,
      }}
    >
      {children}
      {isHovered && !isDisabled && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${((tilt.y / 8) * 50 + 50)}% ${((tilt.x / 8) * 50 + 50)}%, 
              hsla(45, 80%, 70%, 0.1) 0%, 
              transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
