import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InstructorData } from '../instructor-data';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';

@Component({
  selector: 'app-instructor-catalog',
  standalone: true,
  imports: [
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class InstructorCatalog {

  protected readonly data =
    inject(InstructorData);

}