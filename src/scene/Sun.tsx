import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { toScaledValue, ASTRONOMICAL_CONSTANTS } from "../simulation/orbital";

// Use constants from orbital.ts
const { SUN_RADIUS_KM, SUN_ROTATION_PERIOD } = ASTRONOMICAL_CONSTANTS;

// Visual scaling (smaller than real size for better visualization)
const SCALED_RADIUS = toScaledValue(SUN_RADIUS_KM) * 0.5;

export function Sun() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Load Sun texture
  const sunTexture = useLoader(THREE.TextureLoader, '/images/sun.jpg');
  
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (meshRef.current) {
      // Rotate Sun at proper speed (27 day period at equator)
      meshRef.current.rotation.y += (2 * Math.PI) / (SUN_ROTATION_PERIOD * 24 * 60 * 60);
    }

    // Animate corona
    if (groupRef.current) {
      const children = groupRef.current.children;
      children.forEach((child, i) => {
        if (i > 0) { // Skip the main Sun mesh
          child.rotation.y = elapsed * 0.1;
          child.rotation.z = elapsed * 0.15;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Sun sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[SCALED_RADIUS, 32, 32]} />
        <meshBasicMaterial
          map={sunTexture}
        />
      </mesh>

      {/* Simple glow effect */}
      <mesh>
        <sphereGeometry args={[SCALED_RADIUS * 1.2, 32, 32]} />
        <meshBasicMaterial
          color="#FFF176"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Basic light source */}
      <pointLight
        intensity={1.5}
        distance={0}
        decay={2}
      />

      <Html position={[0, SCALED_RADIUS * 2, 0]}>
        <div style={{ 
          color: 'white',
          background: '#00000080',
          padding: '5px',
          borderRadius: '3px',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          Sun
        </div>
      </Html>
    </group>
  );
}
