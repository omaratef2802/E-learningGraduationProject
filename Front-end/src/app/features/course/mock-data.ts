import {
  ICourseDetails,
  ILesson,
  IRelatedCourse,
  IReview,
  ISection,
} from './models';

export const MOCK_COURSE: ICourseDetails = {
  _id: '6aadbda18bcef3360dc2dd',
  title: 'Complete React Development',
  description:
    'Learn React through practical projects and build modern interactive web applications. Master components, state management, hooks, and clean architecture.',
  price: 49.99,
  oldPrice: 99.99,
  discount: '50% OFF',
  urgency: '2 days left at this price',
  level: 'Intermediate',
  badge: 'Bestseller',
  lastUpdated: 'October 2024',
  hours: 14,
  lessonCount: 42,
  students: '12,800',
  rating: 4.9,
  reviews: '2,450',
  language: 'English (Audio & Subtitles)',
  instructor: {
    name: 'Sara Mohamed',
    badge: 'Top Rated',
    role: 'Staff Frontend Lead & Author',
    rating: 4.9,
    studentsCount: '48,200+ Students',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    bio: 'Sara has over a decade of experience leading front-end engineering teams and specializes in modern React architecture and performant web applications.',
  },
  outcomes: [
    'Build React applications',
    'Create reusable components',
    'Work with APIs & server data',
    'Manage application state (Zustand & Context)',
    'Implement routing & navigation',
    'Build responsive interfaces',
  ],
  requirements: [
    'Basic HTML, CSS and JavaScript fundamentals (ES6+ recommended)',
    'Computer with internet access & modern browser (Chrome, Edge, or Firefox)',
    'Basic programming knowledge and willingness to learn',
  ],
  ratingDistribution: [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 10 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
  includes: [
    { icon: 'video', text: '14 hours on-demand video' },
    { icon: 'file', text: '42 lessons & source files' },
    { icon: 'infinity', text: 'Full lifetime access' },
    { icon: 'devices', text: 'Access on mobile, tablet & desktop' },
    { icon: 'certificate', text: 'Certificate of completion' },
  ],
};

export const MOCK_SECTIONS: ISection[] = [
  { _id: 's1', title: 'Section 1: React Fundamentals', courseId: '6aadbda18bcef3360dc2dd', order: 1 },
  { _id: 's2', title: 'Section 2: Working with Data', courseId: '6aadbda18bcef3360dc2dd', order: 2 },
  { _id: 's3', title: 'Section 3: State Management & Routing', courseId: '6aadbda18bcef3360dc2dd', order: 3 },
];

export const MOCK_LESSONS: ILesson[] = [
  { _id: 'l1', title: '1. Intro to React & Tooling Setup', duration: 720, isFree: true, type: 'video', sectionId: 's1', courseId: '6aadbda18bcef3360dc2dd', order: 1 },
  { _id: 'l2', title: '2. JSX, Virtual DOM & Components', duration: 900, isFree: false, type: 'video', sectionId: 's1', courseId: '6aadbda18bcef3360dc2dd', order: 2 },
  { _id: 'l3', title: '3. Props & Component Data Architecture', duration: 840, isFree: false, type: 'video', sectionId: 's1', courseId: '6aadbda18bcef3360dc2dd', order: 3 },
  { _id: 'l4', title: '4. API Gateways & HTTP Protocols', duration: 780, isFree: false, type: 'video', sectionId: 's2', courseId: '6aadbda18bcef3360dc2dd', order: 1 },
  { _id: 'l5', title: '5. Fetching Data with useEffect & TanStack', duration: 960, isFree: false, type: 'video', sectionId: 's2', courseId: '6aadbda18bcef3360dc2dd', order: 2 },
  { _id: 'l6', title: '6. Custom Hooks & Production APIs', duration: 660, isFree: false, type: 'video', sectionId: 's2', courseId: '6aadbda18bcef3360dc2dd', order: 3 },
  { _id: 'l7', title: '7. Zustand Store Setup & Selectors', duration: 1020, isFree: false, type: 'video', sectionId: 's3', courseId: '6aadbda18bcef3360dc2dd', order: 1 },
  { _id: 'l8', title: '8. React Router Nested Layouts', duration: 540, isFree: false, type: 'video', sectionId: 's3', courseId: '6aadbda18bcef3360dc2dd', order: 2 },
];

export const MOCK_REVIEWS: IReview[] = [
  {
    id: 'r1',
    name: 'David K.',
    role: 'Engineer at Stripe',
    avatarText: 'DK',
    rating: 5,
    date: '1 month ago',
    comment:
      'Concise, modern, and practical. The state management and hooks architecture explained here is easily applied to real-world projects in production.',
  },
  {
    id: 'r2',
    name: 'Elena R.',
    role: 'Staff Frontend Engineer',
    avatarText: 'ER',
    rating: 5,
    date: '2 weeks ago',
    comment:
      'Best React course in the market. Everything from layout to clean component patterns was covered. Finished it over the weekend!',
  },
];

export const MOCK_RELATED_COURSES: IRelatedCourse[] = [
  {
    id: 'rc1',
    title: 'Modern State Management: Zustand & React Query',
    instructor: 'David Miller',
    price: 39.99,
    tag: 'Advanced',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'rc2',
    title: 'Full-Stack Web Development with React & Next.js',
    instructor: 'Sara Mohamed',
    price: 54.99,
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'rc3',
    title: 'Testing & Enterprise Performance for React Apps',
    instructor: 'Alex Rivera',
    price: 44.99,
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop',
  },
];