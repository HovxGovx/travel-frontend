import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface City       { id: number; name: string; region: string; }
export interface Activity   { id: number; name: string; city_id: number; cost: number; duration: number; category: string; tags: string[]; }
export interface Hotel      { id: number; name: string; city_id: number; stars: number; price_per_night: number; category: string; }
export interface Transport  { id: number; name: string; origin_city_id: number; destination_city_id: number; type: string; cost: number; duration: number; }

export interface TripDay {
  day:        number;
  city:       string;
  activities: string[];
  hotel:      string | null;
  transport:  string | null;
  cost_day:   number;
}

export interface GeneratedTrip {
  days:       TripDay[];
  total_cost: number;
  score:      number;
  trip_type:  string;
  budget:     number;
  duration:   number;
}

export interface TripRequest {
  budget:       number;
  duration:     number;
  trip_type:    string;
  optimize_for: string;
  cities:       string[];
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getCities():     Observable<City[]>      { return this.http.get<City[]>(`${this.base}/admin/cities`); }
  getActivities(): Observable<Activity[]>  { return this.http.get<Activity[]>(`${this.base}/admin/activities`); }
  getHotels():     Observable<Hotel[]>     { return this.http.get<Hotel[]>(`${this.base}/admin/hotels`); }
  getTransports(): Observable<Transport[]> { return this.http.get<Transport[]>(`${this.base}/admin/transports`); }

  generate(payload: TripRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/trips/generate`, payload);
  }
}