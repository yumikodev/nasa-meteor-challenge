import { TextureLoader } from 'three';
import { useLoader } from "@react-three/fiber";
import { toScaledValue, OrbitalElements, getOrbitalPosition } from '../simulation/orbital';

export function Moon() {

    const textura = useLoader(TextureLoader, "/images/moon.jpg");

    return(
        <mesh position={[4, 0, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
                map={textura}
            />
        </mesh>
    );
}