/**
 * Bottle3D (3D Pill Scene) — Hero 3D WebGL scene showcasing the Anti-Gravity Capsule Pill.
 *
 * Features:
 *   • Amber bottle completely removed — 3D Capsule Pill takes center stage.
 *   • Translucent Emerald Green top shell (MeshTransmissionMaterial) + Solid White bottom shell.
 *   • Internal glowing wireframe core & orbiting data particles.
 *   • Scroll-driven dynamic 3D transformation (rotation, scale, CatmullRom spline drift on scroll).
 *   • Mouse inertia parallax tracking.
 *   • Ambient micro-capsules levitating in anti-gravity field.
 */
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  MeshTransmissionMaterial,
  Float,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';

interface Bottle3DProps {
  mouseX: number;   // -1 .. 1
  mouseY: number;   // -1 .. 1
  scrollY: number;  // raw pixels
  reduced?: boolean;
}

/* ─────────────────────────────────────────────────────────── */
/*  Scroll drift curve for the Main 3D Pill                     */
/* ─────────────────────────────────────────────────────────── */
const PILL_SCROLL_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0,      0,      0),
  new THREE.Vector3(-0.25,  -0.5,    0.2),
  new THREE.Vector3( 0.2,   -1.1,    0.1),
  new THREE.Vector3(-0.15,  -1.7,   -0.1),
], false, 'catmullrom', 0.5);

/* ─────────────────────────────────────────────────────────── */
/*  Spring helper for mouse tracking                           */
/* ─────────────────────────────────────────────────────────── */
function useSpring(stiffness = 0.045, damping = 0.84) {
  const state = useRef({ cur: 0, vel: 0, target: 0 });
  function setTarget(t: number) { state.current.target = t; }
  function step(delta: number) {
    const s = state.current;
    const force = (s.target - s.cur) * stiffness;
    s.vel = (s.vel + force) * damping;
    s.cur += s.vel * Math.min(delta * 60, 3);
    return s.cur;
  }
  return { state, setTarget, step };
}

/* ─────────────────────────────────────────────────────────── */
/*  Floating Micro-Capsule definitions                         */
/* ─────────────────────────────────────────────────────────── */
interface MicroCapsuleDef {
  pos: [number, number, number];
  rot: [number, number, number];
  color: string;
  capColor: string;
  floatSpeed: number;
  floatIntensity: number;
  rotationIntensity: number;
  floatRange: [number, number];
}

const MICRO_CAPSULES: MicroCapsuleDef[] = [
  {
    pos: [1.6, 1.1, 0.2],
    rot: [0.4, 0.2, 0.6],
    color: '#1B4B43',
    capColor: '#0D5C3F',
    floatSpeed: 1.5,
    floatIntensity: 0.6,
    rotationIntensity: 0.5,
    floatRange: [-0.2, 0.2],
  },
  {
    pos: [-1.4, -0.6, 0.4],
    rot: [0.2, 0.5, -0.7],
    color: '#0D5C3F',
    capColor: '#ffffff',
    floatSpeed: 1.2,
    floatIntensity: 0.7,
    rotationIntensity: 0.6,
    floatRange: [-0.25, 0.25],
  },
  {
    pos: [1.3, -1.1, 0.3],
    rot: [0.7, 0.1, 1.1],
    color: '#C1791F',
    capColor: '#1B4B43',
    floatSpeed: 1.8,
    floatIntensity: 0.5,
    rotationIntensity: 0.4,
    floatRange: [-0.15, 0.15],
  },
  {
    pos: [-1.2, 1.2, -0.2],
    rot: [-0.3, 0.6, -0.4],
    color: '#1B4B43',
    capColor: '#ffffff',
    floatSpeed: 1.1,
    floatIntensity: 0.65,
    rotationIntensity: 0.55,
    floatRange: [-0.22, 0.22],
  },
];

