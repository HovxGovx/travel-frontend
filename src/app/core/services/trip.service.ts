import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TripRequest {
  budget:       number;
  duration:     number;
  trip_type:    string;
  optimize_for: string;
  cities:       string[];
}

export interface TripDay {
  day:        number;
  city:       string;
  activities: string[];
  hotel:      string | null;
  transport:  string | null;
  cost_day:   number;
}

export interface TripResult {
  id:           number;
  user_id:      number;
  budget:       number;
  duration:     number;
  trip_type:    string;
  optimize_for: string;
  score:        number;
  created_at:   string;
  result: {
    days:       TripDay[];
    total_cost: number;
    score:      number;
    trip_type:  string;
  };
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  generate(payload: TripRequest): Observable<TripResult> {
    return this.http.post<TripResult>(`${this.base}/trips/generate`, payload);
  }

  getMyTrips(): Observable<TripResult[]> {
    return this.http.get<TripResult[]>(`${this.base}/trips/my-trips`);
  }

  deleteTrip(id: number): Observable<any> {
    return this.http.delete(`${this.base}/trips/my-trips/${id}`);
  }
}