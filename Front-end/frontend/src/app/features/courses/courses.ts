import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course } from '../../core/services/course';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <!-- Header Section -->
      <div class="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div class="absolute top-0 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div class="text-center">
            <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Explore Our <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Courses</span>
            </h1>
            <p class="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Discover thousands of courses taught by expert instructors. Start learning today and transform your career.
            </p>

            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto relative">
              <div class="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2">
                <svg class="w-5 h-5 text-blue-200 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Search for courses, instructors..."
                  class="flex-1 bg-transparent text-white placeholder-blue-200 px-4 py-3 focus:outline-none text-lg"
                >
                <button class="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Filter Bar -->
        <div class="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-gray-100">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Category Filter -->
            <div class="flex-1 min-w-[200px]">
              <select [(ngModel)]="selectedCategory" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
              </select>
            </div>

            <!-- Level Filter -->
            <div class="flex-1 min-w-[200px]">
              <select [(ngModel)]="selectedLevel" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="">All Levels</option>
                <option *ngFor="let level of levels" [value]="level">{{ level }}</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <button (click)="clearFilters()" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors px-4 py-3">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Clear All
            </button>
          </div>
        </div>

        <!-- Results Info -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ filteredCourses.length }} Courses Found
            </h2>
            <p class="text-gray-500 mt-1">Showing results based on your filters</p>
          </div>
        </div>

        <!-- Course Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let course of filteredCourses"
               class="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 cursor-pointer">

            <!-- Course Image -->
            <div class="relative overflow-hidden h-48">
              <img [src]="course.image" [alt]="course.title"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              <!-- Level Badge -->
              <div class="absolute top-3 right-3">
                <span class="bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-3 py-1 rounded-full">
                  {{ course.level }}
                </span>
              </div>

              <!-- Category Overlay -->
              <div class="absolute bottom-3 left-3">
                <span *ngIf="course.category?.name" class="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  {{ course.category.name }}
                </span>
              </div>
            </div>

            <!-- Course Content -->
            <div class="p-5">
              <!-- Title -->
              <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {{ course.title }}
              </h3>

              <!-- Instructor -->
              <p *ngIf="course.instructorId" class="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {{ course.instructorId.firstName }} {{ course.instructorId.lastName }}
              </p>

              <!-- Rating -->
              <div *ngIf="course.rating" class="flex items-center gap-2 mb-3">
                <span class="text-yellow-500 font-bold text-sm">{{ course.rating }}</span>
                <div class="flex text-yellow-400">
                  <svg *ngFor="let star of [1,2,3,4,5]" class="w-4 h-4"
                       [class.text-yellow-400]="star <= course.rating"
                       [class.text-gray-300]="star > course.rating"
                       fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>

              <!-- Course Meta -->
              <div class="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span *ngIf="course.duration" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ course.duration.value }} {{ course.duration.unit }}
                </span>
                <span *ngIf="course.track?.title" class="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span *ngIf="course.track?.title" class="flex items-center gap-1">
                  {{ course.track.title }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ course.description }}</p>

              <!-- Price -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2">
                  <ng-container *ngIf="course.discount; else noDiscount">
                    <span class="text-2xl font-extrabold text-gray-900">\${{ course.price - (course.price * course.discount / 100) | number:'1.2-2' }}</span>
                    <span class="text-sm text-gray-400 line-through">\${{ course.price | number:'1.2-2' }}</span>
                  </ng-container>
                  <ng-template #noDiscount>
                    <span class="text-2xl font-extrabold text-gray-900">\${{ course.price | number:'1.2-2' }}</span>
                  </ng-template>
                </div>
                <div *ngIf="course.discount" class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                  {{ course.discount }}% OFF
                </div>
              </div>
            </div>

            <!-- Hover Action -->
            <div class="px-5 pb-5">
              <button class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25">
                Enroll Now
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredCourses.length === 0" class="text-center py-16">
          <div class="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p class="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button (click)="clearFilters()" class="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CoursesComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  selectedLevel = '';
  courses: any[] = [];
  categories: string[] = [];
  levels: string[] = [];

  constructor(private courseService: Course) {}

  ngOnInit() {
    this.courseService.getAllCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || response || [];
        this.categories = [...new Set(this.courses.map((c: any) => c.category?.name).filter(Boolean))] as string[];
        this.levels = [...new Set(this.courses.map((c: any) => c.level).filter(Boolean))] as string[];
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      }
    });
  }

  get filteredCourses() {
    return this.courses.filter(course => {
      const matchesSearch = !this.searchQuery ||
        course.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (course.instructorId?.firstName + ' ' + course.instructorId?.lastName)
          .toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = !this.selectedCategory ||
        course.category?.name === this.selectedCategory;

      const matchesLevel = !this.selectedLevel ||
        course.level === this.selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
  }
}