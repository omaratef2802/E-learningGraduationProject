import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { INSTRUCTORS_CONFIG, InstructorItem } from './instructors.config';
import { InstructorDataService } from '../../services/instructor-data.service';
import { PublicInstructor } from '../../mock-types';

@Component({
  selector: 'app-instructors',
  standalone: true,
  templateUrl: './instructors.html',
  styleUrl: './instructors.css',
})
export class Instructors implements OnInit {
  private readonly router = inject(Router);
  private readonly data = inject(InstructorDataService);
  // Zoneless app: async callbacks must schedule change detection themselves.
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected readonly config = INSTRUCTORS_CONFIG;

  /** Active instructor profiles are public on the landing page. */
  protected instructors: PublicInstructor[] = [];

  ngOnInit(): void {
    this.data.getPublicInstructors().subscribe({
      next: (instructors) => {
        this.instructors = instructors;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching instructors:', err);
        this.changeDetector.detectChanges();
      },
    });
  }

  get instructorsList(): InstructorItem[] {
    const tones = ['violet', 'cyan', 'coral', 'gold'];
    return this.instructors.map((instructor, index) => ({
      id: instructor._id,
      name: `${instructor.firstName} ${instructor.lastName}`.trim(),
      role: 'Instructor',
      bio: instructor.bio || 'Explore this instructor’s courses and learning resources.',
      image: instructor.img || '',
      rating: '—',
      learners: '—',
      tone: tones[index % tones.length],
    }));
  }

  viewInstructor(instructor: InstructorItem): void {
    this.router.navigate(['/instructor', instructor.id], {
      queryParams: { name: instructor.name },
    });
  }
}