/* ─────────────────────────────────────────────────────────── */
/*  Main Hero Anti-Gravity Capsule Pill Component               */
/* ─────────────────────────────────────────────────────────── */
const MainHeroPill: React.FC<{
  mouseX: number;
  mouseY: number;
  scrollY: number;
  reduced: boolean;
}> = ({ mouseX, mouseY, scrollY, reduced }) => {
  const pillGroupRef = useRef<THREE.Group>(null);
  const shellGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);

  /* Mouse tilt springs */
  const springRX = useSpring(0.04, 0.82);
  const springRY = useSpring(0.04, 0.82);

  const MAX_SCROLL = 2200;

  useFrame((state, delta) => {
    if (!pillGroupRef.current || !shellGroupRef.current) return;

    /* ── 1. Mouse Tilt Inertia */
    springRX.setTarget(-mouseY * 0.45);
    springRY.setTarget(mouseX * 0.55);
    const rx = springRX.step(delta);
    const ry = springRY.step(delta);

    /* ── 2. Scroll Transformation */
    const progress = Math.min(scrollY / MAX_SCROLL, 1);
    const curvePos = PILL_SCROLL_CURVE.getPoint(progress);

    // Position drift along CatmullRom spline + scroll offset
    pillGroupRef.current.position.x = curvePos.x;
    pillGroupRef.current.position.y = curvePos.y + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.08);
    pillGroupRef.current.position.z = curvePos.z;

    // Dynamic rotation on scroll down — rotates smoothly from diagonal pose to horizontal stream
    const scrollRotX = progress * Math.PI * 0.85;
    const scrollRotY = progress * Math.PI * 1.2;
    const scrollRotZ = progress * Math.PI * 0.4;

    shellGroupRef.current.rotation.x = THREE.MathUtils.damp(
      shellGroupRef.current.rotation.x,
      Math.PI / 3.2 + rx * 0.5 + scrollRotX,
      4,
      delta
    );
    shellGroupRef.current.rotation.y = THREE.MathUtils.damp(
      shellGroupRef.current.rotation.y,
      -Math.PI / 4 + ry * 0.6 + scrollRotY,
      4,
      delta
    );
    shellGroupRef.current.rotation.z = THREE.MathUtils.damp(
      shellGroupRef.current.rotation.z,
      -Math.PI / 6 + scrollRotZ,
      4,
      delta
    );

    // Dynamic scale morph on scroll (slightly expands & tilts forward)
    const scaleFactor = 1 + progress * 0.22;
    pillGroupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Internal core rotation
    if (!reduced && coreRef.current) {
      coreRef.current.rotation.z += delta * 0.6;
      coreRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={pillGroupRef} position={[0, 0, 0]}>
      <Float speed={reduced ? 0 : 2} rotationIntensity={0.4} floatIntensity={0.6}>
        <group ref={shellGroupRef} scale={[1.1, 1.1, 1.1]}>

          {/* ── Top Translucent Emerald Green Capsule Shell */}
          <mesh position={[0, 1.1, 0]}>
            <capsuleGeometry args={[0.95, 1.5, 36, 36]} />
            <MeshTransmissionMaterial
              backside
              samples={16}
              resolution={512}
              transmission={0.94}
              roughness={0.08}
              thickness={0.6}
              ior={1.52}
              color="#0D5C3F"
              chromaticAberration={0.06}
              distortionScale={0.1}
              temporalDistortion={0.05}
            />
          </mesh>

          {/* ── Bottom Porcelain White Capsule Shell */}
          <mesh position={[0, -1.1, 0]}>
            <capsuleGeometry args={[0.95, 1.5, 36, 36]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.18}
              metalness={0.05}
              transmission={0.15}
              thickness={1.1}
              clearcoat={0.6}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* ── Seam Divider Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.952, 0.02, 16, 64]} />
            <meshStandardMaterial color="#0D5C3F" roughness={0.1} metalness={0.3} />
          </mesh>

          {/* ── Animated Internal X-Ray Core */}
          <group ref={coreRef} position={[0, 0.5, 0]}>
            {/* Glowing Wireframe Core */}
            <mesh>
              <icosahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial
                color="#00FFCC"
                emissive="#00AA88"
                emissiveIntensity={2.5}
                wireframe
              />
            </mesh>

            {/* Inner Core Light Node */}
            <pointLight color="#00FFCC" intensity={3} distance={3} />

            {/* Orbiting Data Particles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * 1.05,
                    (i % 2 === 0 ? 0.35 : -0.35),
                    Math.sin(angle) * 1.05,
                  ]}
                >
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#00ffff"
                    emissiveIntensity={3.5}
                  />
                </mesh>
              );
            })}
          </group>

        </group>
      </Float>
    </group>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Micro Floating Capsule Component                            */
/* ─────────────────────────────────────────────────────────── */
const FloatingMicroCapsule: React.FC<{ def: MicroCapsuleDef; reduced: boolean }> = ({ def, reduced }) => {
  if (reduced) {
    return (
      <mesh position={def.pos} rotation={def.rot} scale={0.65}>
        <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
        <meshStandardMaterial color={def.color} roughness={0.2} />
      </mesh>
    );
  }

  return (
    <Float
      position={def.pos}
      rotation={def.rot}
      speed={def.floatSpeed}
      rotationIntensity={def.rotationIntensity}
      floatIntensity={def.floatIntensity}
      floatingRange={def.floatRange}
    >
      <group scale={0.65}>
        <mesh position={[0, 0.18, 0]}>
          <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
          <meshStandardMaterial color={def.capColor} roughness={0.15} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.12, 0.2, 8, 16]} />
          <meshStandardMaterial color={def.color} roughness={0.2} metalness={0.05} />
        </mesh>
      </group>
    </Float>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Dynamic Rim Lights                                         */
/* ─────────────────────────────────────────────────────────── */
const DynamicLights: React.FC<{ mouseX: number; mouseY: number }> = ({ mouseX, mouseY }) => {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 8, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-5, -4, 4]} intensity={1.5} color="#0D5C3F" />
      <pointLight position={[mouseX * 3 + 3, mouseY * -3 + 2, 4]} intensity={1.8} color="#00FFCC" />
    </>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Main Canvas Wrapper Export                                 */
/* ─────────────────────────────────────────────────────────── */
const Bottle3D: React.FC<Bottle3DProps> = ({ mouseX, mouseY, scrollY, reduced = false }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <DynamicLights mouseX={mouseX} mouseY={mouseY} />

        <Environment preset="city" />

        {/* Ambient sparkle particles */}
        {!reduced && (
          <Sparkles
            count={70}
            scale={5}
            size={0.7}
            speed={0.2}
            opacity={0.5}
            color="#00FFCC"
            noise={0.7}
          />
        )}

        {/* Main 3D Anti-Gravity Capsule Pill */}
        <MainHeroPill
          mouseX={mouseX}
          mouseY={mouseY}
          scrollY={scrollY}
          reduced={reduced}
        />

        {/* Ambient Floating Micro-Capsules */}
        {MICRO_CAPSULES.map((def, i) => (
          <FloatingMicroCapsule key={i} def={def} reduced={reduced} />
        ))}
      </Canvas>
    </div>
  );
};

export default Bottle3D;
