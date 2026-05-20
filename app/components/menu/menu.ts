import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AmistadService } from '../../services/amistad';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})

export class MenuComponent {

  private amistad = inject(AmistadService);

  solicitudesCount = 0;

  ngOnInit() {
    // Nos suscribimos al contador global
    this.amistad.getSolicitudesCount().subscribe(n => {
      this.solicitudesCount = n;
    });

    // Cargar solicitudes al entrar
    this.amistad.getSolicitudesPendientes().subscribe();
  }
}
