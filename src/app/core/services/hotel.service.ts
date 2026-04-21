import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hotel {
  id:              number;
  city_id:         number;
  name:            string;
  stars:           number;
  price_per_night: number;
  category:        string;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = 'http://localhost:8000/admin';

  constructor(private http: HttpClient) {}

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`);
  }
  createHotel(payload: Partial<Hotel>): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.apiUrl}/hotels`, payload);
  }
  deleteHotel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/hotels/${id}`);
  }
}
