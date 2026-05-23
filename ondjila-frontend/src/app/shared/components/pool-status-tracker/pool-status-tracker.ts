import { Component, input } from '@angular/core';
import { PoolUiState } from '../../../core/models/pool.types';

interface Step {
  key: PoolUiState;
  label: string;
}

@Component({
  selector: 'app-pool-status-tracker',
  standalone: true,
  templateUrl: './pool-status-tracker.html',
  styleUrl: './pool-status-tracker.scss',
})
export class PoolStatusTracker {
  readonly state = input.required<PoolUiState>();
  readonly passengerCount = input(1);
  readonly maxPassengers = input(3);

  readonly steps: Step[] = [
    { key: 'searching_passengers', label: 'A procurar' },
    { key: 'pool_found', label: 'Pool encontrado' },
    { key: 'driver_en_route', label: 'Motorista' },
    { key: 'passenger_picked_up', label: 'Recolhido' },
    { key: 'ride_in_progress', label: 'Em curso' },
    { key: 'completed', label: 'Concluída' },
  ];

  stepIndex(): number {
    const order: PoolUiState[] = [
      'searching_passengers',
      'pool_found',
      'driver_en_route',
      'passenger_picked_up',
      'ride_in_progress',
      'completed',
    ];
    const idx = order.indexOf(this.state());
    return idx >= 0 ? idx : 0;
  }

  isActive(i: number): boolean {
    return i <= this.stepIndex();
  }

  isCurrent(i: number): boolean {
    return i === this.stepIndex();
  }
}
