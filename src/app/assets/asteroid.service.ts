import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asteroid } from './asteroid.model';

@Injectable({
  providedIn: 'root',
})
export class AsteroidService {
  constructor(private http: HttpClient) {}

  // lista de asteroides
  getAsteroidList(): Observable<{ id: string; name: string; file: string }[]> {
    return this.http.get<{ id: string; name: string; file: string }[]>('/asteroid-list.json');
  }
  
  // datos individuales
  getAsteroidById(file: string): Observable<Asteroid | null> {
    return this.http.get<Asteroid>(`/${file}`).pipe(
      catchError(() => of(null))
    );
  }
}
