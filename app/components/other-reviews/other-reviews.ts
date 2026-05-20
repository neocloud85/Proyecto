import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Books } from '../../services/books';

@Component({
  selector: 'app-resenas-seguidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './other-reviews.component.html',
  styleUrl: './other-reviews.css',
})
export class ResenasSeguidosComponent {

  loading = true;
  reviews: any[] = [];

  private books = inject(Books);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    console.log("COMPONENTE MONTADO");
    this.cargarResenas();
  }

  cargarResenas() {
    console.log("LLAMANDO A getResenasSeguidos()");

    this.books.getResenasSeguidos().subscribe({
      next: (data) => {
        console.log("DATA RECIBIDA:", data);

        this.reviews = [...data];   
        this.loading = false;

        this.cdr.detectChanges();   
      },
      error: (err) => {
        console.log("ERROR:", err);

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
