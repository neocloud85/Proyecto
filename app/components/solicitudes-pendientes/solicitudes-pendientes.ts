import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmistadService } from '../../services/amistad';

@Component({
  selector: 'app-solicitudes-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes-pendientes.html'
})
export class SolicitudesPendientesComponent {

  private amistad = inject(AmistadService);

  solicitudes: any[] = [];
  loading = true;

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.loading = true;

    this.amistad.getSolicitudesPendientes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  aceptar(id: number) {
    this.amistad.aceptarSolicitud(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
    });
  }

  rechazar(id: number) {
    this.amistad.rechazarSolicitud(id).subscribe(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== id);
    });
  }
}
