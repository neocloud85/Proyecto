import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
  path: '',
  loadComponent: () =>
    import('./components/landing/landing').then(m => m.Landing)
},
{
  path: 'login',
  loadComponent: () =>
    import('./components/login/login').then(m => m.LoginComponent)
},
{
  path: 'register',
  loadComponent: () =>
    import('./components/register/register').then(m => m.Register)
},
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
},
{
  path: 'book/:id',
  loadComponent: () =>
    import('./components/book-details/book-details').then(m => m.BookDetails)
},

{
  path: 'mis-resenas',
  loadComponent: () => import('./components/my-reviews/my-reviews').then(m => m.MyReviews)
},

{ 
  path: 'recomendados', loadComponent: () => import('./components/recomendaciones/recomendaciones').then(m => m.Recomendaciones) 
},
{
  path: 'resenas-usuarios',
  loadComponent: () =>
    import('./components/other-reviews/other-reviews')
      .then(m => m.ResenasSeguidosComponent)
},
{
  path: 'buscar-usuarios',
  loadComponent: () =>
    import('./components/buscar-usuarios/buscar-usuarios')
      .then(m => m.BuscarUsuariosComponent)
},
{
  path: 'solicitudes',
  loadComponent: () =>
    import('./components/solicitudes-pendientes/solicitudes-pendientes')
      .then(m => m.SolicitudesPendientesComponent)
}
];
