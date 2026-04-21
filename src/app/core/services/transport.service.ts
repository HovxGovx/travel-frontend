import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transport {
  id:                  number;
  origin_city_id:      number;
  destination_city_id: number;
  name:                string;
  type:                string;
  cost:                number;
  duration:            number;
}
@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = 'http://localhost:8000/admin';

  constructor(private http: HttpClient) {}

  getTransports(): Observable<Transport[]> {
    return this.http.get<Transport[]>(`${this.apiUrl}/transports`);
  }
  createTransport(payload: Partial<Transport>): Observable<Transport> {
    return this.http.post<Transport>(`${this.apiUrl}/transports`, payload);
  }
  deleteTransport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transports/${id}`);
  }
}
