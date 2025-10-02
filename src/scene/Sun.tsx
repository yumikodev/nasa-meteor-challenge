import * as THREE from 'three';
import { TextureLoader } from 'three';
import { useLoader, useFrame } from "@react-three/fiber"; // Importamos useFrame
import { useRef } from 'react'; // Importamos useRef

// --- Lógica de Escala Integrada ---
const SCALE_FACTOR: number = 1_000_000;
function toScaledValue(realMeasure: number): number {
  return realMeasure / SCALE_FACTOR;
}
// ---------------------------------

export function Sun() {
    // Referencia para acceder a la malla en cada frame
    const meshRef = useRef<THREE.Mesh>(null!); 
    
    // Carga de la textura solar
    const textura = useLoader(TextureLoader, "/images/sun.jpg");

    // Dimensiones físicas del Sol en Kilómetros.
    const SUN_RADIUS_KM = 695700; 
    const scaledRadius = toScaledValue(SUN_RADIUS_KM); 

    // Configuración de la luz
    const LIGHT_INTENSITY = 8000;
    const LIGHT_DISTANCE = 10000; 
    
    // Rotación Axial del Sol
    // El período de rotación ecuatorial es de ~25.38 días.
    // Usaremos una velocidad arbitraria lenta para que la rotación sea visible y estética.
    const SUN_ROTATION_SPEED = 0.005; 

    useFrame(() => {
        if (meshRef.current) {
            // Aplicar rotación constante sobre el eje Y
            meshRef.current.rotation.y += SUN_ROTATION_SPEED;
        }
    });

    // El Sol se coloca en el origen [0, 0, 0] para ser el centro del sistema heliocéntrico.
    return (
        // Usamos ref aquí para que useFrame pueda acceder y rotar la malla
        <mesh position={[0, 0, 0]} ref={meshRef}> 
            {/* 1. FUENTE DE LUZ (PointLight): Emite luz a toda la escena. */}
            <pointLight 
                intensity={LIGHT_INTENSITY} 
                color={0xFFFFFF} 
                distance={LIGHT_DISTANCE}
                decay={2}
            />

            {/* 2. MALLA VISUAL DEL SOL */}
            <sphereGeometry args={[scaledRadius, 64, 64]} />
            
            {/* 3. MATERIAL: Usamos 'emissive' para que el Sol brille visiblemente */}
            <meshStandardMaterial
                map={textura}
                emissive={0xFFDDAA} 
                emissiveIntensity={10} 
            />
        </mesh>
    );
}