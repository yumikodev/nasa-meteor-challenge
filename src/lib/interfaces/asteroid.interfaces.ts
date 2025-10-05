export interface AsteroidDetails {
  readonly id: string;
  readonly name: string;
  readonly designation: string;
  readonly closeApproachData: CloseApproachDatum[];
  readonly orbitalData: OrbitalData;
  readonly metadata: AsteroidDetailsMetadata;
}

export interface CloseApproachDatum {
  readonly closeApproachDate: Date;
  readonly relativeVelocity: RelativeVelocity;
  readonly missDistance: CloseApproachDatumMissDistance;
  readonly orbitingBody: OrbitingBody;
}

export interface CloseApproachDatumMissDistance {
  readonly astronomical: number;
  readonly lunar: number;
  readonly kilometers: number;
  readonly miles: number;
}

export enum OrbitingBody {
  Earth = "Earth",
  Mars = "Mars",
  Merc = "Merc",
  Venus = "Venus",
}

export interface RelativeVelocity {
  readonly kilometersPerSecond: number;
  readonly kilometersPerHour: number;
}

export interface AsteroidDetailsMetadata {
  readonly nasaJplUrl?: string;
  readonly isPotentiallyHazardous: boolean;
  readonly isSentryObject: boolean;
  readonly absoluteMagnitude: number;
  readonly estimatedDiameter: EstimatedDiameter;
  readonly missDistance?: MetadataMissDistance;
}

export interface EstimatedDiameter {
  readonly min: number;
  readonly max: number;
}

export interface MetadataMissDistance {
  readonly km: number;
  readonly astronomical: number;
  readonly lunar: number;
}

export interface OrbitalData {
  readonly orbitId: string;
  readonly orbitDeterminationDate: Date;
  readonly firstObservationDate: Date;
  readonly lastObservationDate: Date;
  readonly dataArcInDays: number;
  readonly observationsUsed: number;
  readonly orbitUncertainty: string;
  readonly minimumOrbitIntersection: number;
  readonly jupiterTisserandInvariant: number;
  readonly epochOsculation: number;
  readonly eccentricity: number;
  readonly semiMajorAxis: number;
  readonly inclination: number;
  readonly ascendingNodeLongitude: number;
  readonly orbitalPeriod: number;
  readonly perihelionDistance: number;
  readonly perihelionArgument: number;
  readonly perihelionTime: number;
  readonly aphelionDistance: number;
  readonly meanAnomaly: number;
  readonly meanMotion: number;
  readonly equinox: string;
  readonly orbitClass: OrbitClass;
}

export interface OrbitClass {
  readonly type: string;
  readonly description: string;
  readonly range: string;
}

export interface Asteroids {
  readonly asteroids: Asteroid[];
  readonly metadata: AsteroidsMetadata;
}

export interface Asteroid {
  readonly id: string;
  readonly name: string;
  readonly closeApproachData: CloseApproachDatum[];
  readonly metadata: AsteroidDetailsMetadata;
}

export interface AsteroidsMetadata {
  readonly totalCount: number;
  readonly hazardousCount: number;
  readonly sentryCount: number;
}
