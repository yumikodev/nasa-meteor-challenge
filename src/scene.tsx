// Scene.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      {/* Luz ambiente */}
      <ambientLight intensity={0.5} />

      {/* Luz direccional (simula el sol) */}
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Tierra */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Asteroide */}
      <mesh position={[5, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Cámara interactiva */}
      <OrbitControls />
    </Canvas>
  );
}
