import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Courses } from '../../../components/courses/courses';
import { InstructorService } from '../../../services/instructor.service';
import { Track } from '../../../mock-types';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, RouterLink, Courses],
  templateUrl: './track.html',
  styleUrl: './track.css',
})
export class TrackPage implements OnInit {
  searchText = '';

  /** The track the URL points at, resolved from its own id. */
  public trackId = '';
  public trackData: Track | null = null;
  public courseCount = 0;

  public loading = true;
  public errorMessage = '';

  private readonly backend = inject(InstructorService);
  private readonly route = inject(ActivatedRoute);
  // Zoneless app: async callbacks must schedule change detection themselves.
  private readonly changeDetector = inject(ChangeDetectorRef);

  ngOnInit() {
    this.trackId = this.route.snapshot.paramMap.get('trackId') || '';

    if (!this.trackId) {
      this.loading = false;
      this.errorMessage = 'No track was selected.';
      return;
    }

    this.loadTrack();
  }

  private loadTrack() {
    this.loading = true;
    this.errorMessage = '';

    // GET /track/trackById/:id answers with `{ track }`, which the service
    // normalises to a single-element array.
    this.backend.getTrackById(this.trackId).subscribe({
      next: (tracks) => {
        this.trackData = tracks[0] ?? null;

        if (!this.trackData) {
          this.errorMessage = 'That track could not be found.';
        }

        this.loading = false;
        this.changeDetector.detectChanges();
        if (this.trackData) {
          this.backend.getCoursesByTrack(this.trackId).subscribe({
            next: (courses) => {
              this.courseCount = courses.length;
              this.changeDetector.detectChanges();
            },
            error: () => {},
          });
        }
      },
      error: (err) => {
        console.error('Error fetching track:', err);
        this.errorMessage = 'Unable to load this track.';
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }
}
