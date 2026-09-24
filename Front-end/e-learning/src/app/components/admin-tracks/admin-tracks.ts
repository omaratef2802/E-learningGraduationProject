import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminTrack
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

  // =========================================================
  // DATA SERVICE
  // =========================================================

  public readonly data =
    inject(InstructorData);


  // =========================================================
  // TRACKS
  // =========================================================

  tracks: AdminTrack[] = [];

  filteredTracks: AdminTrack[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedCategory = 'All';

  selectedStatus:
    'All'
    | 'Active'
    | 'Inactive' = 'All';


  categories: string[] = [];


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadTracks();

  }


  // =========================================================
  // LOAD TRACKS
  // =========================================================

  loadTracks(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.tracks =
        this.data.getAdminTracks();


      this.categories = [
        ...new Set(
          this.tracks.map(
            track => track.category
          )
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

        const matchesSearch =
          !search ||
          track.name
            .toLowerCase()
            .includes(search) ||
          track.category
            .toLowerCase()
            .includes(search) ||
          track.description
            .toLowerCase()
            .includes(search);


        const matchesCategory =
          this.selectedCategory === 'All' ||
          track.category === this.selectedCategory;


        const matchesStatus =
          this.selectedStatus === 'All' ||
          track.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesCategory &&
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

    this.selectedStatus = 'All';

    this.applyFilters();

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