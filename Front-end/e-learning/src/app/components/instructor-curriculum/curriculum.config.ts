export interface CurriculumLesson {
  title: string;
  type: string;
  meta: string;
}

export interface CurriculumSection {
  title: string;
  meta: string;
  lessons: CurriculumLesson[];
}

export const CURRICULUM_CONFIG = {
  sections: [
    {
      title: 'Introduction to Web Development',
      meta: '3 lessons · 2h 30m total',
      lessons: [
        { title: 'What is Web Development?', type: 'Video Lesson', meta: '16 min' },
        { title: 'Frontend vs Backend Architecture', type: 'Reading Material', meta: '45 min' },
        { title: 'Web Development Basics', type: 'Quiz Assessment', meta: '5 questions · 86% passing' },
      ],
    },
    {
      title: 'Building Modern Interfaces',
      meta: '4 lessons · 3h 10m total',
      lessons: [
        { title: 'Components and Design Patterns', type: 'Video Lesson', meta: '32 min' },
        { title: 'Responsive Layouts', type: 'Interactive Exercise', meta: '50 min' },
      ],
    },
  ] satisfies CurriculumSection[],
};
