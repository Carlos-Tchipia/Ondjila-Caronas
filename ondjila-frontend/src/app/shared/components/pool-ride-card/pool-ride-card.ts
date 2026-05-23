import { Component, input } from '@angular/core';
import { PoolDetails, PoolScenario } from '../../../core/models/pool.types';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-pool-ride-card',
  standalone: true,
  imports: [TranslatePipe],
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
