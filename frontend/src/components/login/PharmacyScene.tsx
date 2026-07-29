import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface PharmacySceneProps {
  mouseX: number;
  mouseY: number;
  isMobile: boolean;
  reducedMotion: boolean;
}

/* ─── Pill (Capsule) ─────────────────────────────────────────────────── */
function Pill({
  position,
  rotation,
  color,
  reducedMotion,
  speed = 1,
  floatAmplitude = 0.4,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  reducedMotion: boolean;
  speed?: number;
  floatAmplitude?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    mesh.current.rotation.x += delta * 0.3 * speed;
    mesh.current.rotation.z += delta * 0.15 * speed;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : speed * 1.5}
      rotationIntensity={reducedMotion ? 0 : 0.4}
      floatIntensity={reducedMotion ? 0 : floatAmplitude}
    >
      <mesh ref={mesh} position={position} rotation={rotation} castShadow>
        {/* CapsuleGeometry: radius, length, cap segs, radial segs */}
        <capsuleGeometry args={[0.22, 0.6, 8, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.6}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

/* ─── Molecule (sphere cluster + connector rods) ──────────────────────── */
function Molecule({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null!);

  const atoms: Array<{ pos: [number, number, number]; r: number; color: string }> = useMemo(
    () => [
      { pos: [0, 0, 0],       r: 0.28, color: '#0d9488' },  // central — teal (brand core)
      { pos: [0.75, 0.45, 0.2],  r: 0.16, color: '#818CF8' },  // violet satellite
      { pos: [-0.7, 0.4, -0.1],  r: 0.16, color: '#6366F1' },  // indigo satellite
      { pos: [0.3, -0.7, 0.3],   r: 0.14, color: '#34d399' },  // teal satellite
      { pos: [-0.4, -0.6, -0.3], r: 0.13, color: '#818CF8' },  // violet satellite
      { pos: [0.6, -0.3, -0.6],  r: 0.12, color: '#6366F1' },  // indigo satellite
    ],
    []
  );

  // Bond between atom[0] and each satellite
  const bonds = useMemo(() => {
    return atoms.slice(1).map((a) => {
      const start = new THREE.Vector3(...atoms[0].pos);
      const end = new THREE.Vector3(...a.pos);
      const dir = end.clone().sub(start);
      const len = dir.length();
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return { mid, len, quat };
    });
  }, [atoms]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.18;
    group.current.rotation.x = Math.sin(t * 0.12) * 0.2;
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      {atoms.map((a, i) => (
        <mesh key={i} position={a.pos}>
          <sphereGeometry args={[a.r, 32, 32]} />
          <meshStandardMaterial
            color={a.color}
            roughness={0.1}
            metalness={0.5}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
      {bonds.map((b, i) => (
        <mesh key={`bond-${i}`} position={b.mid} quaternion={b.quat}>
          <cylinderGeometry args={[0.03, 0.03, b.len, 8]} />
          <meshStandardMaterial color="#0d9488" roughness={0.3} metalness={0.4} opacity={0.7} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Torus Knot accent ──────────────────────────────────────────────── */
function TorusKnotAccent({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.08;
    mesh.current.rotation.y = t * 0.12;
  });

  return (
    <mesh ref={mesh} position={[2.5, -1.2, -2]} scale={0.55}>
      <torusKnotGeometry args={[1, 0.28, 128, 16, 2, 3]} />
      {/* Indigo/violet — secondary accent on 3D rim element */}
      <MeshDistortMaterial
        color="#6366F1"
        roughness={0.18}
        metalness={0.75}
        distort={reducedMotion ? 0 : 0.15}
        speed={reducedMotion ? 0 : 1.5}
        opacity={0.55}
        transparent
      />
    </mesh>
  );
}

/* ─── Floating ring of small spheres ─────────────────────────────────── */
function SphereRing({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const count = 8;

  const positions = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, -0.5] as [number, number, number];
    }), [count]
  );

  useFrame((state) => {
    if (reducedMotion) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={group}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06 + (i % 3) * 0.025, 16, 16]} />
          {/* Alternate teal / indigo on ring beads */}
          <meshStandardMaterial
            color={i % 2 === 0 ? '#0d9488' : '#818CF8'}
            roughness={0.1}
            metalness={0.8}
            opacity={0.6 + (i % 3) * 0.1}
            transparent
          />
        </mesh>
      ))}
      {/* Torus ring — violet trace */}
      <Torus args={[2.1, 0.025, 8, 64]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#818CF8" opacity={0.22} transparent metalness={0.9} roughness={0.1} />
      </Torus>
    </group>
  );
}

/* ─── Main Scene ─────────────────────────────────────────────────────── */
export function PharmacyScene({ mouseX, mouseY, isMobile, reducedMotion }: PharmacySceneProps) {
  const { camera } = useThree();

  useFrame(() => {
    if (reducedMotion || isMobile) return;
    // Subtle parallax: nudge camera slightly toward mouse
    camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Lighting — teal key + indigo/violet rim lights */}
      <ambientLight intensity={0.35} />
      {/* Key light: warm teal, main illumination */}
      <pointLight position={[5, 5, 5]}   intensity={55} color="#34d399" />
      {/* Rim light: indigo — secondary accent colour family */}
      <pointLight position={[-5, -3, 3]} intensity={45} color="#6366F1" />
      {/* Fill light: violet — adds depth, picks up on satellite spheres */}
      <pointLight position={[0, 8, -4]}  intensity={35} color="#818CF8" />
      {/* Neutral directional for shadows */}
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#ffffff" castShadow />

      {/* Central molecule */}
      <Molecule reducedMotion={reducedMotion} />

      {/* Pill cluster — two teal, two indigo/violet */}
      <Pill position={[-1.8, 0.6, 0.4]}  rotation={[0.8, 0.4, 0.2]}  color="#0F6E5C" reducedMotion={reducedMotion} speed={0.8}  floatAmplitude={0.5}  />
      <Pill position={[1.9, -0.5, 0.2]}  rotation={[0.3, 1.1, 0.6]}  color="#6366F1" reducedMotion={reducedMotion} speed={1.1}  floatAmplitude={0.35} />
      <Pill position={[0.4, 1.8, -0.5]}  rotation={[1.2, 0.2, 0.9]}  color="#818CF8" reducedMotion={reducedMotion} speed={0.65} floatAmplitude={0.6}  />
      <Pill position={[-0.8, -1.6, 0.6]} rotation={[0.5, 0.8, 1.4]}  color="#0d9488" reducedMotion={reducedMotion} speed={0.9}  floatAmplitude={0.45} />

      {/* Sphere ring */}
      <SphereRing reducedMotion={reducedMotion} />

      {/* Background torus knot accent */}
      {!isMobile && <TorusKnotAccent reducedMotion={reducedMotion} />}
    </>
  );
}
