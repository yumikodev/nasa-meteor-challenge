export function Asteroid() {
    return(
        <mesh position={[6, 0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="gray" />
        </mesh>
    );
}