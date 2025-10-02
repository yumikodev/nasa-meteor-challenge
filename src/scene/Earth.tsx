import * as THREE from 'three';
import { TextureLoader } from 'three';
import { useLoader, useFrame } from "@react-three/fiber";
import { useRef } from 'react'; // Eliminamos useMemo para evitar el error de importación no utilizada

// Importa la función combinada. 'getJulianDateFromSimulatedTime' NO se necesita importar aquí.
import { toScaledValue, getEarthPosition } from '../simulation/orbital'; 

// --- Datos de Inclinación Axial ---
// Aproximadamente 23.4 grados a radianes.
const OBLIQUITY_RAD = (23.4 * Math.PI) / 180; 

// Definimos la fecha de inicio de tu simulación (2020)
const START_DATE = new Date('2020-01-01T00:00:00Z'); 

export function EarthOrbiting() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const textura = useLoader(TextureLoader, "/images/earth.jpg");

    // Parámetros de la Tierra
    const EARTH_RADIUS_KM = 6371;
    const scaledRadius = toScaledValue(EARTH_RADIUS_KM);
    
    // **Ajusta este valor para controlar la velocidad de la simulación.**
    const DAYS_PER_SECOND = 60.0; // Ejemplo: 60 días simulados pasan por cada segundo real

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const timeElapsedSeconds = clock.getElapsedTime();
        
        // El tiempo de simulación avanza de 2020 en adelante
        const simulatedDaysElapsed = timeElapsedSeconds * DAYS_PER_SECOND;

        // 1. Obtener la posición orbital propagada (X, Y, Z)
        const newPosition = getEarthPosition(START_DATE, simulatedDaysElapsed);
        
        // 2. Aplicar la posición orbital (movimiento alrededor del Sol)
        // La Tierra se mueve, manteniendo su eje inclinado.
        meshRef.current.position.copy(newPosition);

        // 3. Rotación axial de la Tierra (días/noches)
        // Esta rotación ocurre sobre el eje Y LOCAL del <group> inclinado.
        // Esto crea el movimiento de rotación diario realista.
        meshRef.current.rotation.y += 0.05; 
    });
    
    return (
        // Usamos ref en el <mesh> para controlar su posición ORBITAL.
        // La malla en sí es un contenedor para el grupo inclinado.
        <mesh ref={meshRef}>
            {/* 💡 Nuevo: El <group> aplica la inclinación axial */}
            <group rotation-x={-OBLIQUITY_RAD}>
                <sphereGeometry args={[scaledRadius, 64, 64]} />
                <meshStandardMaterial
                    map={textura}
                />
            </group>
        </mesh>
    );
}