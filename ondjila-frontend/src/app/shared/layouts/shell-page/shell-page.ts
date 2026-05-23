import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shell-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shell-page.html',
  styleUrl: './shell-page.scss',
})
export class ShellPage {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly backLink = input('/passenger/dashboard');
  readonly badge = input('');
}
