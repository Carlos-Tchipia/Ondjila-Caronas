import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { PassengerRidesApiService } from '../../../core/services/rides/passenger-rides-api.service';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: PassengerRidesApiService,
          useValue: {
            getCurrentRide: () => of({ data: { ride: null } }),
            requestPool: () => of({ data: undefined }),
            cancelPool: () => of({ data: null }),
          },
        },
        {
          provide: WalletApiService,
          useValue: {
            getBalance: () => of({ data: { balance: 0 } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
