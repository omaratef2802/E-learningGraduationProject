import { Component } from '@angular/core';

@Component({
  selector: 'app-certificates',
  standalone: true,
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-slate-900">Certificates</h1>
      <p class="text-slate-500">View and download your verified course credentials.</p>
    </div>
  `
})
export class CertificatesComponent {}
