import { Component, inject, signal } from '@angular/core';
import { Books } from '../../services/books';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-recomendaciones',
  imports: [RouterLink],
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.css',
})
export class Recomendaciones {
  
  private books = inject(Books);

  recomendaciones = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.books.getRecomendaciones().subscribe({
      next: (res) => {
        this.recomendaciones.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando recomendaciones:', err);
        this.error.set('No se pudieron cargar las recomendaciones');
        this.loading.set(false);
      }
    });
  }
}
