export interface DisciplineItem {
  icon: string;
  label: string;
  title: string;
  description: string;
  courses: string;
  query: string;
}

export const DISCIPLINES_CONFIG = {
  eyebrow: 'SUBJECT DISCIPLINES',
  title: 'Explore What You Want to Learn',
  description: 'Discover courses and learning paths across a growing range of skills and professional fields.',
  browseLabel: 'Browse all 12 disciplines',
  items: [
    { icon: '⌘', label: 'Tech & Engineering', title: 'Web Development', description: 'Build practical skills for modern digital products, from foundational frontend frameworks to scalable cloud systems.', courses: '140+ Courses', query: 'Web Development' },
    { icon: '文', label: 'Global Fluency', title: 'Languages', description: 'Improve spoken communication, professional workplace English, and linguistic proficiency for international career roles.', courses: '95+ Courses', query: 'Languages' },
    { icon: '◒', label: 'Product Design', title: 'UI/UX Design', description: 'Learn how to design intuitive, accessible digital interfaces, craft user research roadmaps, and master Figma design systems.', courses: '85+ Courses', query: 'UI/UX Design' },
    { icon: '↗', label: 'Leadership & Growth', title: 'Business', description: 'Develop skills in executive strategy, performance marketing, product management, and operational leadership.', courses: '120+ Courses', query: 'Business' },
  ] satisfies DisciplineItem[],
};
