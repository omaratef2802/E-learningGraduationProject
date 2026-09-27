import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
selector: 'app-subcategory',
standalone: true,
imports: [FormsModule, RouterLink],
templateUrl: './subcategory.html',
styleUrl: './subcategory.css'
})
export class Subcategory {

searchText = '';
selectedSort = 'Most Popular';

subcategories = [
{
name: 'Programming Fundamentals',
level: 'Beginner',
courses: 35,
lessons: 120,
learners: '15K+',
description:
'Learn programming fundamentals, problem solving and core concepts from scratch.',
image:
'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&h=700&q=90',
route: '/catalog/web-development/programming'
},

{
name: 'Front-End Development',
level: 'Beginner',
courses: 40,
lessons: 145,
learners: '18K+',
description:
'Build modern and responsive websites using HTML, CSS, JavaScript and modern frameworks.',
image:
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=700&q=90',
route: '/catalog/web-development/front-end'
},

{
name: 'Back-End Development',
level: 'Intermediate',
courses: 28,
lessons: 110,
learners: '13K+',
description:
'Learn servers, APIs, databases and backend technologies for scalable web applications.',
image:
'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=700&q=90',
route: '/catalog/web-development/back-end'
},

{
name: 'Full-Stack Development',
level: 'Advanced',
courses: 24,
lessons: 130,
learners: '12K+',
description:
'Master both frontend and backend development and build complete web applications.',
image:
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=700&q=90',
route: '/catalog/web-development/full-stack'
},

{
name: 'Mobile App Development',
level: 'Intermediate',
courses: 18,
lessons: 95,
learners: '9K+',
description:
'Create modern mobile applications using popular development technologies and frameworks.',
image:
'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&h=700&q=90',
route: '/catalog/web-development/mobile'
}
];


get filteredSubcategories() {

const search = this.searchText.toLowerCase().trim();

let result = this.subcategories.filter(item => {

const searchableText = [
item.name,
item.level,
item.description
]
.join(' ')
.toLowerCase();

return search === '' || searchableText.includes(search);
});


if (this.selectedSort === 'Most Popular') {

result = [...result].sort(
(a, b) =>
parseInt(b.learners) - parseInt(a.learners)
);
}


if (this.selectedSort === 'A-Z') {

result = [...result].sort(
(a, b) =>
a.name.localeCompare(b.name)
);
}


if (this.selectedSort === 'Z-A') {

result = [...result].sort(
(a, b) =>
b.name.localeCompare(a.name)
);
}


if (this.selectedSort === 'Courses: Low to High') {

result = [...result].sort(
(a, b) =>
a.courses - b.courses
);
}


if (this.selectedSort === 'Courses: High to Low') {

result = [...result].sort(
(a, b) =>
b.courses - a.courses
);
}


return result;
}


clearFilters() {

this.searchText = '';
this.selectedSort = 'Most Popular';
}

}