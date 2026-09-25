import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TrackLevel = 'Beginner' | 'Intermediate' | 'Advanced';

type TrackSortOption =
| 'Most Popular'
| 'A-Z'
| 'Most Courses';

type TrackItem = {
title: string;
level: TrackLevel;
levelRange: string;
rating: number;
courses: number;
weeks: number;
learners: string;
image: string;
description: string;
route: string;
};

@Component({
selector: 'app-front-end-tracks',
standalone: true,
imports: [FormsModule, RouterLink],
templateUrl: './front-end-tracks.html',
styleUrl: './front-end-tracks.css',
})
export class FrontEndTracks {
searchText = '';
selectedLevel = 'All';
selectedDuration = 'Any Duration';
selectedRating = 'Any Rating';
selectedSort: TrackSortOption = 'Most Popular';

readonly tracks: TrackItem[] = [
{
title: 'HTML5 & Modern CSS3',
level: 'Beginner',
levelRange: 'Beginner',
rating: 4.8,
courses: 7,
weeks: 6,
learners: '14,200 Learners',
image:
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Master semantic markup, responsive flexbox and grid layouts, modern CSS architecture, cross-browser accessibility.',
route: '/catalog/web-development/front-end/html-css',
},
{
title: 'JavaScript Mastery',
level: 'Beginner',
levelRange: 'Beginner -> Intermediate',
rating: 4.9,
courses: 10,
weeks: 8,
learners: '16,800 Learners',
image:
'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Deep dive into modern ES6+, asynchronous JavaScript, DOM manipulation, closures, event-driven architecture, and APIs.',
route: '/catalog/web-development/front-end/javascript',
},
{
title: 'TypeScript for Enterprise',
level: 'Intermediate',
levelRange: 'Intermediate -> Advanced',
rating: 4.9,
courses: 6,
weeks: 6,
learners: '9,700 Learners',
image:
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Write scalable, type-safe frontend code using interfaces, generics, type narrowing, and advanced compiler configurations.',
route: '/catalog/web-development/front-end/typescript',
},
{
title: 'React Development',
level: 'Beginner',
levelRange: 'Beginner -> Advanced',
rating: 4.9,
courses: 12,
weeks: 8,
learners: '18,500 Learners',
image:
'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Master React, modern hooks, component architecture, state management, and performance patterns for production apps.',
route: '/catalog/web-development/front-end/react',
},
{
title: 'Vue.js 3 Ecosystem',
level: 'Intermediate',
levelRange: 'Intermediate',
rating: 4.8,
courses: 8,
weeks: 7,
learners: '9,700 Learners',
image:
'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Build fast, reactive web applications with Vue 3, Composition API, Pinia state store, Vue Router, and Vue tooling.',
route: '/catalog/web-development/front-end/vue',
},
{
title: 'Angular Enterprise Architecture',
level: 'Advanced',
levelRange: 'Advanced',
rating: 4.7,
courses: 9,
weeks: 10,
learners: '6,400 Learners',
image:
'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&h=560&q=90',
description:
'Architect robust enterprise applications with Angular components, dependency injection, RxJS reactive streams, and NgRx.',
route: '/catalog/web-development/front-end/angular',
},
];

get filteredTracks(): TrackItem[] {
const search = this.searchText.toLowerCase().trim();

const result = this.tracks.filter((track) => {
const matchesSearch =
!search ||
`${track.title} ${track.description} ${track.level}`
.toLowerCase()
.includes(search);

const matchesLevel =
this.selectedLevel === 'All' ||
track.level === this.selectedLevel;

const matchesRating =
this.selectedRating === 'Any Rating' ||
(this.selectedRating === '4.5+' && track.rating >= 4.5) ||
(this.selectedRating === '4.8+' && track.rating >= 4.8);

const matchesDuration =
this.selectedDuration === 'Any Duration' ||
(this.selectedDuration === 'Under 7 Weeks' &&
track.weeks < 7) ||
(this.selectedDuration === '7+ Weeks' &&
track.weeks >= 7);

return (
matchesSearch &&
matchesLevel &&
matchesRating &&
matchesDuration
);
});

return this.sortTracks(result);
}

clearFilters(): void {
this.searchText = '';
this.selectedLevel = 'All';
this.selectedDuration = 'Any Duration';
this.selectedRating = 'Any Rating';
this.selectedSort = 'Most Popular';
}

private sortTracks(tracks: TrackItem[]): TrackItem[] {
switch (this.selectedSort) {
case 'Most Popular':
return [...tracks].sort(
(a, b) => b.rating - a.rating
);

case 'A-Z':
return [...tracks].sort((a, b) =>
a.title.localeCompare(b.title)
);

case 'Most Courses':
return [...tracks].sort(
(a, b) => b.courses - a.courses
);

default:
return tracks;
}
}
}