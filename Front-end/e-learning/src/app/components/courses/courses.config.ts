export interface CourseItem {
  image: string;
  tag: string;
  rating: string;
  reviews: string;
  title: string;
  instructor: string;
  level: string;
  duration: string;
  price: string;
  query: string;
}

export const COURSES_CONFIG = {
  title: 'Featured Courses',
  description: 'Start learning with courses designed around practical skills.',
  viewAllLabel: 'View All Courses',
  items: [
    { image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85', tag: 'Web Dev', rating: '4.9', reviews: '2,450', title: 'Full-Stack Web Development', instructor: 'Sara Mohamed', level: 'Intermediate', duration: '48h', price: '$49.99', query: 'Full-Stack Web Development' },
    { image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=85', tag: 'Frontend', rating: '4.9', reviews: '1,890', title: 'React Frontend Development', instructor: 'Ahmed Hassan', level: 'Beginner to Pro', duration: '36h', price: '$39.99', query: 'React Frontend Development' },
    { image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85', tag: 'UI / UX', rating: '4.8', reviews: '1,120', title: 'UI/UX Design Fundamentals', instructor: 'Elena Vance', level: 'Beginner', duration: '28h', price: '$34.99', query: 'UI/UX Design Fundamentals' },
    { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85', tag: 'Analytics', rating: '4.9', reviews: '3,100', title: 'Python for Data Analysis', instructor: 'David Miller', level: 'All Levels', duration: '42h', price: '$44.99', query: 'Python for Data Analysis' },
  ] satisfies CourseItem[],
};
