export interface DisciplineItem {
  icon: string;
  label: string;
  title: string;
  description: string;
  courses: string;
  query: string;
  /**
   * Mongo id of the category. The cards are built from the database, so this
   * is only present on live data — the config fallback below has no ids.
   */
  categoryId?: string;
}

export const DISCIPLINES_CONFIG = {
  eyebrow: 'SUBJECT DISCIPLINES',
  title: 'Explore What You Want to Learn',
  description: 'Discover courses and learning paths across a growing range of skills and professional fields.',
  browseLabel: 'Browse all disciplines',
  // Placeholder copy used only when the categories request has not resolved;
  // the live grid comes from GET /category.
  items: [
    { icon: '◲', label: 'Tech & Engineering', title: 'Web Development', description: 'Build practical skills for modern digital products, from foundational frontend frameworks to scalable backends.', courses: 'Courses', query: 'Web Development' },
    { icon: '文', label: 'Global Fluency', title: 'Languages', description: 'Improve spoken communication, professional workplace English, and linguistic proficiency for international career roles.', courses: 'Courses', query: 'Languages' },
    { icon: '◇', label: 'Product Design', title: 'UI/UX Design', description: 'Learn how to design intuitive, accessible digital interfaces, craft user research roadmaps, and master Figma design systems.', courses: 'Courses', query: 'UI/UX Design' },
    { icon: '◆', label: 'Leadership & Growth', title: 'Business', description: 'Develop skills in executive strategy, performance marketing, product management, and operational leadership.', courses: 'Courses', query: 'Business' },
  ] satisfies DisciplineItem[],
};
