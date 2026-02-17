import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useParallaxMotion } from '../../hooks/useParallaxMotion';

interface FloatingObject {
  x: number;
  y: number;
  size: number;
  depth: number;
  speedX: number;
  speedY: number;
  hue: number;
  type: 'orb' | 'ring' | 'faceted' | 'torus';
  rotation: number;
  rotationSpeed: number;
  wobblePhase: number;
  pulsePhase: number;
}

export default function FloatingObjectsLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const parallax = useParallaxMotion();
  const [isSupported, setIsSupported] = useState(true);
  const objectsRef = useRef<FloatingObject[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsSupported(false);
        return;
      }

      // Initialize canvas size
      const updateSize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        // Reset transform before scaling to prevent accumulation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      // Initialize floating objects with varied types
      if (objectsRef.current.length === 0) {
        const objectCount = 12; // Increased from 8
        const types: Array<'orb' | 'ring' | 'faceted' | 'torus'> = ['orb', 'ring', 'faceted', 'torus'];
        
        for (let i = 0; i < objectCount; i++) {
          objectsRef.current.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: 25 + Math.random() * 70,
            depth: 0.2 + Math.random() * 0.8,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            hue: 30 + Math.random() * 25, // Amber/orange range
            type: types[Math.floor(Math.random() * types.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            wobblePhase: Math.random() * Math.PI * 2,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Animation loop
      const animate = () => {
        if (!ctx || !canvas) return;

        if (!prefersReducedMotion) {
          timeRef.current += 0.016; // ~60fps
        }

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        objectsRef.current.forEach((obj) => {
          // Apply parallax based on depth
          const parallaxX = prefersReducedMotion ? 0 : parallax.x * obj.depth;
          const parallaxY = prefersReducedMotion ? 0 : (parallax.y - parallax.scrollY * 0.1) * obj.depth;

          // Update position with gentle drift
          if (!prefersReducedMotion) {
            obj.x += obj.speedX;
            obj.y += obj.speedY;
            obj.rotation += obj.rotationSpeed;
            obj.wobblePhase += 0.02;
            obj.pulsePhase += 0.015;

            // Wrap around edges
            if (obj.x < -obj.size) obj.x = window.innerWidth + obj.size;
            if (obj.x > window.innerWidth + obj.size) obj.x = -obj.size;
            if (obj.y < -obj.size) obj.y = window.innerHeight + obj.size;
            if (obj.y > window.innerHeight + obj.size) obj.y = -obj.size;
          }

          const wobble = Math.sin(obj.wobblePhase) * 3;
          const pulse = Math.sin(obj.pulsePhase) * 0.15 + 1;
          const x = obj.x + parallaxX + wobble;
          const y = obj.y + parallaxY;
          const size = obj.size * pulse;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(obj.rotation);

          const alpha = 0.1 * obj.depth;

          // Draw different object types
          switch (obj.type) {
            case 'orb':
              drawOrb(ctx, obj, size, alpha);
              break;
            case 'ring':
              drawRing(ctx, obj, size, alpha);
              break;
            case 'faceted':
              drawFaceted(ctx, obj, size, alpha);
              break;
            case 'torus':
              drawTorus(ctx, obj, size, alpha);
              break;
          }

          ctx.restore();
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      // Drawing functions for different object types
      function drawOrb(ctx: CanvasRenderingContext2D, obj: FloatingObject, size: number, alpha: number) {
        // Main gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, `hsla(${obj.hue}, 75%, 65%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${obj.hue}, 65%, 55%, ${alpha * 0.7})`);
        gradient.addColorStop(1, `hsla(${obj.hue}, 55%, 45%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight for 3D depth
        const highlightGradient = ctx.createRadialGradient(
          -size * 0.3,
          -size * 0.3,
          0,
          0,
          0,
          size * 0.7
        );
        highlightGradient.addColorStop(0, `hsla(${obj.hue + 15}, 85%, 85%, ${alpha * 0.5})`);
        highlightGradient.addColorStop(1, `hsla(${obj.hue}, 70%, 70%, 0)`);
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(-size * 0.25, -size * 0.25, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawRing(ctx: CanvasRenderingContext2D, obj: FloatingObject, size: number, alpha: number) {
        const innerRadius = size * 0.6;
        const outerRadius = size;

        // Outer ring
        const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
        gradient.addColorStop(0, `hsla(${obj.hue}, 70%, 60%, 0)`);
        gradient.addColorStop(0.3, `hsla(${obj.hue}, 70%, 60%, ${alpha * 0.8})`);
        gradient.addColorStop(0.7, `hsla(${obj.hue}, 60%, 50%, ${alpha * 0.8})`);
        gradient.addColorStop(1, `hsla(${obj.hue}, 50%, 40%, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = size * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, (innerRadius + outerRadius) / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
        innerGlow.addColorStop(0, `hsla(${obj.hue + 10}, 80%, 70%, ${alpha * 0.3})`);
        innerGlow.addColorStop(1, `hsla(${obj.hue}, 70%, 60%, 0)`);
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawFaceted(ctx: CanvasRenderingContext2D, obj: FloatingObject, size: number, alpha: number) {
        const sides = 6;
        const angleStep = (Math.PI * 2) / sides;

        // Draw faceted polygon with gradient faces
        for (let i = 0; i < sides; i++) {
          const angle1 = i * angleStep;
          const angle2 = (i + 1) * angleStep;
          const midAngle = (angle1 + angle2) / 2;

          const x1 = Math.cos(angle1) * size;
          const y1 = Math.sin(angle1) * size;
          const x2 = Math.cos(angle2) * size;
          const y2 = Math.sin(angle2) * size;

          // Vary brightness based on face angle for 3D effect
          const faceBrightness = 50 + Math.cos(midAngle - obj.rotation) * 20;
          const faceAlpha = alpha * (0.6 + Math.cos(midAngle - obj.rotation) * 0.4);

          const gradient = ctx.createLinearGradient(0, 0, Math.cos(midAngle) * size, Math.sin(midAngle) * size);
          gradient.addColorStop(0, `hsla(${obj.hue}, 70%, ${faceBrightness + 10}%, ${faceAlpha})`);
          gradient.addColorStop(1, `hsla(${obj.hue}, 60%, ${faceBrightness}%, ${faceAlpha * 0.7})`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.fill();
        }

        // Edge highlight
        ctx.strokeStyle = `hsla(${obj.hue + 15}, 80%, 75%, ${alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = i * angleStep;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      function drawTorus(ctx: CanvasRenderingContext2D, obj: FloatingObject, size: number, alpha: number) {
        // Draw elliptical torus shape
        const majorRadius = size;
        const minorRadius = size * 0.25;

        // Top arc
        const topGradient = ctx.createLinearGradient(0, -majorRadius, 0, -majorRadius + minorRadius * 2);
        topGradient.addColorStop(0, `hsla(${obj.hue + 10}, 75%, 70%, ${alpha * 0.9})`);
        topGradient.addColorStop(0.5, `hsla(${obj.hue}, 70%, 60%, ${alpha})`);
        topGradient.addColorStop(1, `hsla(${obj.hue}, 60%, 50%, ${alpha * 0.5})`);

        ctx.strokeStyle = topGradient;
        ctx.lineWidth = minorRadius * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.ellipse(0, 0, majorRadius, majorRadius * 0.4, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Bottom arc (darker)
        const bottomGradient = ctx.createLinearGradient(0, majorRadius - minorRadius * 2, 0, majorRadius);
        bottomGradient.addColorStop(0, `hsla(${obj.hue}, 60%, 50%, ${alpha * 0.5})`);
        bottomGradient.addColorStop(0.5, `hsla(${obj.hue}, 55%, 45%, ${alpha * 0.7})`);
        bottomGradient.addColorStop(1, `hsla(${obj.hue}, 50%, 40%, ${alpha * 0.4})`);

        ctx.strokeStyle = bottomGradient;
        ctx.lineWidth = minorRadius * 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, majorRadius, majorRadius * 0.4, 0, 0, Math.PI);
        ctx.stroke();

        // Center hole shadow
        const holeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, majorRadius * 0.5);
        holeGradient.addColorStop(0, `hsla(${obj.hue - 10}, 50%, 30%, ${alpha * 0.3})`);
        holeGradient.addColorStop(1, `hsla(${obj.hue}, 60%, 50%, 0)`);
        ctx.fillStyle = holeGradient;
        ctx.beginPath();
        ctx.arc(0, 0, majorRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Start animation only if motion is allowed
      if (prefersReducedMotion) {
        // Render a single static frame
        animate();
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      } else {
        animate();
      }

      return () => {
        window.removeEventListener('resize', updateSize);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } catch (error) {
      console.error('FloatingObjectsLayer error:', error);
      setIsSupported(false);
    }
  }, [parallax, prefersReducedMotion]);

  if (!isSupported) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
