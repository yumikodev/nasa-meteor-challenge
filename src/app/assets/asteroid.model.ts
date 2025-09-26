export interface Asteroid {
  id: string;
  name: string;
  geometry: {
    radius: number;
  };
  closeApproachDate?: {
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: number;
      kilometers_per_hour: number;
    };
    miss_distance: {
      astronomical: number;
      lunar: number;
      kilometers: number;
      miles: number;
    };
    orbiting_body: string;
  }[];
  metadata?: {
    isPotentiallyHazardous: boolean;
    isSentryObject: boolean;
    absoluteMagnitude: number;
    estimatedDiameter: {
      min: number;
      max: number;
    };
  };
}
