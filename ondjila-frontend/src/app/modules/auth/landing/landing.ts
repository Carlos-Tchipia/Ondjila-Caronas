import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-landing',
  imports: [Navbar, RouterLink, TranslatePipe],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  readonly year = new Date().getFullYear();
}
