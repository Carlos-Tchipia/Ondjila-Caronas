import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-passenger-choose-ride',
  standalone: true,
  imports: [Navbar, RouterLink],
  templateUrl: './passenger-choose-ride.page.html',
  styleUrl: './passenger-choose-ride.page.scss',
})
export class PassengerChooseRidePage {
  constructor(private readonly router: Router) {}

  chooseIndividual(): void {
    void this.router.navigate(['/passenger/dashboard'], { queryParams: { mode: 'individual' } });
  }

  choosePool(): void {
    void this.router.navigate(['/passenger/dashboard'], { queryParams: { mode: 'pool' } });
  }
}
