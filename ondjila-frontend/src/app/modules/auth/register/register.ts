import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth/auth-api.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/i18n/translate.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(9)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  constructor(
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authApi.register(this.form.getRawValue()).subscribe({
      next: ({ data }) => {
        this.authApi.storeSession(data);
        void this.router.navigateByUrl(this.authApi.dashboardRouteFor(data.user));
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || this.translate.t('auth.registerFailed'));
        this.isSubmitting.set(false);
      },
    });
  }
}
