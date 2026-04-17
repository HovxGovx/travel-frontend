import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activity {
  id:              number;
  name:            string;
  city_id:         number;
  cost:            number;
  duration:        number;
  category:        string;
  tags:            string[];
  pleasure_scores: Record<string, number> | null;
}

export interface City {
  id:     number;
  name:   string;
  region: string;
}

export interface Tag {
  id:          number;
  name:        string;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private base = 'http://localhost:8000/admin';

  constructor(private http: HttpClient) {}

  // ── Activités ──────────────────────────────────────────────────────────
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.base}/activities`);
  }

  createActivity(payload: Partial<Activity> & { tag_ids?: number[] }): Observable<Activity> {
    return this.http.post<Activity>(`${this.base}/activities`, payload);
  }

  updateActivity(id: number, payload: Partial<Activity> & { tag_ids?: number[] }): Observable<Activity> {
    return this.http.patch<Activity>(`${this.base}/activities/${id}`, payload);
  }

  updateScores(id: number, scores: Record<string, number>): Observable<Activity> {
    return this.http.patch<Activity>(`${this.base}/activities/${id}/scores`, { pleasure_scores: scores });
  }

  updateTags(id: number, tagIds: number[]): Observable<Activity> {
    return this.http.patch<Activity>(`${this.base}/activities/${id}/tags`, { tag_ids: tagIds });
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.base}/activities/${id}`);
  }

  // ── Villes ────────────────────────────────────────────────────────────
  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.base}/cities`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.base}/tags`);
  }
}