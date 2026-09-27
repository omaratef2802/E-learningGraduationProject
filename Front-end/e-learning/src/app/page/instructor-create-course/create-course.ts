import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CREATE_COURSE_CONFIG } from './create-course.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorData } from '../instructor-data';
import { InstructorService } from '../../services/instructor.service';

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

  private readonly router = inject(Router);
  protected readonly data = inject(InstructorData);
  private instructorService = inject(InstructorService);

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

  allCategories: any[] = [];
  allTracks: any[] = [];
  
  availableSubcategories: any[] = [];
  availableTracks: any[] = [];

  ngOnInit(): void {
    this.instructorService.getCategories().subscribe({
      next: (res: any) => { 
        this.allCategories = res.categories || res.data || (Array.isArray(res) ? res : []);
        this.updateDropdowns();
      },
      error: (err) => console.error(err)
    });
    this.instructorService.getTracks().subscribe({
      next: (res: any) => { 
        this.allTracks = res.tracks || res.data || (Array.isArray(res) ? res : []);
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
    let selectedCat = this.allCategories.find(c => c.name === this.category);
    if (!selectedCat) {
      selectedCat = this.allCategories[0];
      this.category = selectedCat.name;
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
      const catId = selectedCat._id || selectedCat.id;
      this.availableTracks = this.allTracks.filter(t => t.categoryId === catId || t.category === catId || (t.category && (t.category._id === catId || t.category.id === catId)));
      
      if (this.availableTracks.length > 0) {
        if (!this.availableTracks.find(t => t.name === this.track || t.title === this.track)) {
          this.track = this.availableTracks[0].name || this.availableTracks[0].title;
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
    const courseTitle = this.title.trim() || 'Untitled Course';
    let catId = this.allCategories.find(c => c.name.toLowerCase() === this.category.toLowerCase())?._id;
    let trackId = this.allTracks.find(t => t.name.toLowerCase() === this.track.toLowerCase())?._id;
    
    // Fallback to first available category/track if not exact match (to prevent API crash)
    if (!catId && this.allCategories.length) catId = this.allCategories[0]._id;
    if (!trackId && this.allTracks.length) trackId = this.allTracks[0]._id;

    const payload = {
      title: courseTitle,
      description: this.description || 'Course description',
      category: catId,
      track: trackId,
      price: this.price || 0,
      level: this.level,
      language: this.language,
      duration: this.duration,
      objectives: this.objectives,
      prerequisites: this.prerequisites
    };

    this.instructorService.createCourse(payload).subscribe({
      next: (res: any) => {
        const newCourseId = res.data?._id || res.data?.id;
        
        // Add to local mock data so other parts of UI don't crash before they are fully migrated
        this.data.addCourse({
          id: newCourseId,
          title: courseTitle,
          category: `${this.category} + ${this.track}`,
          image: this.imageUrl,
          price: `$${this.price || '0'}`,
          students: '0',
          rating: '—',
          updated: 'Just now',
          status: 'Draft'
        } as any);

        if (action === 'continue') {
          this.router.navigate(['/instructor-course-curriculum'], {
            queryParams: { course: courseTitle, courseId: newCourseId }
          });
        } else {
          this.router.navigate(['/instructor-catalog']);
        }
      },
      error: (err) => {
        console.error('Failed to create course:', err);
        alert('Failed to create course. Make sure you are logged in as instructor and fill required fields.');
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