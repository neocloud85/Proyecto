// src/app/services/categorias.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private http = inject(HttpClient);

  // Cambia la URL si tu backend usa otro puerto
  private apiUrl = 'http://localhost:3000/api';

  getCategoriasGlobales() {
    return this.http.get<{ status: string; categorias: string[] }>(
      `${this.apiUrl}/categorias/globales`
    );
  }
}
