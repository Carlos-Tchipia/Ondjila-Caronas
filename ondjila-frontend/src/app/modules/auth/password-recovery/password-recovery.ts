import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth/auth-api.service';
import { TranslateService } from '../../../core/i18n/translate.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocaleControls } from '../../../shared/components/locale-controls/locale-controls';

type RecoveryStep = 'request' | 'reset' | 'done';

@Component({
  selector: 'app-password-recovery',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, LocaleControls],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.scss',
})
export class PasswordRecovery {
  readonly step = signal<RecoveryStep>('request');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly simulatedCode = signal('');
  readonly recoveryEmail = signal('');

  readonly requestForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly resetForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
    }),
    new_password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  constructor(
    private readonly authApi: AuthApiService,
    private readonly translate: TranslateService
  ) {}

  requestCode(): void {
    this.clearMessages();

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const email = this.requestForm.controls.email.value.trim();
    this.isSubmitting.set(true);

    this.authApi.requestPasswordReset({ email }).subscribe({
      next: ({ data }) => {
        this.recoveryEmail.set(email);
        this.simulatedCode.set(data.reset_code);
        this.successMessage.set(
          this.translate.t('auth.recoveryCodeGenerated', {
            minutes: data.expires_in_minutes,
          })
        );
        this.step.set('reset');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || this.translate.t('auth.recoveryRequestFailed')
        );
        this.isSubmitting.set(false);
      },
    });
  }

  resetPassword(): void {
    this.clearMessages();

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authApi
      .resetPassword({
        email: this.recoveryEmail(),
        code: this.resetForm.controls.code.value.trim(),
        new_password: this.resetForm.controls.new_password.value,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(this.translate.t('auth.passwordResetSuccess'));
          this.step.set('done');
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || this.translate.t('auth.passwordResetFailed')
          );
          this.isSubmitting.set(false);
        },
      });
  }

  requestAnotherCode(): void {
    this.clearMessages();
    this.resetForm.reset();
    this.simulatedCode.set('');
    this.step.set('request');
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
