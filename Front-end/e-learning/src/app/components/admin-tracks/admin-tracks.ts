import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  InstructorData,
  AdminTrack,
  AdminCategory,
  AdminSubcategory
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-tracks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-tracks.html',
  styleUrl: './admin-tracks.css',
})
export class AdminTracks implements OnInit {

  public readonly data = inject(InstructorData);

  private readonly router = inject(Router);


  // =========================================================
  // TRACKS
  // =========================================================

  tracks: AdminTrack[] = [];

  filteredTracks: AdminTrack[] = [];


  // =========================================================
  // CATEGORIES / SUBCATEGORIES
  // =========================================================

  allCategories: AdminCategory[] = [];

  allSubcategories: AdminSubcategory[] = [];

  categories: string[] = [];

  subcategories: string[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedCategory = 'All';

  selectedSubcategory = 'All';

  selectedStatus:
    | 'All'
    | 'Active'
    | 'Inactive' = 'All';


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // MODAL STATE
  // =========================================================

  showTrackModal = false;

  isEditMode = false;

  editingTrackId = '';


  // =========================================================
  // FORM
  // =========================================================

  trackForm = {
    name: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  };


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadTracks();
  }


  // =========================================================
  // LOAD DATA
  // =========================================================

  loadTracks(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.successMessage = '';


      this.allCategories =
        this.data.getAdminCategories();

      this.allSubcategories =
        this.data.getAdminSubcategories();


      this.tracks =
        this.data.getAdminTracks();


      this.categories = [
        ...new Set(
          this.tracks
            .map(
              track =>
                track.categoryName ||
                track.category
            )
            .filter(Boolean)
        )
      ];


      this.subcategories = [
        ...new Set(
          this.tracks
            .map(
              track =>
                track.subcategoryName
            )
            .filter(Boolean)
        )
      ];


      this.applyFilters();

      this.loading = false;

    } catch (error) {

      console.error(
        'Admin Tracks Error:',
        error
      );

      this.errorMessage =
        'Unable to load tracks.';

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


    this.filteredTracks =
      this.tracks.filter(track => {

        const category =
          track.categoryName ||
          track.category ||
          '';


        const subcategory =
          track.subcategoryName ||
          '';


        const description =
          track.description ||
          '';


        const matchesSearch =
          !search ||
          track.name
            .toLowerCase()
            .includes(search) ||
          category
            .toLowerCase()
            .includes(search) ||
          subcategory
            .toLowerCase()
            .includes(search) ||
          description
            .toLowerCase()
            .includes(search);


        const matchesCategory =
          this.selectedCategory === 'All' ||
          category === this.selectedCategory;


        const matchesSubcategory =
          this.selectedSubcategory === 'All' ||
          subcategory === this.selectedSubcategory;


        const matchesStatus =
          this.selectedStatus === 'All' ||
          track.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesCategory &&
          matchesSubcategory &&
          matchesStatus
        );

      });
  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedCategory = 'All';

    this.selectedSubcategory = 'All';

    this.selectedStatus = 'All';

