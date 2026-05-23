import { Component, input } from '@angular/core';
import { PoolCoPassenger, PoolDetails, PoolScenario } from '../../../core/models/pool.types';

@Component({
  selector: 'app-pool-ride-card',
  standalone: true,
  templateUrl: './pool-ride-card.html',
  styleUrl: './pool-ride-card.scss',
})
export class PoolRideCard {
  readonly pool = input.required<PoolDetails>();

  formatAoa(value: number): string {
    return `${Math.round(value).toLocaleString('pt-AO')} AOA`;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  scenarioIcon(scenario: PoolScenario): string {
    return scenario === 'same_origin_same_dest' ? '👥' : '📍';
  }
}
