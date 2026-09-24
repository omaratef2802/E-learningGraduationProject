import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideArrowRight } from '@ng-icons/lucide';
import {
  StatCardComponent,
  ContinueLearningComponent,
  CourseCardComponent,
  WeeklyLearningComponent
} from './components';
import {
  StatItem,
  ContinueLearningItem,
  CourseItem,
  WeeklyGoal
} from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    StatCardComponent,
    ContinueLearningComponent,
    CourseCardComponent,
    WeeklyLearningComponent
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideArrowRight
    })
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  // Current user info
  readonly userName = signal('Naema');
  readonly userAvatar = signal(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  );

  // 1. Statistics Cards Data
  readonly stats: StatItem[] = [
    {
      id: 'in-progress',
      title: 'In Progress',
      value: '3',
      description: 'Active enrolled courses',
      descriptionColor: 'indigo',
      icon: 'lucidePlay',
      iconBgColor: 'bg-indigo-50/80 border-indigo-100/70',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: '3',
      description: 'Courses finalized',
      descriptionColor: 'gray',
      icon: 'lucideCheckCircle2',
      iconBgColor: 'bg-purple-50/80 border-purple-100/70',
      iconColor: 'text-purple-600'
    },
    {
      id: 'learning-hours',
      title: 'Learning Hours',
      value: '42h',
      description: '5.4h logged this week',
      descriptionColor: 'indigo',
      icon: 'lucideClock',
      iconBgColor: 'bg-blue-50/80 border-blue-100/70',
      iconColor: 'text-blue-600'
    }
  ];

  // 2. Continue Learning Hero Data
  readonly continueLearning: ContinueLearningItem = {
    category: 'COMPLETE REACT DEVELOPMENT',
    title: 'Section 2 • Lesson 5: Working with API Data & TanStack Query',
    currentLesson: 30,
    totalLessons: 42,
    remainingMinutes: 18,
    progressPercent: 72
  };

  // 3. Enrolled Courses Data
  readonly courses: CourseItem[] = [
    {
      id: 'course-1',
      title: 'Complete React Development',
      instructor: 'Sara Mohamed',
      lastActive: 'Last active today',
      tag: 'FRONTEND TRACK',
      tagClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60',
      completedLessons: 30,
      totalLessons: 42,
      progressPercent: 72,
      progressGradient: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'course-2',
      title: 'Modern State Management',
      instructor: 'Ahmed Hassan',
      lastActive: 'Last active yesterday',
      tag: 'STATE MANAGEMENT',
      tagClass: 'bg-purple-50/90 text-purple-700 border-purple-200/60',
      completedLessons: 11,
      totalLessons: 24,
      progressPercent: 45,
      progressGradient: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'course-3',
      title: 'Full-Stack Web Development',
      instructor: 'Sara Mohamed',
      lastActive: 'Last active 3 days ago',
      tag: 'FULL STACK',
      tagClass: 'bg-blue-50/90 text-blue-700 border-blue-200/60',
      completedLessons: 11,
      totalLessons: 38,
      progressPercent: 28,
      progressGradient: 'bg-gradient-to-r from-blue-500 to-indigo-400',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
    }
  ];

  // 4. Weekly Learning Rhythm Data
  readonly weeklyGoal: WeeklyGoal = {
    loggedHours: 5.4,
    goalHours: 8.0,
    progressPercent: 68,
    days: [
      { day: 'Mon', hoursText: '1.5h', hours: 1.5, status: 'active' },
      { day: 'Tue', hoursText: '2.0h', hours: 2.0, status: 'highlight' },
      { day: 'Wed', hoursText: '1.2h', hours: 1.2, status: 'active' },
      { day: 'Thu', hoursText: '0.7h', hours: 0.7, status: 'current' },
      { day: 'Fri', hoursText: '-', hours: 0, status: 'empty' },
      { day: 'Sat', hoursText: '-', hours: 0, status: 'empty' },
      { day: 'Sun', hoursText: '-', hours: 0, status: 'empty' }
    ]
  };
}
