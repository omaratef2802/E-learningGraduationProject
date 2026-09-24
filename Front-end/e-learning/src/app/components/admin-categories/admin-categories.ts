import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminCategory
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit {

  // =========================================================
  // DATA SERVICE
  // =========================================================

  public readonly data =
    inject(InstructorData);


  // =========================================================
  // CATEGORIES
  // =========================================================

  categories: AdminCategory[] = [];

  filteredCategories: AdminCategory[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedStatus:
    'All'
    | 'Active'
    | 'Inactive' = 'All';


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.categories =
        this.data.getAdminCategories();

      this.applyFilters();

      this.loading = false;

    } catch (error) {

      console.error(
        'Admin Categories Error:',
        error
      );

      this.errorMessage =
        'Unable to load categories.';

      this.loading = false;

    }

  }


  // =========================================================
  // FILTERS
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    this.filteredCategories =
      this.categories.filter(category => {

        const matchesSearch =
          !search ||
          category.name
            .toLowerCase()
            .includes(search) ||
          category.description
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.selectedStatus === 'All' ||
          category.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      });

  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =========================================================
  // CATEGORY STATISTICS
  // =========================================================

  getTotalCategories(): number {

    return this.categories.length;

  }


  getActiveCategories(): number {

    return this.categories.filter(
      category =>
        category.status === 'Active'
    ).length;

  }


  getInactiveCategories(): number {

    return this.categories.filter(
      category =>
        category.status === 'Inactive'
    ).length;

  }


  getTotalCourses(): number {

    return this.categories.reduce(
      (total, category) =>
        total + category.coursesCount,
      0
    );

  }


  getTotalTracks(): number {

    return this.categories.reduce(
      (total, category) =>
        total + category.tracksCount,
      0
    );

  }


  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  getCategoryInitial(
    name: string
  ): string {

    return name
      .charAt(0)
      .toUpperCase();

  }


  getCategoryCourseLabel(
    count: number
  ): string {

    return count === 1
      ? 'Course'
      : 'Courses';

  }


  getCategoryTrackLabel(
    count: number
  ): string {

    return count === 1
      ? 'Track'
      : 'Tracks';

  }

}