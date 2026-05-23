import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';

@Component({
  selector: 'app-landing',
  imports: [Navbar, RouterLink, TranslatePipe, MapPanel],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  readonly year = new Date().getFullYear();
}
