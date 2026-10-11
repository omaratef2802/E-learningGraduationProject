import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import Swal from 'sweetalert2';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';

export interface AdminTrack {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  category: string;
  subcategoryId: string;
  subcategoryName: string;
  status: 'Active' | 'Inactive';
  coursesCount: number;
  studentsCount: number;
}
export interface AdminCategory {
  id: string;
  name: string;
}
export interface AdminSubcategory {
  id: string;
  name: string;
  categoryId: string;
}

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

  private adminService = inject(AdminService);
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

  /**
   * `categoryId` is an ObjectId unless the backend populated it, so the display
   * name comes either from the populated document or from the loaded list.
   */
  private trackCategoryName(track: any): string {
    if (track.categoryId && typeof track.categoryId === 'object') {
      return track.categoryId.title ?? track.categoryId.name ?? '';
    }
    return this.allCategories.find((c) => c.id === track.categoryId)?.name ?? '';
  }

  loadTracks(): void {

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.getCategories().subscribe({
      next: (cats) => {
        // The Category schema stores `subcategories` and has no status field
        // or course counters, so those are derived or left at zero.
        this.allCategories = cats.map((c) => ({
          id: c._id,
          name: c.name,
          description: c.description || '',
          subcategoriesCount: c.subcategories?.length ?? 0,
          coursesCount: 0,
          tracksCount: 0,
          status: 'Active'
        }));
        this.allSubcategories = [];
        cats.forEach((c) => {
          c.subcategories?.forEach((sub) => {
            this.allSubcategories.push({
              id: sub._id,
              name: sub.name,
              categoryId: c._id,
              categoryName: c.name,
              status: 'Active'
            } as any);
          });
        });

        this.adminService.getTracks().subscribe({
          next: (tracksData) => {
            // Tracks have no status or counters in the schema.
            this.tracks = tracksData.map((t) => ({
               id: t._id,
               name: t.title,
               description: t.description || '',
               categoryId: typeof t.categoryId === 'object' ? t.categoryId?._id : t.categoryId,
               categoryName: this.trackCategoryName(t),
               category: this.trackCategoryName(t),
               subcategoryId: '',
               subcategoryName: '', 
               status: 'Active',
               coursesCount: 0,
               studentsCount: 0
            }));

            this.categories = [...new Set(this.tracks.map(track => track.categoryName || track.category).filter(Boolean))] as string[];
            this.subcategories = [...new Set(this.tracks.map(track => track.subcategoryName).filter(Boolean))] as string[];

            this.applyFilters();
            this.loading = false;
          },
          error: (err) => {
            console.error('Admin Tracks Error:', err);
            this.errorMessage = 'Unable to load tracks.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Admin Categories Error:', err);
        this.errorMessage = 'Unable to load categories.';
        this.loading = false;
      }
    });
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
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) {
      this.errorMessage = 'Track not found.';
      return;
    }

    const category = this.allCategories.find(
      item => item.id === track.categoryId || item.name === track.categoryName || item.name === track.category
    );

    this.trackForm = {
      name: track.name,
      categoryId: category?.id || track.categoryId || '',
      subcategoryId: track.subcategoryId || '',
      description: track.description || '',
      status: track.status
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

    const name = this.trackForm.name.trim();
    const description = this.trackForm.description.trim();

    if (!name) {
      this.errorMessage = 'Please enter a track name.';
      return;
    }

    if (!this.trackForm.categoryId) {
      this.errorMessage = 'Please select a category.';
      return;
    }

    const category = this.allCategories.find(item => item.id === this.trackForm.categoryId);
    // Removing subcategory strict checks since it might not be strictly required by backend or data structure might have changed
    
    const payload = {
       title: name,
       slug: name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
       description,
       categoryId: this.trackForm.categoryId,
    };

    if (this.isEditMode) {
      this.adminService.updateTrack(this.editingTrackId, payload).subscribe({
         next: () => {
           this.closeTrackModal();
           this.successMessage = 'Track updated successfully.';
           this.loadTracks();
         },
         error: (err) => {
           console.error(err);
           this.errorMessage = 'Unable to update this track.';
         }
      });
      return;
    }

    this.adminService.createTrack(payload).subscribe({
       next: () => {
         this.closeTrackModal();
         this.successMessage = 'Track added successfully.';
         this.loadTracks();
       },
       error: (err) => {
         console.error(err);
         this.errorMessage = 'Unable to create this track.';
       }
    });
  }

  // =========================================================
  // DELETE TRACK
  // =========================================================

  deleteTrack(track: AdminTrack): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (track.coursesCount > 0) {
      this.errorMessage = `You cannot delete "${track.name}" because it contains ${track.coursesCount} course(s).`;
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete "${track.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteTrack(track.id).subscribe({
           next: () => {
             this.successMessage = 'Track deleted successfully.';
             this.loadTracks();
           },
           error: (err) => {
             console.error(err);
             this.errorMessage = 'This track cannot be deleted because it contains courses or active data.';
           }
        });
      }
    });
  }

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  toggleTrackStatus(track: AdminTrack): void {
    const newStatus = track.status === 'Active' ? 'Inactive' : 'Active';
    this.adminService.updateTrack(track.id, { status: newStatus }).subscribe({
       next: () => {
         this.successMessage = `Track is now ${newStatus}.`;
         this.loadTracks();
       },
       error: (err) => {
         console.error(err);
         this.errorMessage = 'Unable to update track status.';
       }
    });
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
