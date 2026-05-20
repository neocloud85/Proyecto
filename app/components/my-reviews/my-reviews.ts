import { Component, inject, signal} from '@angular/core';
import { Books } from '../../services/books';


@Component({
  selector: 'app-my-reviews',
  imports: [],
  templateUrl: './my-reviews.html',
  styleUrl: './my-reviews.css',
})
export class MyReviews {

   private books = inject(Books);

  reviews = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.books.getMyReviews().subscribe({
      next: (res: any[]) => {
        this.reviews.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
