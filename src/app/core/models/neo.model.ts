// src/app/models/neo.model.ts

// -------------------- Raw API Types (de la API, no tocar) --------------------
export interface NeoFeed {
  readonly links: NeoFeedLinks;
  readonly element_count: number;
  readonly near_earth_objects: Record<string, NearEarthObject[]>;
}

export interface NeoDetails {
  readonly links: NeoLinks;
  readonly id: string;
  readonly neo_reference_id: string;
  readonly name: string;
  readonly designation: string;
  readonly nasa_jpl_url: string;
  readonly absolute_magnitude_h: number;
  readonly estimated_diameter: EstimatedDiameter;
  readonly is_potentially_hazardous_asteroid: boolean;
  readonly close_approach_data: CloseApproachDatum[];
  readonly orbital_data: OrbitalData;
  readonly is_sentry_object: boolean;
}

export interface NeoLinks {
  readonly self: string;
}

export interface NeoFeedLinks extends NeoLinks {
  readonly next: string;
  readonly previous: string;
}

export interface NearEarthObject {
  readonly links: NearEarthObjectLinks;
  readonly id: string;
  readonly neo_reference_id: string;
  readonly name: string;
  readonly nasa_jpl_url: string;
  readonly absolute_magnitude_h: number;
  readonly estimated_diameter: EstimatedDiameter;
  readonly is_potentially_hazardous_asteroid: boolean;
  readonly close_approach_data: CloseApproachDatum[];
  readonly is_sentry_object: boolean;
  readonly sentry_data?: string;
}

export interface CloseApproachDatum {
  readonly close_approach_date: Date;
  readonly close_approach_date_full: string;
  readonly epoch_date_close_approach: number;
  readonly relative_velocity: RelativeVelocity;
  readonly miss_distance: MissDistance;
  readonly orbiting_body: OrbitingBody;
}

export interface MissDistance {
  readonly astronomical: string;
  readonly lunar: string;
  readonly kilometers: string;
  readonly miles: string;
}

export enum OrbitingBody {
  Earth = 'Earth',
  Mars = 'Mars',
  Venus = 'Venus',
}

export interface RelativeVelocity {
  readonly kilometers_per_second: string;
  readonly kilometers_per_hour: string;
  readonly miles_per_hour: string;
}

export interface EstimatedDiameter {
  readonly kilometers: Feet;
  readonly meters: Feet;
  readonly miles: Feet;
  readonly feet: Feet;
}

export interface Feet {
  readonly estimated_diameter_min: number;
  readonly estimated_diameter_max: number;
}

export interface NearEarthObjectLinks {
  readonly self: string;
}

export interface OrbitalData {
  readonly orbit_id: string;
  readonly orbit_determination_date: Date;
  readonly first_observation_date: Date;
  readonly last_observation_date: Date;
  readonly data_arc_in_days: number;
  readonly observations_used: number;
  readonly orbit_uncertainty: string;
  readonly minimum_orbit_intersection: string;
  readonly jupiter_tisserand_invariant: string;
  readonly epoch_osculation: string;
  readonly eccentricity: string;
  readonly semi_major_axis: string;
  readonly inclination: string;
  readonly ascending_node_longitude: string;
  readonly orbital_period: string;
  readonly perihelion_distance: string;
  readonly perihelion_argument: string;
  readonly aphelion_distance: string;
  readonly perihelion_time: string;
  readonly mean_anomaly: string;
  readonly mean_motion: string;
  readonly equinox: string;
  readonly orbit_class: OrbitClass;
}

export interface OrbitClass {
  readonly orbit_class_type: string;
  readonly orbit_class_range: string;
  readonly orbit_class_description: string;
}

// -------------------- Simplified Model (para UI, Three.js, D3.js) --------------------
export interface Asteroid {
  id: string;
  name: string;
  absoluteMagnitude: number; // brillo → útil para D3
  diameterKm: number;        // radio medio → sphere en Three.js
  isPotentiallyHazardous: boolean;

  closeApproach: {
    date: string;
    velocityKps: number;     // velocidad en km/s → animaciones 3D
    missDistanceKm: number;  // cercanía → D3 impact maps
    orbitingBody: string;
  }[];

  orbit?: {
    semiMajorAxis: number;   // eje mayor → tamaño órbita
    eccentricity: number;    // excentricidad → forma órbita
    inclination: number;     // inclinación → ángulo órbita
    periodDays: number;      // periodo → animaciones orbitales
  };
}
