import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_CONFIG } from './footer.config';

@Component({ selector: 'app-footer', standalone: true, imports: [RouterLink], templateUrl: './footer.html', styleUrl: './footer.css' })
export class Footer { protected readonly config = FOOTER_CONFIG; protected readonly year = new Date().getFullYear(); }
