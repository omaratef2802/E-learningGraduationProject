import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Courses } from '../../components/courses/courses';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [RouterLink, Courses],
  templateUrl: './all-courses.html',
  styleUrl: './all-courses.css',
})
export class AllCoursesPage {}
