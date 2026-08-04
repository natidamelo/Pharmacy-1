/**
 * Bottle3D — lazy-loaded react-three-fiber amber medicine bottle.
 * Code-split via React.lazy() — never enters the authenticated app bundle.
 *
 * Features:
 *   • Anti-gravity capsule levitation via <Float> with async offsets
 *   • Spring-physics mouse inertia (low stiffness, high damping)
 *   • Scroll-driven CatmullRom curved drift path
 *   • <Sparkles> ambient micro-particle field
 *   • Dynamic rim lights that shift with mouse position
 *   • prefers-reduced-motion: animations halted, static pose shown
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  MeshTransmissionMaterial,
  Float,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                       */
/* ─────────────────────────────────────────────────────────── */
interface Bottle3DProps {
  mouseX: number;   // -1 .. 1
  mouseY: number;   // -1 .. 1
  scrollY: number;  // raw pixels
  reduced?: boolean;
}

/* ─────────────────────────────────────────────────────────── */
/*  Scroll drift curve                                          */
/*  The bottle group follows this path as the user scrolls.    */
/* ─────────────────────────────────────────────────────────── */
const SCROLL_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0,    0,     0),
  new THREE.Vector3( 0.3,  -0.6,  0.15),
  new THREE.Vector3(-0.15, -1.2,  0.05),
  new THREE.Vector3( 0.1,  -1.8, -0.1),
], false, 'catmullrom', 0.5);

/* ─────────────────────────────────────────────────────────── */
/*  Spring helper — stores velocity + current value            */
/* ─────────────────────────────────────────────────────────── */
function useSpring(stiffness = 0.04, damping = 0.82) {
  const state = useRef({ cur: 0, vel: 0, target: 0 });
  function setTarget(t: number) { state.current.target = t; }
  function step(delta: number) {
    const s = state.current;
    const force = (s.target - s.cur) * stiffness;
    s.vel = (s.vel + force) * damping;
    s.cur += s.vel * Math.min(delta * 60, 3); // clamp big deltas
    return s.cur;
  }
  return { state, setTarget, step };
}

/* ─────────────────────────────────────────────────────────── */
/*  Amber glass material props                                  */
/* ─────────────────────────────────────────────────────────── */
const GLASS = {
  transmission:       0.88,
  thickness:          0.65,
  roughness:          0.06,
  chromaticAberration: 0.05,
  distortionScale:    0.08,
  temporalDistortion: 0.04,
  color:              '#C47A1E',
  ior:                1.49,
  backside:           false,
} as const;

/* ─────────────────────────────────────────────────────────── */
/*  Capsule pill definitions                                    */
/* ─────────────────────────────────────────────────────────── */
interface CapsuleDef {
  pos:       [number, number, number];
  rot:       [number, number, number];
  color:     string;
  capColor:  string;
  floatSpeed:   number;
  floatIntensity: number;
  rotationIntensity: number;
  floatRange: [number, number];
}

const CAPSULES: CapsuleDef[] = [
  {
    pos:               [ 1.05,  0.85,  0.3],
    rot:               [ 0.3,   0.2,   0.5],
    color:             '#9C6B2E',
    capColor:          '#C47A1E',
    floatSpeed:        1.4,
    floatIntensity:    0.55,
    rotationIntensity: 0.45,
    floatRange:        [-0.18, 0.18],
  },
  {
    pos:               [-0.95,  0.25,  0.4],
    rot:               [ 0.1,   0.4,  -0.8],
    color:             '#1B4B43',
    capColor:          '#246059',
    floatSpeed:        1.0,
    floatIntensity:    0.7,
    rotationIntensity: 0.6,
    floatRange:        [-0.22, 0.22],
  },
  {
    pos:               [ 0.8,  -0.75,  0.2],
    rot:               [ 0.6,   0.1,   1.2],
    color:             '#7A4A1C',
    capColor:          '#9C6B2E',
    floatSpeed:        1.6,
    floatIntensity:    0.5,
    rotationIntensity: 0.35,
    floatRange:        [-0.15, 0.15],
  },
  {
    pos:               [-0.6,  -0.9,   0.5],
    rot:               [-0.4,   0.5,  -0.3],
    color:             '#1B4B43',
    capColor:          '#4C9E8C',
    floatSpeed:        1.2,
    floatIntensity:    0.65,
    rotationIntensity: 0.5,
    floatRange:        [-0.2, 0.2],
  },
  {
    pos:               [ 1.2,  -0.2,   0.1],
    rot:               [ 0.9,  -0.3,   0.7],
    color:             '#C47A1E',
    capColor:          '#8B5E14',
    floatSpeed:        0.9,
    floatIntensity:    0.6,
    rotationIntensity: 0.4,
    floatRange:        [-0.25, 0.25],
  },
];

