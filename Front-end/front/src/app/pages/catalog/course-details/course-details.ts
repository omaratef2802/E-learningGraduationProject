import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
selector: 'app-course-details',
standalone: true,
imports: [RouterLink],
templateUrl: './course-details.html',
styleUrl: './course-details.css'
})
export class CourseDetails implements OnInit {
courseTitle = 'React Course';
courseSlug = '';

constructor(private readonly activatedRoute: ActivatedRoute) {}

ngOnInit() {
this.courseSlug = this.activatedRoute.snapshot.paramMap.get('slug') ?? '';
this.courseTitle = this.courseSlug
.split('-')
.filter(Boolean)
.map(word => word.charAt(0).toUpperCase() + word.slice(1))
.join(' ');
}
}
