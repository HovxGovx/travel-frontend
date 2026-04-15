import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/auth';
  constructor(private http: HttpClient ) { }

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }
  saveToken(token: string) {
    return localStorage.setItem('access_token', token);
  }
  getToken(){
    return localStorage.getItem('access_token');
  }
  logout() {
    localStorage.removeItem('access_token');
  }
}
