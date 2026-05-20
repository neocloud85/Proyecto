import { Component, input, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Books } from '../../services/books';

@Component({
  selector: 'app-review',
  imports: [ReactiveFormsModule],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {
  book = input<any>();

  fb = inject(FormBuilder);
  books = inject(Books);

  form = this.fb.nonNullable.group({
    puntuacion: [5],
    texto: [''] // opcional
  });

  submit() {
  const b = this.book().volumeInfo;
  const categorias = b.categories || [];


  this.books.addReview({
    libro_id: this.book().id,
    
    // Datos necesarios para insertar el libro si no existe
    titulo: b.title,
    autor: b.authors?.join(', ') || 'Autor desconocido',
    descripcion: b.description || '',
    imagen: b.imageLinks?.thumbnail || '',
    categorias: b.categories || [],
    // Datos de la reseña
    puntuacion: this.form.value.puntuacion!,
    texto: this.form.value.texto || null
  }).subscribe({
    next: () => alert('Reseña guardada'),
    error: (err) => console.error('Error al crear reseña:', err)
  });
}
}
