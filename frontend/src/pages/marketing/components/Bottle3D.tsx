/**
 * Bottle3D — lazy-loaded react-three-fiber amber medicine bottle.
 * This file is ONLY imported via React.lazy() in HeroSection,
 * so it is completely code-split from the authenticated app bundle.
 *
 * The component renders inside a fixed-size canvas and responds to
 * mouse position and scroll for a parallax 3D effect.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Bottle3DProps {
  mouseX: number;  // -1..1
  mouseY: number;  // -1..1
  scrollY: number; // raw pixels
}

/* ── Inner scene — the amber bottle geometry ───────────────── */
const BottleScene: React.FC<{ mouseX: number; mouseY: number; scrollY: number }> = ({
  mouseX, mouseY, scrollY,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const capsRef = useRef<THREE.Mesh[]>([]);

  // Smooth interpolated rotation targets
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Mouse-driven rotation
    targetRotation.current.y = mouseX * 0.4;
    targetRotation.current.x = -mouseY * 0.2;

    // Scroll-driven lift
    const scrollShift = -scrollY * 0.002;

    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.06;
    groupRef.current.position.y += (scrollShift - groupRef.current.position.y) * 0.04;

    // Subtle idle bobbing
    const t = performance.now() * 0.001;
    groupRef.current.position.y += Math.sin(t * 0.7) * 0.004 * delta * 60;

    // Rotate capsules
    capsRef.current.forEach((cap, i) => {
      if (cap) cap.rotation.z = t * (0.4 + i * 0.15);
    });
  });

  // Amber material — glass-like transmission
  const glassMat = useMemo(() => ({
    transmission: 0.85,
    thickness: 0.6,
    roughness: 0.08,
    chromaticAberration: 0.04,
    distortionScale: 0.1,
    temporalDistortion: 0.05,
    color: '#C47A1E',   // warm amber
    ior: 1.48,
    backside: false,
  }), []);

  return (
    <group ref={groupRef}>
      {/* Body of bottle */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 2.2, 48, 1, false]} />
        <MeshTransmissionMaterial {...glassMat} />
      </mesh>

      {/* Shoulder taper (top narrowing) */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.22, 0.42, 0.36, 48, 1, false]} />
        <MeshTransmissionMaterial {...glassMat} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.2, 32, 1, false]} />
        <MeshTransmissionMaterial {...glassMat} />
      </mesh>

      {/* Cork stopper */}
      <mesh position={[0, 1.76, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.22, 32]} />
        <meshStandardMaterial color="#8B6244" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Cork top disc */}
      <mesh position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 32]} />
        <meshStandardMaterial color="#9B7254" roughness={0.85} />
      </mesh>

      {/* Inner liquid fill (slightly smaller, more opaque) */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 1.6, 40]} />
        <meshStandardMaterial
          color="#C47A1E"
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Prescription label band */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.455, 0.455, 0.9, 48, 1, true]} />
        <meshStandardMaterial
          color="#F7F5F0"
          roughness={0.8}
          metalness={0.0}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Label text stripe (teal) */}
      <mesh position={[0.43, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.18]} />
        <meshStandardMaterial color="#1B4B43" />
      </mesh>

      {/* Floating mini capsules around bottle */}
      {[
        { x: 0.9, y: 0.8,  z: 0.2, r: [0, 0, 0.5]   },
        { x: -0.85, y: 0.2, z: 0.3, r: [0, 0, -0.8]  },
        { x: 0.75, y: -0.6, z: 0.1, r: [0, 0, 1.2]   },
      ].map((cap, i) => (
        <mesh
          key={i}
          position={[cap.x, cap.y, cap.z]}
          rotation={cap.r as [number, number, number]}
          ref={(el) => { if (el) capsRef.current[i] = el; }}
        >
          <capsuleGeometry args={[0.07, 0.18, 4, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#9C6B2E' : '#1B4B43'}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ── Exported component — Canvas wrapper ───────────────────── */
const Bottle3D: React.FC<Bottle3DProps> = ({ mouseX, mouseY, scrollY }) => {
  return (
    <div style={{ width: 280, height: 460 }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 35 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
        <pointLight position={[-2, 2, 2]} intensity={0.8} color="#C47A1E" />
        <pointLight position={[2, -1, 1]} intensity={0.4} color="#1B4B43" />

        <Environment preset="warehouse" />

        <BottleScene mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      </Canvas>
    </div>
  );
};

export default Bottle3D;
