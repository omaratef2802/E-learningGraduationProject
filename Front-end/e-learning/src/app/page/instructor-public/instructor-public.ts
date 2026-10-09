import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Courses } from '../../components/courses/courses';
import { InstructorDataService } from '../../services/instructor-data.service';
import { PublicInstructor } from '../../mock-types';

@Component({
  selector: 'app-instructor-public',
  standalone: true,
  imports: [CommonModule, RouterLink, Courses],
  templateUrl: './instructor-public.html',
  styleUrl: './instructor-public.css'
})
export class InstructorPublicPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(InstructorDataService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** Either a Mongo id (from the landing page) or a legacy name slug. */
  instructorId = '';
  instructorName: string = '';
  instructor: PublicInstructor | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('name') || '';
      const previewName = this.route.snapshot.queryParamMap.get('name') || '';
      this.instructorId = slug;
      this.instructorName = previewName || this.toTitleCase(slug);

      this.data.getPublicInstructors().subscribe({
        next: (instructors) => {
          const match =
            instructors.find((item) => item._id === slug) ||
            instructors.find((item) => this.slugify(`${item.firstName} ${item.lastName}`) === slug);
          if (match) {
            this.instructor = match;
            this.instructorId = match._id;
            this.instructorName = this.toTitleCase(`${match.firstName} ${match.lastName}`.trim());
          }
          this.changeDetector.detectChanges();
        },
        error: () => this.changeDetector.detectChanges(),
      });
    });
  }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private toTitleCase(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
