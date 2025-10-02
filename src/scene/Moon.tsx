import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { 
  toScaledValue, 
  getEarthPosition, 
  getMoonRelativePosition,
  ASTRONOMICAL_CONSTANTS 
} from "../simulation/orbital";

const START_DATE = new Date("2025-01-01T00:00:00Z");
const DAYS_PER_SECOND = 1; // 1 day per second

// Use constants from orbital.ts
const {
  MOON_RADIUS_KM,
  MOON_DISTANCE_KM,
  MOON_ORBIT_TILT,
  MOON_SYNODIC_PERIOD
} = ASTRONOMICAL_CONSTANTS;

// Visualization scaling
const SCALED_RADIUS = toScaledValue(MOON_RADIUS_KM) * 2;
const SCALED_DISTANCE = toScaledValue(MOON_DISTANCE_KM) * 0.1;
const ORBIT_SEGMENTS = 180; // Smooth moon orbit

export function Moon() {
  const groupRef = useRef<THREE.Group>(null);

  // Load Moon texture
  const moonTexture = useLoader(THREE.TextureLoader, '/images/moon.jpg');
  const meshRef = useRef<THREE.Mesh>(null);



  // Create Moon's orbit visualization
  const orbitGeometry = useMemo(() => {
    const points = [];
    
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const angle = (i / ORBIT_SEGMENTS) * 2 * Math.PI;
      const inclination = (MOON_ORBIT_TILT * Math.PI) / 180;
      const x = SCALED_DISTANCE * Math.cos(angle);
      const y = SCALED_DISTANCE * Math.sin(angle) * Math.sin(inclination);
      const z = SCALED_DISTANCE * Math.sin(angle) * Math.cos(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const simulatedDays = elapsed * DAYS_PER_SECOND;
    const earthPos = getEarthPosition(START_DATE, simulatedDays);

    if (groupRef.current && meshRef.current) {
      // Get Moon's position relative to Earth using orbital calculations
      const moonRelativePos = getMoonRelativePosition(simulatedDays);
      const moonWorldPos = earthPos.clone().add(moonRelativePos);
      
      // Update Moon's position
      groupRef.current.position.copy(moonWorldPos);
      
      // Update Moon's rotation (tidally locked to Earth)
      const synodicAngle = (simulatedDays / MOON_SYNODIC_PERIOD) * 2 * Math.PI;
      meshRef.current.rotation.y = synodicAngle;
    }
  });

  return (
    <>
      {/* Moon's orbit around Earth */}
      <primitive object={new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.2, transparent: true })
      )} position={getEarthPosition(START_DATE, 0)} />
      
      <group ref={groupRef}>
        {/* Moon sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[SCALED_RADIUS, 32, 32]} />
          <meshBasicMaterial
            map={moonTexture}
          />
        </mesh>

        <Html position={[0, SCALED_RADIUS * 1.5, 0]}>
          <div style={{ 
            color: 'white', 
            background: '#00000080', 
            padding: '5px', 
            borderRadius: '3px',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            Moon
          </div>
        </Html>
      </group>
    </>
  );
}