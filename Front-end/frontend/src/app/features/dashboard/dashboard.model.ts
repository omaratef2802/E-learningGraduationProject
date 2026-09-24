export interface StatItem {
  id: string;
  title: string;
  value: string;
  description: string;
  descriptionColor: 'indigo' | 'gray';
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface ContinueLearningItem {
  category: string;
  title: string;
  currentLesson: number;
  totalLessons: number;
  remainingMinutes: number;
  progressPercent: number;
}

export interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  lastActive?: string;
  tag: string;
  tagClass: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  progressGradient: string;
  imageUrl: string;
  status?: 'in-progress' | 'completed' | 'not-started';
  statusText?: string;
  statusClass?: string;
  level?: string;
  duration?: string;
  buttonText?: string;
}

export interface WeeklyRhythmDay {
  day: string;
  hoursText: string;
  hours: number;
  status: 'active' | 'highlight' | 'current' | 'empty';
}

export interface WeeklyGoal {
  loggedHours: number;
  goalHours: number;
  progressPercent: number;
  days: WeeklyRhythmDay[];
}
