import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ShellPage, RouterLink],
  template: `
    <app-shell-page
      title="Administração"
      subtitle="Gestão de motoristas, utilizadores e operações."
      backLink="/"
      badge="Admin"
    >
      <div class="admin-grid">
        <div class="shell-card">
          <h2>Motoristas pendentes</h2>
          <p class="stat-big">1</p>
          <p>Rever documentos e aprovar contas.</p>
          <button type="button" class="btn btn--primary" disabled>Aprovar</button>
        </div>
        <div class="shell-card">
          <h2>Viagens hoje</h2>
          <p class="stat-big">—</p>
          <p>Monitorização em tempo real (WebSockets v1.1).</p>
        </div>
        <div class="shell-card">
          <h2>Utilizadores</h2>
          <p>Gestão de contas e suspensões.</p>
        </div>
        <div class="shell-card">
          <h2>Promoções</h2>
          <p>Códigos e campanhas.</p>
        </div>
      </div>
      <a routerLink="/login" class="btn btn--ghost">Sair para login</a>
    </app-shell-page>
  `,
  styles: `
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .stat-big {
      font-size: 2rem;
      font-weight: 800;
      color: var(--brand-700);
      margin: 0.5rem 0;
    }
  `,
})
export class AdminDashboard {}
