import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleControls } from '../locale-controls/locale-controls';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [TranslatePipe, LocaleControls],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.scss',
})
export class AdminTopbar {}
