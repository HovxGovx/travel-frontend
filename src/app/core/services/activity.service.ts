import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activity {
  id: number;
  name: string;
  city_id: number;
  cost: number;
  duration: number;
  category: string;
  tags: string[];
  pleasure_scores: Record<string, number> | null;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = 'http://localhost:8000/admin/activities';

  constructor(private http: HttpClient) {}

  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.apiUrl);
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}