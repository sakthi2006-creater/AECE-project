import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00d4ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

function CSSParticleBackground() {
  const particles = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    })),
  []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#050a14] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a14] via-[#0a1020] to-[#050a14]" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
            boxShadow: `0 0 ${p.size * 2}px #00d4ff`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent" />
    </div>
  );
}

export function ThreeBackground() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (webglSupported === null) {
    return <div className="fixed inset-0 z-[-1] bg-[#050a14]" />;
  }

  if (!webglSupported) {
    return <CSSParticleBackground />;
  }

  return (
    <div className="fixed inset-0 z-[-1] bg-[#050a14] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        onError={() => setWebglSupported(false)}
        gl={{ failIfMajorPerformanceCaveat: false, powerPreference: 'low-power' }}
      >
        <ParticleCloud />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent z-0" />
    </div>
  );
}
