import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AmistadService {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Contador global de solicitudes pendientes
  private solicitudesCount$ = new BehaviorSubject<number>(0);

  // Observable para que los componentes se suscriban
  getSolicitudesCount() {
    return this.solicitudesCount$.asObservable();
  }

  // Setter interno para actualizar el contador
  setSolicitudesCount(n: number) {
    this.solicitudesCount$.next(n);
  }

  // Buscar usuarios por nombre
  buscarUsuarios(q: string) {
    return this.http.get<any[]>(`${this.api}/amistad/buscar?q=${q}`);
  }

  // Enviar solicitud
  enviarSolicitud(receptor: string) {
    return this.http.post(`${this.api}/amistad/enviar`, { receptor });
  }

  // Obtener solicitudes pendientes (y actualizar contador)
  getSolicitudesPendientes() {
    return this.http
      .get<any[]>(`${this.api}/amistad/pendientes`)
      .pipe(
        tap(data => this.setSolicitudesCount(data.length))
      );
  }

  // Aceptar solicitud (el componente ajusta el contador con la lista actual)
  aceptarSolicitud(id: number) {
    return this.http.post(`${this.api}/amistad/aceptar`, { id });
  }

  // Rechazar solicitud (igual que aceptar)
  rechazarSolicitud(id: number) {
    return this.http.post(`${this.api}/amistad/rechazar`, { id });
  }
}
