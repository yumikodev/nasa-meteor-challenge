import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Earth } from "./Earth";
import { Moon } from "./Moon";
import { Asteroid } from "./Asteroid";
import { Sun } from "./Sun";
import { TextureLoader } from "three";

function SceneBackground() {
  const backgroundTexture = useLoader(TextureLoader, "/images/scene.jpg"); 
  
  const { scene } = useThree();
  
  scene.background = backgroundTexture;

  return null; 
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>

      <SceneBackground />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Objetos */}
      <Sun />
      <Earth />
      <Moon />
      <Asteroid />

      {/* Camera */}
      <OrbitControls />
    </Canvas>
  );
}
