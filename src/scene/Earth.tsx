import { TextureLoader } from 'three';
import { useLoader } from "@react-three/fiber";
import { toScaledValue, OrbitalElements, getOrbitalPosition } from '../simulation/orbital';


export function Earth() {
    
    const textura = useLoader(TextureLoader, "/images/earth.jpg");

    return (
        <mesh position={[2, 0, 0]} >
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                map={textura}
            />
        </mesh>
    );
}