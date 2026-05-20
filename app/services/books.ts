import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Books {
  private http = inject(HttpClient);

  // Ya NO usamos Google Books directamente
  private backendUrl = 'http://localhost:3000/api';

  constructor() {
    console.log('ENV:', environment);
  }

  // ============================
  // 🔍 BUSCAR LIBROS (Google Books directo)
  // ============================
  searchBooks(query: string) {
    return this.http.get(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${environment.googleBooksKey}`
    );
  }

  // ============================
  // 📚 CARGAR LIBROS POR CATEGORÍA (USANDO BACKEND)
  // ============================
  getBooksByCategory(category: string, maxResults: number = 20) {
    return this.http.get(
      `${this.backendUrl}/books/by-category?cat=${encodeURIComponent(category)}&max=${maxResults}`
    );
  }

  // ============================
  // 📚 CARGAR CATÁLOGO COMPLETO DESDE VARIAS CATEGORÍAS
  // ============================
  async getCatalogByCategories(categories: string[], maxResults: number = 20) {
    const requests = categories.map(cat =>
      this.getBooksByCategory(cat, maxResults).toPromise()
    );

    const responses: any[] = await Promise.all(requests);

    const allBooks = responses.flatMap((res: any) => res.items || []);

    // eliminar duplicados por ID
    const unique = new Map();
    allBooks.forEach(book => unique.set(book.id, book));

    return Array.from(unique.values());
  }

  // ============================
  // 🔤 AUTOCOMPLETE (Google Books directo)
  // ============================
  autocomplete(title: string) {
    return this.http.get(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}&langRestrict=es&maxResults=10&key=${environment.googleBooksKey}`
    );
  }

  // ============================
  // 📘 DETALLES DE UN LIBRO (Google Books directo)
  // ============================
  getBook(id: string) {
    return this.http.get(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${environment.googleBooksKey}`
    );
  }

  getBookById(id: string) {
    return this.http.get(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${environment.googleBooksKey}`
    );
  }

  // ============================
  // ⭐ RESEÑAS
  // ============================
  addReview(data: {
    libro_id: string;
    titulo: string;
    autor: string;
    descripcion: string;
    imagen: string;
    categorias: string[];
    puntuacion: number;
    texto?: string | null;
  }) {
    return this.http.post(`${this.backendUrl}/resenas`, data);
  }

  getMyReviews() {
    return this.http.get<any[]>(`${this.backendUrl}/resenas/mias`);
  }

  hasReview(libro_id: string) {
    return this.http.get<{ hasReview: boolean }>(
      `${this.backendUrl}/resenas/mia/${libro_id}`
    );
  }

  getRecomendaciones() {
    return this.http.get<any[]>(`${this.backendUrl}/recomendaciones`);
  }

  getOtherReviews() {
    return this.http.get<any[]>(`${this.backendUrl}/resenas/otros`);
  }

  getResenasSeguidos() {
    return this.http.get<any[]>(`${this.backendUrl}/resenas/seguidos`);
  }

  getTopLibros() {
    return this.http.get<any[]>(`${this.backendUrl}/resenas/top`);
  }

  // ============================
  // 📚 CATÁLOGO DESDE BACKEND
  // ============================
  getCatalog(page: number) {
    return this.http.get<{ items: any[], etiquetas: string[] }>(
      `${this.backendUrl}/libros/catalog?page=${page}`
    );
  }
}
