export interface StudentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  courseTitle: string;
  progressPercent: number;
  status: 'Active' | 'Completed' | 'Inactive' | string;
  enrolledDate: string;
  completedLessons: number;
  totalLessons: number;
  examsPassed: number;
  totalExams: number;
  finalAssessmentStatus: 'In Progress' | 'Passed' | 'Pending' | 'Not Started' | string;
}
