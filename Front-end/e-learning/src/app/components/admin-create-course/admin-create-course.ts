import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-create-course',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-create-course.html',
  styleUrl: './admin-create-course.css'
})
export class AdminCreateCourse implements OnInit {

  private readonly router = inject(Router);
  private adminService = inject(AdminService);

  instructors: any[] = [];
  allCategories: any[] = [];
  allTracks: any[] = [];
  categories: string[] = [];
  tracks: string[] = [];

  title = '';
  description = '';
  category = '';
  track = '';
  level = 'Beginner';
  language = 'English';
  price = '';
  duration = '';
  imageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85';
  objectives = '';
  prerequisites = '';
  selectedInstructorId = '';

  loading = false;
  submitted = false;
  errorMessage = '';

  ngOnInit(): void {
    // Load Instructors
    this.adminService.getAllInstructors().subscribe({
       next: (res: any) => {
         this.instructors = (res.data || res || []).map((i: any) => ({
            id: i._id || i.id,
            name: i.username || i.name || `${i.firstName} ${i.lastName}`,
            email: i.email
         }));
       },
       error: (err) => console.error(err)
    });

    // Load Categories
    this.adminService.getCategories().subscribe({
       next: (res: any) => {
         this.allCategories = res.data || res || [];
         this.categories = this.allCategories.map(c => c.name);
         if (this.categories.length) {
            this.category = this.categories[0];
            this.updateTracks();
         }
       },
       error: (err) => console.error(err)
    });

    // Load Tracks
    this.adminService.getTracks().subscribe({
       next: (res: any) => {
         this.allTracks = res.data || res || [];
         this.updateTracks();
       },
       error: (err) => console.error(err)
    });
  }

  subcategories: string[] = [];
  subcategory = '';

  updateTracks(): void {
    const selectedCat = this.allCategories.find(c => c.name === this.category);
    if (selectedCat) {
      // Subcategories
      this.subcategories = (selectedCat.subcategories || []).map((s: any) => s.name);
      if (!this.subcategories.includes(this.subcategory)) {
        this.subcategory = this.subcategories[0] || '';
      }

      // Tracks
      const catId = selectedCat._id || selectedCat.id;
      this.tracks = this.allTracks
        .filter(t => t.categoryId === catId || t.category === catId || (t.category && t.category._id === catId))
        .map(t => t.name || t.title);
    } else {
      this.subcategories = [];
      this.subcategory = '';
      this.tracks = [];
    }

    if (!this.tracks.includes(this.track)) {
      this.track = this.tracks[0] || '';
    }
  }

  onCategoryChange(): void {
    this.updateTracks();
  }

  createCourse(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.title.trim() || !this.description.trim() || !this.category || !this.selectedInstructorId) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    const instructor = this.instructors.find(item => item.id === this.selectedInstructorId);
    if (!instructor) {
      this.errorMessage = 'Please select a valid instructor.';
      return;
    }

    const catObj = this.allCategories.find(c => c.name === this.category);
    const trackObj = this.allTracks.find(t => t.name === this.track);

    this.loading = true;

    const payload = {
      title: this.title.trim(),
      description: this.description.trim(),
      category: catObj ? (catObj._id || catObj.id) : this.category,
      track: trackObj ? (trackObj._id || trackObj.id) : this.track,
      image: this.imageUrl,
      price: this.price || 0,
      level: this.level,
      language: this.language,
      duration: this.duration,
      objectives: this.objectives.trim(),
      prerequisites: this.prerequisites.trim(),
      instructor: instructor.id
    };

    this.adminService.createCourse(payload).subscribe({
       next: (res: any) => {
         this.loading = false;
         this.router.navigate(['/admin-courses'], { queryParams: { created: res.data?._id || 'true' }});
       },
       error: (err) => {
         console.error('Create Course Error:', err);
         this.loading = false;
         this.errorMessage = 'Unable to create the course. Please try again.';
       }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin-courses']);
  }
}