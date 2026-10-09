// =========================
// DATABASE-BACKED MODELS
// =========================
// These mirror the MongoDB schemas in Back-end/src/modules.
// They are the single source of truth for the frontend, replacing
// the deleted mock store (instructor-data.ts).

export type CourseStatus =
  | 'draft'
  | 'in_review'
  | 'changes_required'
  | 'published'
  | 'archived';

export type LessonType = 'video' | 'text';
export type UserRole = 'student' | 'instructor' | 'admin';

// ---------- Category (dbCategory.js) ----------
export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description: string;
  subcategories: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Track (dbTrack.js) ----------
export interface TrackRequiredSkill {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Track {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  description: string;
  icon?: string;
  categoryId: string | { _id: string; name: string; slug: string };
  requiredSkills: TrackRequiredSkill[];
  relatedCourses: { courseId: string }[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Populated user reference ----------
export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

// ---------- Course (dbCourse.js) ----------
export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  instructorId: string | PopulatedUser;
  category: string | { _id: string; name: string; slug: string };
  track: string | { _id: string; title: string; slug: string };
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  duration: number;
  status: CourseStatus;
  objectives: string[];
  prerequisites: string[];
  /** Set by the admin when a course is sent back for changes. */
  reviewMessage?: string | null;
  submittedForReviewAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface CurriculumLesson {
  id: string;
  _id: string;
  title: string;
  duration: number;
  type: LessonType;
  videoUrl?: string | null;
  textContent?: string | null;
  courseId: string;
  sectionId: string;
  order: number;
  quizId?: string | null;
  isPreview?: boolean;
}

export interface CurriculumSection {
  id: string;
  _id: string;
  title: string;
  description?: string | null;
  courseId: string;
  order: number;
  lessons: CurriculumLesson[];
  quizzes: CurriculumQuiz[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Omitted by the backend for students (see safeQuiz in Quiz controller). */
  correctAnswer?: string;
  points?: number;
}

export interface CurriculumQuiz {
  id: string;
  _id: string;
  title: string;
  instructorId: string;
  courseId: string;
  questions: QuizQuestion[];
  passingScore: number;
  /**
   * Derived on the frontend: quizzes linked to a lesson through Lesson.quizId
   * are `Lesson` quizzes, quizzes carrying `sectionId` are section final quizzes.
   */
  type: 'Lesson' | 'Section';
  lessonId?: string;
  /** Set by the backend for section final quizzes (Quiz.sectionId). */
  sectionId?: string | null;
}

export interface Certificate {
  id: string;
  _id: string;
  student: string;
  course: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  certificateId: string;
  issueDate: string;
  verificationUrl: string;
  qrCode: string;
}

export interface InstructorProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
  img?: string | null;
  level?: string;
  phone?: string | null;
  verifiedSkills: unknown[];
  role: UserRole;
  currentStreak?: number;
  longestStreak?: number;
}

export interface PublicInstructor {
  _id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  img?: string | null;
}

/**
 * Course shape used by the instructor dashboard. The backend returns raw Course
 * documents, so dashboard-facing fields are derived by the service.
 */
export interface InstructorCourse extends Course {
  id: string;
  instructorName?: string;
  updated?: string;
  reviewMessage?: string;
}

