import { NeoDetails, NearEarthObject, Asteroid } from '../models/neo.model';

export class NeoAdapter {
  static fromFeedEntry(entry: NearEarthObject): Asteroid {
    return {
      id: entry.id,
      name: entry.name,
      absoluteMagnitude: entry.absolute_magnitude_h,
      diameterKm: entry.estimated_diameter.kilometers.estimated_diameter_max,
      isPotentiallyHazardous: entry.is_potentially_hazardous_asteroid,
      closeApproach: entry.close_approach_data.map(ca => ({
        date: ca.close_approach_date_full,
        velocityKps: parseFloat(ca.relative_velocity.kilometers_per_second),
        missDistanceKm: parseFloat(ca.miss_distance.kilometers),
        orbitingBody: ca.orbiting_body,
      }))
    };
  }

  static fromDetails(details: NeoDetails): Asteroid {
    return {
      id: details.id,
      name: details.name,
      absoluteMagnitude: details.absolute_magnitude_h,
      diameterKm: details.estimated_diameter.kilometers.estimated_diameter_max,
      isPotentiallyHazardous: details.is_potentially_hazardous_asteroid,
      closeApproach: details.close_approach_data.map(ca => ({
        date: ca.close_approach_date_full,
        velocityKps: parseFloat(ca.relative_velocity.kilometers_per_second),
        missDistanceKm: parseFloat(ca.miss_distance.kilometers),
        orbitingBody: ca.orbiting_body,
      })),
      orbit: {
        semiMajorAxis: parseFloat(details.orbital_data.semi_major_axis),
        eccentricity: parseFloat(details.orbital_data.eccentricity),
        inclination: parseFloat(details.orbital_data.inclination),
        periodDays: parseFloat(details.orbital_data.orbital_period),
      }
    };
  }
}