/* ─────────────────────────────────────────────────────────── */
/*  Internal Core X-Ray Reveal Pill                             */
/* ─────────────────────────────────────────────────────────── */
const HeroCorePill: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  const coreRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!reduced && coreRef.current) {
      coreRef.current.rotation.z += delta * 0.5;
      coreRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.55} floatIntensity={0.8} position={[-0.85, 0.45, 0.6]} rotation={[0.4, 0.3, -0.5]}>
      <group scale={[0.42, 0.42, 0.42]}>
        {/* Top Green/Teal Transmission Shell Half */}
        <mesh position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.7, 1, 32, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.92}
            roughness={0.12}
            thickness={0.5}
            ior={1.5}
            color="#1B4B43"
          />
        </mesh>

        {/* Bottom White Shell Half */}
        <mesh position={[0, -0.75, 0]}>
          <capsuleGeometry args={[0.7, 1, 32, 32]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.2}
            transmission={0.2}
            thickness={1}
          />
        </mesh>

        {/* Animated Internal Core (X-Ray Reveal Effect) */}
        <group ref={coreRef}>
          {/* Glowing Central Workflow Core */}
          <mesh>
            <icosahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial
              color="#00ffcc"
              emissive="#00aa88"
              emissiveIntensity={2}
              wireframe
            />
          </mesh>

          {/* Orbiting Mini Data Particles */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.75,
                  i % 2 === 0 ? 0.25 : -0.25,
                  Math.sin(angle) * 0.75,
                ]}
              >
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#00ffff"
                  emissiveIntensity={3}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </Float>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Single floating capsule                                     */
