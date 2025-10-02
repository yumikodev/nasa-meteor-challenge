import { useRef, forwardRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { 
  getEarthPosition, 
  toScaledValue, 
  getEarthOrbitalElements,
  getJulianDateFromSimulatedTime,
  KM_PER_AU
} from "../simulation/orbital";

const START_DATE = new Date("2025-01-01T00:00:00Z");
const DAYS_PER_SECOND = 1;         // Simulation speed: 1 day per second

// Earth constants with real astronomical data
const EARTH_RADIUS_KM = 6371;      // Real Earth radius in km
const EARTH_TILT = 23.4366;        // Axial tilt in degrees
const EARTH_SIDEREAL_DAY = 23.9344696; // hours
// Visualization scaling
const SCALED_RADIUS = toScaledValue(EARTH_RADIUS_KM) * 2; // Make Earth visible but not too large
const ORBIT_SEGMENTS = 360; // Smooth orbit line

const Earth = forwardRef<THREE.Group>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Load Earth texture with error handling
  const earthTexture = useMemo(() => {
    try {
      const texture = useLoader(THREE.TextureLoader, '/images/earth.jpg');
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    } catch (error) {
      console.error('Failed to load Earth texture:', error);
      return null;
    }
  }, []);

  // Calculate Earth's rotation speed (sidereal day)
  const ROTATION_PER_SECOND = (2 * Math.PI) / (EARTH_SIDEREAL_DAY * 3600);

  // Create Earth's orbit visualization using real orbital elements
  const orbitGeometry = useMemo(() => {
    const points = [];
    const JD = getJulianDateFromSimulatedTime(START_DATE, 0);
    const elements = getEarthOrbitalElements(JD);
    
    // Create a full elliptical orbit path
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const angle = (i / ORBIT_SEGMENTS) * 2 * Math.PI;
      
      // Calculate radius using the orbit's eccentricity
      const radius = (elements.a * (1 - elements.e * elements.e)) / (1 + elements.e * Math.cos(angle));
      
      // Convert to cartesian coordinates (in AU)
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      // Scale to our visualization size (convert AU to km then to scene units)
      const scaledX = toScaledValue(x * KM_PER_AU);
      const scaledZ = toScaledValue(z * KM_PER_AU);
      
      points.push(new THREE.Vector3(scaledX, 0, scaledZ));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const simulatedDays = elapsed * DAYS_PER_SECOND;
    const pos = getEarthPosition(START_DATE, simulatedDays);

    if (groupRef.current) {
      // Update Earth's orbital position
      groupRef.current.position.copy(pos);
    }

    if (meshRef.current) {
      // Update Earth's rotation on its axis
      meshRef.current.rotation.y += ROTATION_PER_SECOND * DAYS_PER_SECOND;
    }
  });

  return (
    <group ref={ref}>
      {/* Simplified Earth's orbit */}
      <primitive object={new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: "#4444ff", opacity: 0.3, transparent: true })
      )} />
      
      <group ref={groupRef}>
        {/* Earth sphere with axial tilt */}
        <group rotation={[0, 0, (EARTH_TILT * Math.PI) / 180]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[SCALED_RADIUS, 32, 32]} />
            <meshStandardMaterial
              map={earthTexture}
              metalness={0}
              roughness={0.5}
              envMapIntensity={1.5}
              metalness={0.3}
              roughness={0.7}
              flatShading
            />
          </mesh>
        </group>
        
        <Html position={[0, SCALED_RADIUS * 1.5, 0]}>
          <div style={{ 
            color: 'white', 
            background: '#00000080', 
            padding: '5px', 
            borderRadius: '3px',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            Earth
          </div>
        </Html>
      </group>
    </group>
  );
});

export { Earth };
