import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient ) { }

  login(data: LoginRequest) {

    return this.http.post<any>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      })
    );
  }
  getMe() {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => this.userSubject.next(user))
    );
  }
  loadUser(){
    this.getMe().subscribe();
  }

  saveToken(token: string) {
    return localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}
