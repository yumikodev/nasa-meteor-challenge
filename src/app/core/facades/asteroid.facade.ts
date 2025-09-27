import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NeoService } from '../services/neo.service';
import { Asteroid } from '../models/neo.model';
import { NeoAdapter } from '../adapters/neo.adapter';

@Injectable({ providedIn: 'root' })
export class AsteroidFacade {
  constructor(private neoService: NeoService) {}

  getAll(): Observable<Asteroid[]> {
    return this.neoService.getNearEarthObjects().pipe(
      map((neos: any[]) => neos.map(NeoAdapter.fromFeedEntry))
    );
  }

  getHazardous(): Observable<Asteroid[]> {
    return this.getAll().pipe(
      map(asteroids => asteroids.filter(a => a.isPotentiallyHazardous))
    );
  }

  getById(id: string): Observable<Asteroid | undefined> {
    return this.getAll().pipe(
      map(asteroids => asteroids.find(a => a.id === id))
    );
  }
}
