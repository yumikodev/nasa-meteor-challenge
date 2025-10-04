export interface AsteroidResponse {
  asteroids: Asteroid[];
  metadata: {
    totalCount: number;
    hazardousCount: number;
    sentryCount: number;
  };
}

export interface Asteroid {
  id: string;
  name: string;
  closeApproachData: CloseApproachData[];
  metadata: AsteroidMetadata;
}

export interface CloseApproachData {
  closeApproachDate: string;
  relativeVelocity: {
    kilometersPerSecond: number;
    kilometersPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
    miles: number;
  };
  orbitingBody: string;
}

export interface AsteroidMetadata {
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  missDistance: {
    km: number;
    astronomical: number;
    lunar: number;
  };
  absoluteMagnitude: number;
  estimatedDiameter: {
    min: number;
    max: number;
  };
}
