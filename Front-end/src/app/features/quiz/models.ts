export interface IQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation?: string;
}

export interface IQuiz {
  id: string;
  sectionId: string;
  lessonId?: string;
  courseTitle: string;
  sectionTitle: string;
  assessmentBadge: string;
  passingScore: number; // e.g. 60
  questions: IQuizQuestion[];
  isFinalCapstone: boolean;
}

export interface ICertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  trackName: string;
  issueDate: string;
  score: number;
  passingScore: number;
  grade: string;
  isVerified: boolean;
}
