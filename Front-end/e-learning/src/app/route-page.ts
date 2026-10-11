import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-route-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './route-page.html',
  styleUrl: './route-page.css',
})
export class RoutePage {
  private readonly route = inject(ActivatedRoute);
  readonly page = this.route.snapshot.data['page'] as { eyebrow: string; title: string; description: string };
}
