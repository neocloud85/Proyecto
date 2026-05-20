import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { signal } from '@angular/core';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']  
})
export class Register {

  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
 
  //declarar como signal
  errorMsg = signal<string>('');


  form = this.fb.nonNullable.group({
    nombre: [''],
    correo: [''],
    contrasena: ['']
  });

  submit() {
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al registrarse');
        console.log(this.errorMsg());
      }
    });
  }

  goBack() {
  this.router.navigate(['']);
}
}
