import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Earth } from "./Earth";
import { Sun } from "./Sun";
import { Moon } from "./Moon";

// Load space background
function SpaceBackground() {
  const texture = useLoader(THREE.TextureLoader, "/images/scene.jpg");
  return (
    <mesh position={[0, 0, -1000]}>
      <planeGeometry args={[2048, 1024]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraOffset = useRef(new THREE.Vector3(0, 3, 10));

  useFrame(() => {
    if (!target || !controlsRef.current) return;
    
    // Update orbit controls target to follow Earth
    controlsRef.current.target.copy(target.position);
    
    // Camera follows Earth while maintaining offset
    const newPosition = target.position.clone().add(cameraOffset.current);
    camera.position.lerp(newPosition, 0.05); // Smoother camera movement
  });

  const setCameraView = (view: keyof typeof CAMERA_VIEWS) => {
    if (!target) return;
    
    const viewDefinition = CAMERA_VIEWS[view];
    const viewData = typeof viewDefinition === 'function' 
      ? viewDefinition(target.position)
      : viewDefinition;

    // Update camera offset and position
    cameraOffset.current = viewData.position.clone().sub(viewData.target);
    camera.position.copy(viewData.position);
    
    if (controlsRef.current) {
      controlsRef.current.target.copy(viewData.target);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (target) {
      setCameraView('earth'); // Set initial view
    }
  }, [target]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      minDistance={10}
      maxDistance={500}
      zoomSpeed={1}
      rotateSpeed={0.5}
      dampingFactor={0.05}
      enableDamping={true}
    />
  );
}

export function Scene() {
  return (
    <Canvas
      camera={{
        fov: 45,
        position: [0, 100, 300],
        near: 0.1,
        far: 10000
      }}
    >
      {/* Space background */}
      <SpaceBackground />

      {/* Basic lighting */}
      <ambientLight intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      
      {/* Celestial bodies */}
      <Sun />
      <Earth />
      <Moon />

      {/* Simple camera controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={100}
        maxDistance={1000}
      />
    </Canvas>
  );
}