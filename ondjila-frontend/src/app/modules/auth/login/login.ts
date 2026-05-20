import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth/auth-api.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly authApi: AuthApiService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authApi.login(this.form.getRawValue()).subscribe({
      next: ({ data }) => {
        this.authApi.storeSession(data);
        void this.router.navigateByUrl(this.authApi.dashboardRouteFor(data.user));
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível iniciar sessão.');
        this.isSubmitting.set(false);
      },
    });
  }
}
