import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth/auth-api.service';
import {
  DriverAuthApiService,
  DriverRegisterDocuments,
} from '../../../core/services/auth/driver-auth-api.service';

const DOC_KEYS = [
  'doc_license_front',
  'doc_license_back',
  'doc_insurance',
  'doc_id_card',
] as const;

type DocKey = (typeof DOC_KEYS)[number];

@Component({
  selector: 'app-register-driver',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-driver.html',
  styleUrl: './register-driver.scss',
})
export class RegisterDriver {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly docErrors = signal<Partial<Record<DocKey, string>>>({});

  readonly documents: Partial<Record<DocKey, File>> = {};

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
    license_number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vehicle_plate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vehicle_type: new FormControl<'economy' | 'comfort' | 'xl'>('economy', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vehicle_brand: new FormControl('', { nonNullable: true }),
    vehicle_model: new FormControl('', { nonNullable: true }),
    vehicle_year: new FormControl('', { nonNullable: true }),
    vehicle_color: new FormControl('', { nonNullable: true }),
    pool_enabled: new FormControl(true, { nonNullable: true }),
    pool_max_passengers: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.min(2), Validators.max(4)],
    }),
  });

  constructor(
    private readonly driverAuthApi: DriverAuthApiService,
    private readonly authApi: AuthApiService,
    private readonly router: Router
  ) {}

  onDocumentSelected(key: DocKey, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      delete this.documents[key];
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.docErrors.update((current) => ({
        ...current,
        [key]: 'Formato inválido. Usa JPG, PNG, WEBP ou PDF.',
      }));
      delete this.documents[key];
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.docErrors.update((current) => ({
        ...current,
        [key]: 'Ficheiro demasiado grande (máx. 5MB).',
      }));
      delete this.documents[key];
      return;
    }

    this.documents[key] = file;
    this.docErrors.update((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const missingDocs = DOC_KEYS.filter((key) => !this.documents[key]);
    if (missingDocs.length > 0) {
      const errors = missingDocs.reduce(
        (acc, key) => {
          acc[key] = 'Documento obrigatório.';
          return acc;
        },
        {} as Partial<Record<DocKey, string>>
      );
      this.docErrors.set(errors);
      return;
    }

    this.isSubmitting.set(true);

    const raw = this.form.getRawValue();
    const documents = this.documents as DriverRegisterDocuments;

    this.driverAuthApi
      .register(
        {
          name: raw.name,
          email: raw.email,
          phone: raw.phone,
          password: raw.password,
          license_number: raw.license_number,
          vehicle_plate: raw.vehicle_plate,
          vehicle_type: raw.vehicle_type,
          vehicle_brand: raw.vehicle_brand || undefined,
          vehicle_model: raw.vehicle_model || undefined,
          vehicle_year: raw.vehicle_year || undefined,
          vehicle_color: raw.vehicle_color || undefined,
          pool_enabled: raw.pool_enabled,
          pool_max_passengers: raw.pool_max_passengers,
        },
        documents
      )
      .subscribe({
        next: ({ data }) => {
          this.authApi.storeSession(data);
          void this.router.navigateByUrl(this.authApi.dashboardRouteFor(data.user));
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const apiErrors = err.error?.errors as Record<string, string[]> | undefined;

          if (apiErrors) {
            const first = Object.values(apiErrors).flat()[0];
            this.errorMessage.set(first || err.error?.message || 'Não foi possível registar.');
            return;
          }

          this.errorMessage.set(err.error?.message || 'Não foi possível registar como motorista.');
        },
      });
  }
}
