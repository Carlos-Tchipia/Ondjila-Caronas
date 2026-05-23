import { Component, input } from '@angular/core';
import { PoolUiState } from '../../../core/models/pool.types';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface Step {
  key: PoolUiState;
  labelKey: string;
}

@Component({
  selector: 'app-pool-status-tracker',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './pool-status-tracker.html',
  styleUrl: './pool-status-tracker.scss',
})
export class PoolStatusTracker {
  readonly state = input.required<PoolUiState>();
  readonly passengerCount = input(1);
  readonly maxPassengers = input(3);

  readonly steps: Step[] = [
    { key: 'searching_passengers', labelKey: 'pool.searching' },
    { key: 'pool_found', labelKey: 'pool.poolFound' },
    { key: 'driver_en_route', labelKey: 'pool.driverEnRoute' },
    { key: 'passenger_picked_up', labelKey: 'pool.pickedUp' },
    { key: 'ride_in_progress', labelKey: 'pool.inProgress' },
    { key: 'completed', labelKey: 'pool.done' },
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
