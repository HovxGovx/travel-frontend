import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface City {
  id:     number;
  name:   string;
  region: string;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'http://localhost:8000/admin'
  constructor(private http: HttpClient) { }

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/cities`);
  }
  createCity(payload: Partial<City>): Observable<City> {
    return this.http.post<City>(`${this.apiUrl}/cities`, payload);
  }
  deleteCity(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cities/${id}`);
  }
}
