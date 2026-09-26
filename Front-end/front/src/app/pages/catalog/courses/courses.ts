import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type CourseSortOption = 'Most Popular' | 'Price: Low to High' | 'A-Z';
type QuickTag = 'All' | 'Beginner' | 'Advanced Architecture' | 'Next.js & Full-Stack';

type ReactCourse = {
title: string;
badge: string;
level: CourseLevel;
lessons: number;
students: string;
rating: number;
reviews: number;
price: number;
originalPrice: number;
discount: number;
image: string;
instructor: string;
instructorImage: string;
role: string;
description: string;
};

@Component({
selector: 'app-react-courses',
standalone: true,
imports: [FormsModule, RouterLink],
templateUrl: './courses.html',
styleUrl: './courses.css',
})
export class ReactCourses {
searchText = '';
selectedLevel = 'All Levels';
selectedPrice = 'All';
selectedRating = 'Any';
selectedInstructor = 'All';
selectedQuickTag: QuickTag = 'All';
selectedSort: CourseSortOption = 'Most Popular';
currentPage = 1;
paginationStarted = true;
readonly pageSize = 6;

readonly courses: ReactCourse[] = [
{
title: 'React Fundamentals: Modern Hooks & Architecture',
badge: 'BESTSELLER',
level: 'Beginner',
lessons: 6,
students: '18,500 Learners',
rating: 4.8,
reviews: 8400,
price: 29.99,
originalPrice: 69.99,
discount: 57,
image:
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Master JSX, component lifecycle, useState/useEffect, hooks, and clean composable patterns for modern apps.',
},
{
title: 'Advanced React Architecture & Server Components',
badge: 'POPULAR',
level: 'Advanced',
lessons: 12,
students: '32,500 Learners',
rating: 4.9,
reviews: 5800,
price: 49.99,
originalPrice: 99.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Deep-dive into React Server Components, Next.js App Router, streaming, SSR, performance profiling, and more.',
},
{
title: 'Modern State Management: Zustand, Redux & React Query',
badge: 'FEATURED',
level: 'Intermediate',
lessons: 8,
students: '24,500 Learners',
rating: 4.9,
reviews: 4900,
price: 39.99,
originalPrice: 79.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Architect predictable global state, server cache, and data-fetching workflows with the tools teams trust.',
},
{
title: 'Full-Stack Web Development with React & Next.js',
badge: 'NEW',
level: 'Advanced',
lessons: 9,
students: '35,800 Learners',
rating: 4.7,
reviews: 3200,
price: 54.99,
originalPrice: 119.99,
discount: 54,
image:
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Build production-ready full-stack applications with React, Next.js, APIs, authentication, and deployment.',
},
{
title: 'React Native: Cross-Platform iOS & Android Apps',
badge: 'POPULAR',
level: 'Intermediate',
lessons: 7,
students: '25,800 Learners',
rating: 4.8,
reviews: 4100,
price: 44.99,
originalPrice: 89.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Translate React skills into polished native mobile experiences with navigation, data, and platform APIs.',
},
{
title: 'Testing & Enterprise Performance for React Apps',
badge: 'FEATURED',
level: 'Advanced',
lessons: 7,
students: '20,200 Learners',
rating: 4.9,
reviews: 2800,
price: 34.99,
originalPrice: 69.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Ship reliable React systems with testing, profiling, accessibility, observability, and Web Vitals.',
},
{
title: 'React UI Systems with Tailwind and Radix',
badge: 'POPULAR',
level: 'Intermediate',
lessons: 8,
students: '15,400 Learners',
rating: 4.8,
reviews: 217,
price: 42.99,
originalPrice: 84.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Create consistent, accessible interfaces with reusable React components and modern design systems.',
},
{
title: 'React Accessibility and Inclusive UX',
badge: 'FEATURED',
level: 'Intermediate',
lessons: 5,
students: '11,200 Learners',
rating: 4.7,
reviews: 184,
price: 27.99,
originalPrice: 54.99,
discount: 49,
image:
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Build keyboard-friendly, inclusive React applications with semantic HTML and accessible interaction patterns.',
},
{
title: 'GraphQL APIs with React Applications',
badge: 'NEW',
level: 'Advanced',
lessons: 9,
students: '13,700 Learners',
rating: 4.8,
reviews: 206,
price: 46.99,
originalPrice: 94.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Connect React frontends to typed GraphQL APIs with caching, pagination, mutations, and optimistic updates.',
},
{
title: 'React Animations and Interactive Experiences',
badge: 'POPULAR',
level: 'Beginner',
lessons: 6,
students: '10,900 Learners',
rating: 4.6,
reviews: 162,
price: 31.99,
originalPrice: 64.99,
discount: 51,
image:
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Add meaningful motion to React products with transitions, gestures, layout animation, and performance in mind.',
},
{
title: 'Production React Deployment and DevOps',
badge: 'FEATURED',
level: 'Advanced',
lessons: 7,
students: '8,600 Learners',
rating: 4.7,
reviews: 139,
price: 38.99,
originalPrice: 77.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description: 'Deploy reliable React applications with CI/CD, environment configuration, monitoring, and edge delivery.',
},
{
title: 'React Interview and Frontend System Design',
badge: 'BESTSELLER',
level: 'Advanced',
lessons: 6,
students: '9,300 Learners',
rating: 4.9,
reviews: 241,
price: 35.99,
originalPrice: 71.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description:
  'Prepare for senior frontend interviews with React challenges, architecture exercises, and practical system design.',
},
{
title: 'React Forms, Validation and Data Flow',
badge: 'POPULAR',
level: 'Beginner',
lessons: 6,
students: '12,400 Learners',
rating: 4.7,
reviews: 198,
price: 28.99,
originalPrice: 57.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Build robust React forms with validation, reusable field components, controlled inputs, and clean data flow.',
},
{
title: 'React Performance Optimization',
badge: 'FEATURED',
level: 'Advanced',
lessons: 7,
students: '14,100 Learners',
rating: 4.8,
reviews: 223,
price: 41.99,
originalPrice: 83.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Sara Mohamed',
instructorImage:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Staff Frontend Engineer',
description: 'Improve React rendering, bundle size, data loading, and Web Vitals with practical profiling techniques.',
},
{
title: 'React Design Systems in Production',
badge: 'NEW',
level: 'Intermediate',
lessons: 8,
students: '10,700 Learners',
rating: 4.7,
reviews: 176,
price: 45.99,
originalPrice: 91.99,
discount: 50,
image:
  'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&h=540&q=90',
instructor: 'Ahmed Hassan',
instructorImage:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85',
role: 'Senior React Architect',
description:
  'Create scalable component libraries and design tokens that keep React products consistent across teams.',
},
];

readonly extraCourses: ReactCourse[] = [
'React Routing and Navigation',
'React Authentication Patterns',
'React Native Animations',
'React Micro Frontends',
'React Error Handling',
'React with Firebase',
'React Internationalization',
'React Charts and Dashboards',
'React Build Tools',
'React Code Quality',
'React WebSockets',
'React Offline Experiences',
'React Feature Flags',
'React Monorepo Workflows',
'React Capstone Project',
].map((title, index): ReactCourse => {
const level: CourseLevel =
index % 3 === 0 ? 'Beginner' : index % 3 === 1 ? 'Intermediate' : 'Advanced';

return {
title,
badge: index % 2 === 0 ? 'POPULAR' : 'NEW',
level,
lessons: 6 + (index % 6),
students: `${8_500 + index * 700} Learners`,
rating: Number((4.6 + (index % 4) / 10).toFixed(1)),
reviews: 1400 + index * 170,
price: 27.99 + index,
originalPrice: 55.99 + index * 2,
discount: 50,
image: [
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1504384308090-c894fdcc3d9a?auto=format&fit=crop&w=900&h=540&q=90',
'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&h=540&q=90',
][index % 15],
instructor: index % 2 === 0 ? 'Ahmed Hassan' : 'Sara Mohamed',
instructorImage:
index % 2 === 0
? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=85'
: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=85',
role: index % 2 === 0 ? 'Senior React Architect' : 'Staff Frontend Engineer',
description:
'Build practical React skills through focused projects, modern patterns, and production-ready frontend workflows.',
};
});

get allCourses(): ReactCourse[] {
return [...this.courses, ...this.extraCourses].slice(0, 12);
}

formatReviews(reviews: number): string {
return reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k` : `${(reviews / 100).toFixed(1)}k`;
}

get filteredCourses(): ReactCourse[] {
const search = this.searchText.toLowerCase().trim();

const result = this.allCourses.filter((course) => {
const matchesSearch =
!search || `${course.title} ${course.description} ${course.level}`.toLowerCase().includes(search);
const matchesLevel = this.selectedLevel === 'All Levels' || course.level === this.selectedLevel;
const matchesPrice =
this.selectedPrice === 'All' ||
(this.selectedPrice === 'Under $30' && course.price < 30) ||
(this.selectedPrice === '$30 - $50' && course.price >= 30 && course.price <= 50) ||
(this.selectedPrice === 'Over $50' && course.price > 50);
const matchesRating =
this.selectedRating === 'Any' ||
(this.selectedRating === '4.5+' && course.rating >= 4.5) ||
(this.selectedRating === '4.8+' && course.rating >= 4.8);
const matchesInstructor =
this.selectedInstructor === 'All' || course.instructor === this.selectedInstructor;
const searchableCourse = `${course.title} ${course.description}`.toLowerCase();
const matchesQuickTag =
this.selectedQuickTag === 'All' ||
(this.selectedQuickTag === 'Beginner' && course.level === 'Beginner') ||
(this.selectedQuickTag === 'Advanced Architecture' && searchableCourse.includes('architecture')) ||
(this.selectedQuickTag === 'Next.js & Full-Stack' && searchableCourse.includes('next.js'));

return (
matchesSearch &&
matchesLevel &&
matchesPrice &&
matchesRating &&
matchesInstructor &&
matchesQuickTag
);
});

return this.sortCourses(result);
}

get paginatedCourses(): ReactCourse[] {
if (!this.paginationStarted) return this.filteredCourses;
const start = (this.currentPage - 1) * this.pageSize;
return this.filteredCourses.slice(start, start + this.pageSize);
}

get pageNumbers(): number[] {
return Array.from(
{ length: Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize)) },
(_, index) => index + 1,
);
}

setPage(page: number): void {
this.paginationStarted = true;
this.currentPage = Math.min(Math.max(page, 1), this.pageNumbers.length);
}

setQuickTag(tag: QuickTag): void {
this.selectedQuickTag = tag;
this.paginationStarted = true;
this.currentPage = 1;
}

courseSlug(title: string): string {
return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

resetFilters(): void {
this.searchText = '';
this.selectedLevel = 'All Levels';
this.selectedPrice = 'All';
this.selectedRating = 'Any';
this.selectedInstructor = 'All';
this.selectedQuickTag = 'All';
this.selectedSort = 'Most Popular';
this.currentPage = 1;
this.paginationStarted = true;
}

clearFilters(): void {
this.resetFilters();
}

private sortCourses(courses: ReactCourse[]): ReactCourse[] {
switch (this.selectedSort) {
case 'Most Popular':
return [...courses].sort((a, b) => b.rating - a.rating);
case 'Price: Low to High':
return [...courses].sort((a, b) => a.price - b.price);
case 'A-Z':
return [...courses].sort((a, b) => a.title.localeCompare(b.title));
default:
return courses;
}
}
}
