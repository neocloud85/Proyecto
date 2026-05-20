import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) {  }

  login(credentials: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/login`, credentials);
  }
  register(data: { nombre: string; correo: string; contrasena: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}usuarios/register`, data);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}auth/me`);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
