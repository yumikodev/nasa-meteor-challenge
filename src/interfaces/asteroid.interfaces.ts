// src/interfaces/asteroid.interfaces.ts

export interface AsteroidDetail {
  id: string;
  name: string;
  designation: string;
  closeApproachData: CloseApproachDataDetail[];
  orbitalData: OrbitalData;
  metadata: AsteroidMetadataDetail;
}

export interface CloseApproachDataDetail {
  closeApproachDate: string; // fecha ISO
  relativeVelocity: {
    kmPerSec: number;
    kmPerHour: number;
  };
  missDistance: {
    astronomical: number; // AU
    lunar: number; // LD
    km: number; // km
    miles: number; // mi
  };
  orbitingBody: string; // cuerpo al que se acerca
}

export interface OrbitalData {
  orbitId: string;
  firstObservation: string; // primera observación
  lastObservation: string;  // última observación
  observationsUsed: number;
  orbitUncertainty: string;
  eccentricity: number; // excentricidad orbital
  semiMajorAxisAU: number; // eje mayor en AU
  inclinationDeg: number; // inclinación en grados
  ascendingNodeDeg: number; // nodo ascendente
  orbitalPeriodDays: number; // período en días
  perihelionDistanceAU: number;
  aphelionDistanceAU: number;
  meanAnomalyDeg: number;
  meanMotionDegPerDay: number;
  orbitClass: {
    type: string;
    description: string;
  };
}

export interface AsteroidMetadataDetail {
  nasaJplUrl: string;
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  absoluteMagnitude: number;
  estimatedDiameterKm: {
    min: number;
    max: number;
  };
}