/* ─────────────────────────────────────────────────────────── */
const AntiGravityCapsule: React.FC<{ def: CapsuleDef; reduced: boolean }> = ({ def, reduced }) => {
  if (reduced) {
    return (
      <mesh position={def.pos} rotation={def.rot}>
        <capsuleGeometry args={[0.07, 0.22, 6, 14]} />
        <meshStandardMaterial color={def.color} roughness={0.25} metalness={0.08} />
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
      {/* Cap half A */}
      <mesh position={[0, 0.11, 0]}>
        <capsuleGeometry args={[0.065, 0.1, 6, 14]} />
        <meshStandardMaterial
          color={def.capColor}
          roughness={0.18}
          metalness={0.12}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Cap half B */}
      <mesh position={[0, -0.11, 0]}>
        <capsuleGeometry args={[0.065, 0.1, 6, 14]} />
        <meshStandardMaterial
          color={def.color}
          roughness={0.22}
          metalness={0.08}
          envMapIntensity={1.0}
        />
      </mesh>
    </Float>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Dynamic rim lights — shift softly with mouse               */
/* ─────────────────────────────────────────────────────────── */
const RimLights: React.FC<{ mouseX: number; mouseY: number }> = ({ mouseX, mouseY }) => {
  const rimA = useRef<THREE.PointLight>(null);
  const rimB = useRef<THREE.PointLight>(null);

  const txA = useSpring(0.035, 0.85);
  const tyA = useSpring(0.035, 0.85);
  const txB = useSpring(0.03,  0.88);

  useFrame((_, delta) => {
    txA.setTarget(mouseX * 1.8 + 2.5);
    tyA.setTarget(mouseY * -1.2 + 2.0);
    txB.setTarget(mouseX * -1.5 - 2.2);

    const ax = txA.step(delta);
    const ay = tyA.step(delta);
    const bx = txB.step(delta);

    if (rimA.current) {
      rimA.current.position.set(ax, ay, 1.8);
      rimA.current.intensity = 0.7 + mouseX * 0.15;
    }
    if (rimB.current) {
      rimB.current.position.set(bx, -1.0, 2.0);
      rimB.current.intensity = 0.45 + mouseY * 0.1;
    }
  });

  return (
    <>
      {/* Warm amber rim */}
      <pointLight ref={rimA} color="#D4922C" distance={8} decay={2} />
      {/* Cool teal counter-rim */}
      <pointLight ref={rimB} color="#4C9E8C" distance={8} decay={2} />
    </>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Main bottle group + physics root                           */
/* ─────────────────────────────────────────────────────────── */
const BottleScene: React.FC<{
  mouseX: number;
  mouseY: number;
  scrollY: number;
  reduced: boolean;
}> = ({ mouseX, mouseY, scrollY, reduced }) => {
  const groupRef  = useRef<THREE.Group>(null);
  const bottleRef = useRef<THREE.Group>(null);

  /* Spring state for bottle group mouse tilt */
  const springRY = useSpring(0.04, 0.82);
  const springRX = useSpring(0.04, 0.82);

  /* Idle bob accumulator */
  const bobAcc = useRef(0);

  /* Scroll normalisation — max effect at ~2000 px scroll */
  const MAX_SCROLL = 2000;

  useFrame((_, delta) => {
    if (!groupRef.current || !bottleRef.current) return;

    /* ── 1. Spring-physics mouse tilt on bottle group */
    springRY.setTarget(mouseX * 0.38);
    springRX.setTarget(-mouseY * 0.18);
    const ry = springRY.step(delta);
    const rx = springRX.step(delta);

    bottleRef.current.rotation.y = ry;
    bottleRef.current.rotation.x = rx;

    /* ── 2. Idle anti-gravity bob on the entire scene group */
    if (!reduced) {
      bobAcc.current += delta;
      const bob = Math.sin(bobAcc.current * 0.65) * 0.06
                + Math.sin(bobAcc.current * 1.1)  * 0.02;
      groupRef.current.position.y = bob;
    }

    /* ── 3. Scroll-driven CatmullRom drift */
    const t01 = Math.min(scrollY / MAX_SCROLL, 1);
    const curvePoint = SCROLL_CURVE.getPoint(t01);

    groupRef.current.position.x = curvePoint.x;
    groupRef.current.position.y += (curvePoint.y - groupRef.current.position.y) * 0.04;
    groupRef.current.position.z  = curvePoint.z;

    /* Gentle free-tumble rotation in scroll space */
    if (!reduced) {
      groupRef.current.rotation.z = t01 * 0.35 + Math.sin(t01 * Math.PI) * 0.12;
    }
  });

  const glassMat = useMemo(() => GLASS, []);

  return (
    <group ref={groupRef}>
      {/* ── Sparkles micro-particle field */}
      {!reduced && (
        <Sparkles
          count={60}
          scale={3.8}
          size={0.6}
          speed={0.18}
          opacity={0.45}
          color="#C47A1E"
          noise={0.6}
        />
      )}

      {/* ── Rim lights */}
      <RimLights mouseX={mouseX} mouseY={mouseY} />

      {/* ── Bottle geometry */}
      <group ref={bottleRef}>
        {/* Body */}
        <mesh>
          <cylinderGeometry args={[0.42, 0.45, 2.2, 52, 1, false]} />
          <MeshTransmissionMaterial {...glassMat} />
        </mesh>

        {/* Shoulder taper */}
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[0.22, 0.42, 0.36, 52, 1, false]} />
          <MeshTransmissionMaterial {...glassMat} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.56, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.2, 36, 1, false]} />
          <MeshTransmissionMaterial {...glassMat} />
        </mesh>

        {/* Cork */}
        <mesh position={[0, 1.76, 0]}>
          <cylinderGeometry args={[0.2, 0.18, 0.22, 36]} />
          <meshStandardMaterial color="#8B6244" roughness={0.88} metalness={0.02} />
        </mesh>
        <mesh position={[0, 1.88, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 36]} />
          <meshStandardMaterial color="#9B7254" roughness={0.82} />
        </mesh>

        {/* Liquid fill */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.36, 0.38, 1.6, 44]} />
          <meshStandardMaterial
            color="#C47A1E" roughness={0.08} metalness={0.12}
            transparent opacity={0.58}
          />
        </mesh>

        {/* Label band */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.456, 0.456, 0.92, 52, 1, true]} />
          <meshStandardMaterial
            color="#F7F5F0" roughness={0.78} metalness={0}
            transparent opacity={0.93} side={THREE.FrontSide}
          />
        </mesh>

        {/* Label stripe */}
        <mesh position={[0.435, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.92, 0.2]} />
          <meshStandardMaterial color="#1B4B43" side={THREE.FrontSide} />
        </mesh>
      </group>

      {/* ── Featured Anti-Gravity Hero Core Pill with Transmission Shell & Orbiting Data Particles */}
      <HeroCorePill reduced={reduced} />

      {/* ── Anti-gravity floating capsules */}
      {CAPSULES.map((def, i) => (
        <AntiGravityCapsule key={i} def={def} reduced={reduced} />
      ))}
    </group>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Canvas wrapper                                              */
/* ─────────────────────────────────────────────────────────── */
const Bottle3D: React.FC<Bottle3DProps> = ({ mouseX, mouseY, scrollY, reduced = false }) => {
  return (
    <div style={{ width: 320, height: 500 }}>
      <Canvas
        camera={{ position: [0, 0.2, 4.8], fov: 34 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Base lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />

        {/* Fill light from below */}
        <pointLight position={[0, -3, 2]} intensity={0.3} color="#F7F5F0" />

        {/* Environment for glass reflections */}
        <Environment preset="warehouse" />

        <BottleScene
          mouseX={mouseX}
          mouseY={mouseY}
          scrollY={scrollY}
          reduced={reduced}
        />
      </Canvas>
    </div>
  );
};

export default Bottle3D;
