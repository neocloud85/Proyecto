import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Books } from '../../services/books';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ⭐ Tus 36 categorías oficiales
const CATEGORIAS_GENERALES = [
  "Art", "Biography & Autobiography", "Business & Economics", "Computers",
  "Cooking", "Drama", "Education", "Family & Relationships", "Fiction",
  "Health & Fitness", "History", "Humor", "Juvenile Fiction",
  "Juvenile Nonfiction", "Law", "Mathematics", "Medical", "Music",
  "Nature", "Performing Arts", "Pets", "Philosophy", "Photography",
  "Poetry", "Political Science", "Psychology", "Reference", "Religion",
  "Science", "Self-Help", "Social Science", "Sports & Recreation",
  "Technology & Engineering", "Transportation", "Travel"
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  router = inject(Router);
  private books = inject(Books);

  topLibros = signal<any[]>([]);
  loadingTop = signal(true);

  catalogOriginal = signal<any[]>([]);
  catalogVisible = signal<any[]>([]);
  visibleCount = signal(20);

  loading = signal(true);
  searching = signal(false);
  error = signal<string | null>(null);

  searchTerm = signal('');
  suggestions = signal<any[]>([]);
  typingTimeout: any = null;

  etiquetas = signal<string[]>(CATEGORIAS_GENERALES);
  categoriasSeleccionadas = signal<string[]>([]);
  gruposCategorias = signal<{ [grupo: string]: string[] }>({});

  paginasPorCategoria: Record<string, number> = {};

  async ngOnInit() {
    this.cargarTopLibros();

    CATEGORIAS_GENERALES.forEach(cat => this.paginasPorCategoria[cat] = 0);

    this.loading.set(true);
    await this.cargarCatalogoInicial();
    this.loading.set(false);
  }

  // ⭐ Normalizar categoría y asignarla a una de las 36 oficiales
  normalizarCategoria(cat: string): string {
    const base = cat.split('/')[0].trim();

    // Si coincide con una categoría oficial → perfecto
    if (CATEGORIAS_GENERALES.includes(base)) return base;

    // Si no coincide → buscar la más parecida
    const match = CATEGORIAS_GENERALES.find(c =>
      c.toLowerCase().includes(base.toLowerCase()) ||
      base.toLowerCase().includes(c.toLowerCase())
    );

    return match || "Fiction"; // fallback seguro
  }

  async cargarCatalogoInicial() {
    const peticiones = CATEGORIAS_GENERALES.map(async cat => {
      const res: any = await this.books.getBooksByCategory(cat, 5).toPromise();
      return res?.items || [];
    });

    const resultados = await Promise.all(peticiones);
    const libros = resultados.flat();

    // Normalizar categorías
    libros.forEach((book: any) => {
      const cats: string[] = book.volumeInfo?.categories || [];
      book.volumeInfo.categoriasNormalizadas = cats.map((c: string) =>
        this.normalizarCategoria(c)
      );
    });

    this.catalogOriginal.set(libros);
    this.catalogVisible.set(libros.slice(0, this.visibleCount()));

    this.gruposCategorias.set(this.agruparCategorias(CATEGORIAS_GENERALES));
  }

  verMas() {
    const nuevoLimite = this.visibleCount() + 20;
    this.visibleCount.set(nuevoLimite);
    this.catalogVisible.set(this.catalogOriginal().slice(0, nuevoLimite));
  }

  async cargarMasDeCategoria(cat: string) {
    const pagina = this.paginasPorCategoria[cat];

    const res: any = await this.books.getBooksByCategory(cat, 5).toPromise();
    const nuevos: any[] = res?.items || [];

    nuevos.forEach((book: any) => {
      const cats: string[] = book.volumeInfo?.categories || [];
      book.volumeInfo.categoriasNormalizadas = cats.map((c: string) =>
        this.normalizarCategoria(c)
      );
    });

    this.catalogOriginal.update(old => [...old, ...nuevos]);
    this.catalogVisible.set(this.catalogOriginal().slice(0, this.visibleCount()));

    this.paginasPorCategoria[cat]++;
  }

  agruparCategorias(categorias: string[]) {
    const grupos: { [grupo: string]: string[] } = {};

    categorias.forEach((cat: string) => {
      const grupo = cat.split('/')[0].trim();
      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push(cat);
    });

    return grupos;
  }

  get gruposLista() {
    return Object.keys(this.gruposCategorias()).sort();
  }

  cargarTopLibros() {
    this.loadingTop.set(true);

    this.books.getTopLibros().subscribe({
      next: data => {
        this.topLibros.set([...data]);
        this.loadingTop.set(false);
      },
      error: () => this.loadingTop.set(false)
    });
  }

  onType(value: string) {
    this.searchTerm.set(value);
    clearTimeout(this.typingTimeout);

    if (!value.trim()) {
      this.suggestions.set([]);
      return;
    }

    this.typingTimeout = setTimeout(() => {
      this.books.autocomplete(value).subscribe({
        next: (res: any) => this.suggestions.set(res.items || []),
        error: () => this.suggestions.set([])
      });
    }, 300);
  }

  selectSuggestion(title: string) {
    this.searchTerm.set(title);
    this.suggestions.set([]);
    this.onSearch();
  }

  onSearch() {
    const term = this.searchTerm().trim();

    if (!term) {
      this.searching.set(false);
      this.catalogVisible.set(this.catalogOriginal().slice(0, this.visibleCount()));
      return;
    }

    this.loading.set(true);
    this.searching.set(true);

    this.books.searchBooks(term).subscribe({
      next: (res: any) => {
        this.catalogVisible.set(res.items || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error buscando libros');
        this.loading.set(false);
      }
    });
  }

  toggleCategoria(cat: string) {
    const actuales = this.categoriasSeleccionadas();

    if (actuales.includes(cat)) {
      const nuevas = actuales.filter(c => c !== cat);
      this.categoriasSeleccionadas.set(nuevas);
      this.aplicarFiltro(nuevas);
      return;
    }

    const nuevas = [...actuales, cat];
    this.categoriasSeleccionadas.set(nuevas);
    this.aplicarFiltro(nuevas);
  }

  aplicarFiltro(categorias: string[]) {
    if (categorias.length === 0) {
      this.catalogVisible.set(this.catalogOriginal().slice(0, this.visibleCount()));
      this.searching.set(false);
      return;
    }

    const filtrados = this.catalogOriginal().filter((book: any) => {
      const cats: string[] = book.volumeInfo?.categoriasNormalizadas || [];
      return categorias.every(c => cats.includes(c));
    });

    this.catalogVisible.set(filtrados);
    this.searching.set(true);
  }

  goToDetails(id: string) {
    this.router.navigate(['/book', id]);
  }

  goBack() {
    history.back();
  }

  goHome() {
    this.router.navigate(['']);
  }
}
