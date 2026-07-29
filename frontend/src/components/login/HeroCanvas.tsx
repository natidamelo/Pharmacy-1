import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PharmacyScene } from './PharmacyScene';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

/* ── Gradient placeholder shown while 3D bundle loads ──────────────── */
function CanvasPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      {/* Animated ring pulse */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '2px solid rgba(13,148,136,0.3)',
          animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
        }}
      />
    </div>
  );
}

export function HeroCanvas() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Suspense fallback={<CanvasPlaceholder />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          shadows
        >
          <PharmacyScene
            mouseX={mouse.x}
            mouseY={mouse.y}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          {/* Allow gentle orbit on desktop only if not reduced motion */}
          {!isMobile && !reducedMotion && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.4}
              maxPolarAngle={Math.PI * 0.65}
              minPolarAngle={Math.PI * 0.35}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
