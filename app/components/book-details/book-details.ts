import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Books } from '../../services/books';
import { Review } from '../review/review';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [RouterLink, Review],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetails {

  private route = inject(ActivatedRoute);
  private books = inject(Books);

  book = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  expanded = signal(false);
  showReview = signal(false);

  // Esto controla si el usuario ya reseñó este libro
  hasReview = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadBook(id);
  }

  loadBook(id: string) {
    this.loading.set(true);

    this.books.getBookById(id).subscribe({
      next: (res: any) => {
        this.book.set(res);
        this.loading.set(false);

        // Ahora que el libro está cargado, comprobamos si ya tiene reseña
        this.books.hasReview(id).subscribe(r => {
          this.hasReview.set(r.hasReview);
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el libro');
        this.loading.set(false);
      }
    });
  }

sanitizeDescription(text: string | undefined): string {
  if (!text) return "Sin descripción disponible.";

  return text
    .replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}


  toggleDescription() {
    this.expanded.update(v => !v);
  }

 getShortDescription(text: string | undefined): string {
  if (!text) return "Sin descripción disponible.";

  const clean = text
    .replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  if (clean.length > 300 && !this.expanded()) {
    return clean.substring(0, 300) + "...";
  }

  return clean;
}


  openReview() {
    this.showReview.set(true);
  }
}
