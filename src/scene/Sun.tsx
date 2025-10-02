import { TextureLoader } from 'three';
import { useLoader } from "@react-three/fiber";

export function Sun() {

    const textura = useLoader(TextureLoader, "/images/sun.jpg");

    return(
        <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial
                map={textura}
            />
        </mesh>
    );
}