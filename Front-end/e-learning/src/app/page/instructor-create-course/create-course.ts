import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CREATE_COURSE_CONFIG } from './create-course.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorService } from '../../services/instructor.service';
import { InstructorDataService } from '../../services/instructor-data.service';

@Component({
  selector: 'app-instructor-create-course',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './create-course.html',
  styleUrl: './create-course.css',
})
export class InstructorCreateCourse implements OnInit {
  public data: any = { instructor: {} };

  private readonly router = inject(Router);
    private instructorService = inject(InstructorService);
  private readonly instructorData = inject(InstructorDataService);

  protected readonly config = CREATE_COURSE_CONFIG;
  protected activeNav = 'Create Course';
  protected title = 'Full-Stack Web Development with React & Node.js';
  protected description = 'Master frontend engineering, state flow management, scalable RESTful architecture, and end-to-end database integrations through production-ready real-world exercises.';
  protected category = '';
  protected subcategory = '';
  protected track = '';
  protected level = 'Intermediate';
  protected price = '79.99';
  protected duration = '24 hours (36 lessons)';
  protected language = 'English';
  protected objectives = '';
  protected prerequisites = '';
  protected imageUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=85';
  protected imageName = 'Preview Image Banner';
  protected createError = '';
  protected isCreating = false;

  allCategories: any[] = [];
  allTracks: any[] = [];
  
  availableSubcategories: any[] = [];
  availableTracks: any[] = [];

  ngOnInit(): void {
    this.instructorData.getProfile().subscribe({
      next: (profile) => this.data.instructor = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        image: profile.img || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        role: profile.role || 'Instructor',
      },
      error: () => {},
    });
    this.instructorService.getCategories().subscribe({
      next: (cats) => { 
         this.allCategories = cats;
        this.updateDropdowns();
      },
      error: (err) => console.error(err)
    });
    this.instructorService.getTracks().subscribe({
      next: (tracks) => { 
         this.allTracks = tracks;
        this.updateDropdowns();
      },
      error: (err) => console.error(err)
    });
  }

  protected get categoryOptions() {
    return this.config.options[this.category as keyof typeof this.config.options] || this.config.options['Web Development'];
  }

  onCategoryChange(): void {
    this.updateDropdowns();
  }

  updateDropdowns(): void {
    if (!this.allCategories.length) return;

    // Find selected category object
    let selectedCat = this.allCategories.find(c => (c.name || c.title) === this.category || c._id === this.category);
    if (!selectedCat) {
      selectedCat = this.allCategories[0];
      this.category = selectedCat.name || selectedCat.title;
    }

    // Set Subcategories
    this.availableSubcategories = selectedCat.subcategories || [];
    if (this.availableSubcategories.length > 0) {
      // Keep selected subcategory if it exists in new list, else select first
      if (!this.availableSubcategories.find(s => s.name === this.subcategory)) {
        this.subcategory = this.availableSubcategories[0].name;
      }
    } else {
      this.subcategory = '';
    }

    // Set Tracks based on Category ID
    if (this.allTracks.length > 0) {
      const catId = selectedCat._id;
      this.availableTracks = this.allTracks.filter((track) => {
        const relation = track.categoryId ?? (track as any).category;
        const relationId = typeof relation === 'object' ? relation?._id : relation;
        return String(relationId ?? '') === String(catId);
      });
      
      if (this.availableTracks.length > 0) {
        if (!this.availableTracks.some((item) => item._id === this.track)) {
          this.track = this.availableTracks[0]._id;
        }
      } else {
        this.track = '';
      }
    }
  }

  onSubcategoryChange(): void {
    // Optional: any specific logic when subcategory changes
  }

  onTrackChange(): void {
    // Optional: any specific logic when track changes
  }

  setActiveNav(item: string): void {
    this.activeNav = item;
    const routes: Record<string, string> = {
      Dashboard: '/instructor-dashboard',
      'My Courses': '/instructor-catalog',
      'Create Course': '/instructor-create-course',
      Students: '/students',
      Certificates: '/certificates',
      Notifications: '/instructor-notifications',
      Profile: '/instructor-profile'
    };
    const route = routes[item];
    if (route) {
      this.router.navigate([route]);
    }
  }

  saveDraft(): void {
    this.createCourseAPI('draft');
  }

  createCourse(): void {
    this.createCourseAPI('continue');
  }
  
  private createCourseAPI(action: 'draft' | 'continue'): void {
    this.createError = '';
    const courseTitle = this.title.trim() || 'Untitled Course';
    const category = this.allCategories.find((item) => (item.name || item.title) === this.category || item._id === this.category);
    const selectedTrack = this.availableTracks.find((item) => item._id === this.track);
    const catId = category?._id;
    const trackId = selectedTrack?._id;

    if (!catId || !trackId) {
      this.createError = 'Choose a category and a track that belongs to it before creating the course.';
      return;
    }

    const normalizedLevel = this.level.toLowerCase().includes('advanced')
      ? 'advanced'
      : this.level.toLowerCase().includes('intermediate')
        ? 'intermediate'
        : 'beginner';
    const slugBase = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const payload = {
      title: courseTitle,
      slug: `${slugBase || 'course'}-${Date.now()}`,
      description: this.description || 'Course description',
      category: catId,
      track: trackId,
      image: this.imageUrl || undefined,
      price: Number(this.price) || 0,
      level: normalizedLevel,
      language: this.language,
      duration: parseInt(this.duration, 10) || 1,
      objectives: (this.objectives || '').split('\n').filter(Boolean),
      prerequisites: (this.prerequisites || '').split('\n').filter(Boolean)
    };

    this.isCreating = true;
    this.instructorService.createCourse(payload).subscribe({
      next: (res: any) => {
        this.isCreating = false;
        const newCourseId = res.data?._id || res.data?.id;
        
        // Add to local mock data so other parts of UI don't crash before they are fully migrated
        

        if (action === 'continue') {
          this.router.navigate(['/instructor-course-curriculum'], {
            queryParams: { course: courseTitle, courseId: newCourseId }
          });
        } else {
          this.router.navigate(['/instructor-catalog']);
        }
      },
      error: (err) => {
        this.isCreating = false;
        console.error('Failed to create course:', err);
        this.createError = err.error?.message || 'Could not create the course. Check the required fields and try again.';
      }
    });
  }

  chooseImage(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(fileInput: HTMLInputElement): void {
    this.imageUrl = '';
    this.imageName = 'No image selected';
    fileInput.value = '';
  }
}











