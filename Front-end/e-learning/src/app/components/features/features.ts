import { Component } from '@angular/core';
import { FEATURES_CONFIG } from './features.config';

@Component({
  selector: 'app-features',
  standalone: true,
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  protected readonly config = FEATURES_CONFIG;
}
