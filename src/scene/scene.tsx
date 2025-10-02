import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// Asumiendo que has renombrado EarthOrbiting a Earth en su archivo:
import { EarthOrbiting as Earth } from "./Earth"; 
// ^^^ Nota: Asegúrate de que el nombre del componente exportado coincida con tu importación.
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
    <Canvas 
      // 1. Alejar la posición de la cámara
      // La Tierra está a ~1500 unidades. Necesitamos ver todo el sistema.
      camera={{ 
        position: [3000, 3000, 3000], // Posición inicial lejos del origen
        fov: 60, 
        near: 0.1, 
        far: 10000 // 2. Aumentar el plano lejano para ver objetos distantes
      }}
      // Aquí se habilita el sistema de coordenadas.
    >
      <SceneBackground />

      {/* Iluminación: El Sol es la fuente de luz principal, no la ambientLight */}
      <ambientLight intensity={0.1} />
      {/* Luz direccional que puede simular la luz solar, aunque el componente Sun debería tener una luz propia */}
      <directionalLight position={[0, 0, 0]} intensity={2} /> 

      {/* Objetos */}
      <Sun />
      <Earth />
      <Moon />
      <Asteroid />

      {/* Camera: Hacemos que OrbitControls se centre en el origen (el Sol) */}
      <OrbitControls target={[0, 0, 0]} />
    </Canvas>
  );
}