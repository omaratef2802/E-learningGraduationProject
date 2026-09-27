export interface CourseCategoryOptions {
  subcategories: string[];
  tracks: string[];
  levels: string[];
  durations: string[];
}

export const CREATE_COURSE_CONFIG = {
  brand: 'PathwayEd',
  role: 'Instructor Portal',
  navItems: ['Dashboard', 'My Courses', 'Create Course', 'Students', 'Certificates', 'Notifications', 'Profile', 'Settings'],
  categories: ['Web Development', 'Product Design', 'Business', 'Languages'],
  options: {
    'Web Development': {
      subcategories: ['Frontend Engineering', 'Backend Engineering', 'DevOps & Cloud'],
      tracks: ['Full-Stack Development', 'Frontend Development', 'Backend Development'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      durations: ['12 hours (18 lessons)', '24 hours (36 lessons)', '40 hours (60 lessons)'],
    },
    'Product Design': {
      subcategories: ['UI/UX Design', 'Design Systems', 'User Research'],
      tracks: ['Product Design', 'UX Research', 'Visual Design'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      durations: ['8 hours (12 lessons)', '18 hours (26 lessons)', '30 hours (45 lessons)'],
    },
    Business: {
      subcategories: ['Leadership', 'Marketing', 'Operations'],
      tracks: ['Business Growth', 'Executive Leadership', 'Digital Marketing'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      durations: ['6 hours (10 lessons)', '14 hours (22 lessons)', '28 hours (40 lessons)'],
    },
    Languages: {
      subcategories: ['Business English', 'Conversation', 'Academic Writing'],
      tracks: ['Global Fluency', 'Professional Communication', 'Language Foundations'],
      levels: ['A1 Beginner', 'B1 Intermediate', 'C1 Advanced'],
      durations: ['10 hours (15 lessons)', '20 hours (30 lessons)', '36 hours (54 lessons)'],
    },
  } satisfies Record<string, CourseCategoryOptions>,
};
