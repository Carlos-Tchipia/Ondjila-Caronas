import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ShellPage, RouterLink, TranslatePipe],
  template: `
    <app-shell-page
      [titleKey]="'admin.adminDashboardTitle'"
      [subtitleKey]="'admin.adminDashboardSubtitle'"
      backLink="/"
      [badgeKey]="'shell.badgeAdmin'"
    >
      <div class="admin-grid">
        <div class="shell-card">
          <h2>{{ 'admin.pendingDriversTitle' | translate }}</h2>
          <p class="stat-big">1</p>
          <p>{{ 'admin.reviewApprove' | translate }}</p>
          <button type="button" class="btn btn--primary" disabled>{{ 'admin.approveBtn' | translate }}</button>
        </div>
        <div class="shell-card">
          <h2>{{ 'admin.tripsTodayCard' | translate }}</h2>
          <p class="stat-big">—</p>
          <p>{{ 'admin.realtimeWs' | translate }}</p>
        </div>
        <div class="shell-card">
          <h2>{{ 'admin.usersTitle' | translate }}</h2>
          <p>{{ 'admin.usersManage' | translate }}</p>
        </div>
        <div class="shell-card">
          <h2>{{ 'admin.promotionsTitle' | translate }}</h2>
          <p>{{ 'admin.promotionsManage' | translate }}</p>
        </div>
      </div>
      <a routerLink="/login" class="btn btn--ghost">{{ 'admin.logoutToLogin' | translate }}</a>
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
