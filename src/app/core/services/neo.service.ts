import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { NeoFeed, NeoDetails, NearEarthObject } from '../models/neo.model';

@Injectable({ providedIn: 'root' })
export class NeoService {
  private readonly API_URL = 'https://nasa-meteor-challenge.koyeb.app';

  constructor(private http: HttpClient) {}

  getFeed(): Observable<NeoFeed> {
    return this.http.get<NeoFeed>(`${this.API_URL}/feed`);
  }

  getNearEarthObjects(): Observable<NearEarthObject[]> {
    return this.getFeed().pipe(
      map(feed => Object.values(feed.near_earth_objects).flat())
    );
  }

  getDetails(id: string): Observable<NeoDetails> {
    return this.http.get<NeoDetails>(`${this.API_URL}/neo/${id}`);
  }
}
