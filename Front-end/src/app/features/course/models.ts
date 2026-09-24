export interface IInstructor {
  _id?: string;
  name: string;
  role: string;
  badge?: string;
  rating?: number;
  studentsCount?: string;
  avatar: string;
  bio: string;
}

export interface IRatingDistribution {
  stars: number;
  percent: number;
}

export interface IReview {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  rating: number;
  date: string;
  comment: string;
}

export interface IRelatedCourse {
  id: string;
  title: string;
  instructor: string;
  price: number;
  tag?: string;
  image: string;
}

export interface ICourseInclude {
  icon: 'video' | 'file' | 'infinity' | 'devices' | 'certificate';
  text: string;
}

export interface ISection {
  _id: string;
  title: string;
  courseId: string;
  order: number;
}

export interface ILesson {
  _id: string;
  title: string;
  duration: number;
  isFree: boolean;
  videoUrl?: string;
  textContent?: string;
  type: 'video' | 'text';
  sectionId: string | ISection;
  courseId: string;
  order: number;
}

export interface ICourseDetails {
  _id?: string;
  title: string;
  description: string;
  slug?: string;
  image?: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  urgency?: string;
  level: string;
  badge?: string;
  lastUpdated?: string;
  hours: number;
  lessonCount: number;
  students: string;
  rating: number;
  reviews: string;
  language: string;
  instructor: IInstructor;
  outcomes: string[];
  requirements: string[];
  ratingDistribution: IRatingDistribution[];
  includes: ICourseInclude[];
}