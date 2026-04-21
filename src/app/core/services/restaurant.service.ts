import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  id:        number;
  city_id:   number;
  name:      string;
  cuisine:   string;
  price_avg: number;
  rating:    number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'http://localhost:8000/admin';

  constructor(private http: HttpClient) {}
  
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants`);
  }
  createRestaurant(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.apiUrl}/restaurants`, payload);
  }
  deleteRestaurant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurants/${id}`);
  }
}