    this.applyFilters();
  }


  // =========================================================
  // FILTER SUBCATEGORIES
  // =========================================================

  getFilterSubcategories(): string[] {

    if (this.selectedCategory === 'All') {

      return this.subcategories;

    }


    return [
      ...new Set(
        this.tracks
          .filter(track => {

            const category =
              track.categoryName ||
              track.category ||
              '';

            return category ===
              this.selectedCategory;

          })
          .map(
            track =>
              track.subcategoryName
          )
          .filter(Boolean)
      )
    ];
  }


  onFilterCategoryChange(): void {

    this.selectedSubcategory = 'All';

    this.applyFilters();
  }


  // =========================================================
  // ADD TRACK
  // =========================================================

  addTrack(): void {

    this.resetForm();

    this.isEditMode = false;

    this.editingTrackId = '';

    this.showTrackModal = true;

  }


  // =========================================================
  // EDIT TRACK
  // =========================================================

  editTrack(trackId: string): void {

    const track =
      this.data.getAdminTrack(trackId);


    if (!track) {

      this.errorMessage =
        'Track not found.';

      return;
    }


    const category =
      this.allCategories.find(
        item =>
          item.id === track.categoryId ||
          item.name === track.categoryName ||
          item.name === track.category
      );


    this.trackForm = {

      name: track.name,

      categoryId:
        category?.id ||
        track.categoryId ||
        '',

      subcategoryId:
        track.subcategoryId ||
        '',

      description:
        track.description || '',

      status:
        track.status

    };


    this.editingTrackId = track.id;

    this.isEditMode = true;

    this.showTrackModal = true;

  }


  // =========================================================
  // SAVE TRACK
  // =========================================================

  saveTrack(): void {

    this.errorMessage = '';

    this.successMessage = '';


    const name =
      this.trackForm.name.trim();


    const description =
      this.trackForm.description.trim();


    if (!name) {

      this.errorMessage =
        'Please enter a track name.';

      return;
    }


    if (!this.trackForm.categoryId) {

      this.errorMessage =
        'Please select a category.';

      return;
    }


    if (!this.trackForm.subcategoryId) {

      this.errorMessage =
        'Please select a subcategory.';

      return;
    }


    const category =
      this.allCategories.find(
        item =>
          item.id ===
          this.trackForm.categoryId
      );


    const subcategory =
      this.allSubcategories.find(
        item =>
          item.id ===
          this.trackForm.subcategoryId
      );


    if (!category) {

      this.errorMessage =
        'Selected category was not found.';

      return;
    }


    if (!subcategory) {

      this.errorMessage =
        'Selected subcategory was not found.';

      return;
    }


    if (
      subcategory.categoryId !==
      category.id
    ) {

      this.errorMessage =
        'The selected subcategory does not belong to the selected category.';

      return;
    }


    // =======================================================
    // EDIT
    // =======================================================

    if (this.isEditMode) {

      const updated =
        this.data.updateAdminTrack(
          this.editingTrackId,
          {
            name,
            description,
            categoryId: category.id,
            categoryName: category.name,
            category: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            status: this.trackForm.status
          }
        );


      if (!updated) {

        this.errorMessage =
          'Unable to update this track.';

        return;
      }


      this.closeTrackModal();

      this.successMessage =
        'Track updated successfully.';

      this.loadTracks();

      return;
    }


    // =======================================================
    // ADD
    // =======================================================

    const newTrack =
      this.data.addAdminTrack({

        name,

        subcategoryId:
          subcategory.id,

        subcategoryName:
          subcategory.name,

        category:
          category.name,

        categoryId:
          category.id,

        categoryName:
          category.name,

        description,

        coursesCount: 0,

        studentsCount: 0,

        status:
          this.trackForm.status

      });


    if (!newTrack) {

      this.errorMessage =
        'Unable to create this track.';

      return;
    }


    this.closeTrackModal();

    this.successMessage =
      'Track added successfully.';

    this.loadTracks();

  }


  // =========================================================
  // DELETE TRACK
  // =========================================================

  deleteTrack(
    track: AdminTrack
  ): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (track.coursesCount > 0) {

      this.errorMessage =
        `You cannot delete "${track.name}" because it contains ${track.coursesCount} course(s).`;

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${track.name}"?`
      );


    if (!confirmed) {

      return;

    }


    const removed =
      this.data.removeAdminTrack(
        track.id
      );


    if (!removed) {

      this.errorMessage =
        'This track cannot be deleted because it contains courses or active data.';

      return;
    }


    this.successMessage =
      'Track deleted successfully.';

    this.loadTracks();

  }


  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  toggleTrackStatus(
    track: AdminTrack
  ): void {

    const updated =
      this.data.toggleAdminTrackStatus(
        track.id
      );


    if (!updated) {

      this.errorMessage =
        'Unable to update track status.';

      return;
    }


    this.successMessage =
      `Track is now ${
        track.status === 'Active'
          ? 'Inactive'
          : 'Active'
      }.`;

    this.loadTracks();

  }


  // =========================================================
  // VIEW TRACK
  // =========================================================

  viewTrack(
    trackId: string
  ): void {

    this.router.navigate([
      '/admin/tracks',
      trackId
    ]);

  }


  // =========================================================
  // MODAL
  // =========================================================

  closeTrackModal(): void {

    this.showTrackModal = false;

    this.isEditMode = false;

    this.editingTrackId = '';

    this.resetForm();

  }


  resetForm(): void {

    this.trackForm = {

      name: '',

      categoryId: '',

      subcategoryId: '',

      description: '',

      status: 'Active'

    };

  }


  // =========================================================
  // FORM SUBCATEGORIES
  // =========================================================

  getFormSubcategories(): AdminSubcategory[] {

    if (!this.trackForm.categoryId) {

      return [];

    }


    return this.allSubcategories.filter(
      subcategory =>
        subcategory.categoryId ===
        this.trackForm.categoryId
    );

  }


  onFormCategoryChange(): void {

    const currentSubcategory =
      this.allSubcategories.find(
        subcategory =>
          subcategory.id ===
          this.trackForm.subcategoryId
      );


    if (
      currentSubcategory &&
      currentSubcategory.categoryId !==
        this.trackForm.categoryId
    ) {

      this.trackForm.subcategoryId = '';

    }


    if (!this.trackForm.categoryId) {

      this.trackForm.subcategoryId = '';

    }

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  getTotalTracks(): number {

    return this.tracks.length;

  }


  getActiveTracks(): number {

    return this.tracks.filter(
      track =>
        track.status === 'Active'
    ).length;

  }


  getInactiveTracks(): number {

    return this.tracks.filter(
      track =>
        track.status === 'Inactive'
    ).length;

  }


  getTotalCourses(): number {

    return this.tracks.reduce(
      (total, track) =>
        total + track.coursesCount,
      0
    );

  }


  getTotalStudents(): number {

    return this.tracks.reduce(
      (total, track) =>
        total + track.studentsCount,
      0
    );

  }


  // =========================================================
  // HELPERS
  // =========================================================

  getTrackInitial(
    name: string
  ): string {

    return name
      .charAt(0)
      .toUpperCase();

  }


  getCourseLabel(
    count: number
  ): string {

    return count === 1
      ? 'Course'
      : 'Courses';

  }


  getStudentLabel(
    count: number
  ): string {

    return count === 1
      ? 'Student'
      : 'Students';

  }

}