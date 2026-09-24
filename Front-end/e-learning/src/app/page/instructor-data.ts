import { Injectable } from '@angular/core';

// =========================================================
// INTERFACES
// =========================================================

export interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  studentInitials: string;
  courseTitle: string;
  certId: string;
  completionRate: number;
  issuedDate: string;
  status: 'Issued' | 'Pending' | 'Revoked';
}

export type CourseStatus =
  | 'Assigned'
  | 'Draft'
  | 'In Review'
  | 'Pending Review'
  | 'Changes Required'
  | 'Published';

export interface InstructorCourse {
  id: string;

  title: string;
  description?: string;

  category: string;
  track?: string;
  subcategory?: string;

  image: string;

  price: string;
  students: string;
  rating: string;
  updated: string;

  status: CourseStatus;

  level?: string;
  language?: string;
  duration?: string;

  objectives?: string;
  prerequisites?: string;

  instructorId?: string;
  instructorName?: string;
  instructorEmail?: string;

  reviewMessage?: string;
}

export interface InstructorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
}

export interface AdminProfile {
  firstName: string;
  lastName: string;
  role: string;
}

export interface InstructorNotification {
  id: string;
  title: string;
  message: string;
  type: 'General' | 'Course' | 'Student' | 'System';
  isRead: boolean;
  createdAt: string;

  instructorId?: string;
  relatedCourseId?: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  description: string;
  type: 'Video' | 'Text';
  content: string;
  duration: string;
  order: number;
  preview: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'Multiple Choice';
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface CurriculumQuiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  duration: string;
  questions: QuizQuestion[];
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
  quizzes: CurriculumQuiz[];
}

// =========================================================
// ADMIN INTERFACES
// =========================================================

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin';
  status: 'Active' | 'Pending' | 'Blocked';
  joinedAt: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  instructor: string;
  students: number;
  status: 'Published' | 'Draft';
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  type:
    | 'User'
    | 'Course'
    | 'Enrollment'
    | 'Certificate';
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  coursesCount: number;
  tracksCount: number;
  status: 'Active' | 'Inactive';
}

export interface AdminTrack {
  id: string;
  name: string;
  category: string;
  description: string;
  coursesCount: number;
  studentsCount: number;
  status: 'Active' | 'Inactive';
}

export interface AdminReport {
  id: string;
  month: string;
  users: number;
  enrollments: number;
  courses: number;
  certificates: number;
  revenue: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'User' | 'Course' | 'System' | 'Report';
  isRead: boolean;
  createdAt: string;

  relatedCourseId?: string;
}

// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root'
})
export class InstructorData {

  // =========================================================
  // CERTIFICATES
  // =========================================================

  certificates: Certificate[] =
    this.readCertificates();

  // =========================================================
  // INSTRUCTOR
  // =========================================================

  readonly instructor: InstructorProfile =
    this.readInstructor();

  // =========================================================
  // ADMIN
  // =========================================================

  readonly admin: AdminProfile =
    this.readAdmin();

  // =========================================================
  // COURSES
  // =========================================================

  readonly courses: InstructorCourse[] =
    this.readCourses();

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  notifications: InstructorNotification[] =
    this.readNotifications();

  readonly notificationTypes:
    InstructorNotification['type'][] = [
      'General',
      'Course',
      'Student',
      'System'
    ];

  // =========================================================
  // CURRICULUM
  // =========================================================

  sections: CurriculumSection[] =
    this.readSections();

  // =========================================================
  // ADMIN STATS
  // =========================================================

  readonly adminStats: AdminStats = {
    totalUsers: 1250,
    totalStudents: 1205,
    totalInstructors: 45,
    totalCourses: 120
  };

  // =========================================================
  // ADMIN USERS
  // =========================================================

  adminUsers: AdminUser[] =
    this.readAdminUsers();

  // =========================================================
  // ADMIN COURSES
  // =========================================================

  readonly adminRecentCourses: AdminCourse[] = [
    {
      id: 'admin-course-1',
      title: 'React Frontend Development',
      instructor: 'Ahmed Hassan',
      students: 185,
      status: 'Published',
      createdAt: 'Sep 20, 2026'
    },
    {
      id: 'admin-course-2',
      title: 'Node.js Backend Development',
      instructor: 'Mariam Adel',
      students: 142,
      status: 'Published',
      createdAt: 'Sep 18, 2026'
    },
    {
      id: 'admin-course-3',
      title: 'JavaScript Essentials',
      instructor: 'Omar Hassan',
      students: 230,
      status: 'Published',
      createdAt: 'Sep 15, 2026'
    },
    {
      id: 'admin-course-4',
      title: 'Advanced MongoDB',
      instructor: 'Ahmed Hassan',
      students: 0,
      status: 'Draft',
      createdAt: 'Sep 14, 2026'
    }
  ];

  // =========================================================
  // ADMIN ACTIVITIES
  // =========================================================

  readonly adminRecentActivities: AdminActivity[] = [
    {
      id: 'admin-activity-1',
      title: 'New student registered',
      description:
        'Naema Sayed created a student account.',
      type: 'User',
      createdAt: '10 minutes ago'
    },
    {
      id: 'admin-activity-2',
      title: 'New course published',
      description:
        'React Frontend Development was published.',
      type: 'Course',
      createdAt: '35 minutes ago'
    },
    {
      id: 'admin-activity-3',
      title: 'New enrollment',
      description:
        'A student enrolled in Node.js Backend Development.',
      type: 'Enrollment',
      createdAt: '1 hour ago'
    },
    {
      id: 'admin-activity-4',
      title: 'Certificate issued',
      description:
        'A certificate was issued after course completion.',
      type: 'Certificate',
      createdAt: '2 hours ago'
    }
  ];

  // =========================================================
  // ADMIN CATEGORIES
  // =========================================================

  readonly adminCategories: AdminCategory[] = [
    {
      id: 'category-1',
      name: 'Web & Programming',
      description:
        'Frontend, backend, mobile development, and programming skills.',
      coursesCount: 42,
      tracksCount: 12,
      status: 'Active'
    },
    {
      id: 'category-2',
      name: 'Languages',
      description:
        'English, Arabic, French, German, and other language learning paths.',
      coursesCount: 28,
      tracksCount: 8,
      status: 'Active'
    },
    {
      id: 'category-3',
      name: 'Design & Creativity',
      description:
        'UI/UX, product design, visual design, and creative skills.',
      coursesCount: 24,
      tracksCount: 7,
      status: 'Active'
    },
    {
      id: 'category-4',
      name: 'Business & Career',
      description:
        'Business, management, career development, and professional skills.',
      coursesCount: 31,
      tracksCount: 9,
      status: 'Active'
    }
  ];

  // =========================================================
  // ADMIN TRACKS
  // =========================================================

  readonly adminTracks: AdminTrack[] = [
    {
      id: 'track-1',
      name: 'Frontend Development',
      category: 'Web & Programming',
      description:
        'Learn modern frontend development using HTML, CSS, JavaScript, and popular frameworks.',
      coursesCount: 12,
      studentsCount: 420,
      status: 'Active'
    },
    {
      id: 'track-2',
      name: 'Backend Development',
      category: 'Web & Programming',
      description:
        'Build backend systems, APIs, databases, and scalable server-side applications.',
      coursesCount: 10,
      studentsCount: 315,
      status: 'Active'
    },
    {
      id: 'track-3',
      name: 'UI/UX Design',
      category: 'Design & Creativity',
      description:
        'Explore user research, wireframing, prototyping, and modern interface design.',
      coursesCount: 8,
      studentsCount: 260,
      status: 'Active'
    },
    {
      id: 'track-4',
      name: 'English Language',
      category: 'Languages',
      description:
        'Develop practical English skills across speaking, listening, reading, and writing.',
      coursesCount: 9,
      studentsCount: 380,
      status: 'Active'
    },
    {
      id: 'track-5',
      name: 'Career Development',
      category: 'Business & Career',
      description:
        'Build professional skills including CV writing, interviews, communication, and career planning.',
      coursesCount: 7,
      studentsCount: 210,
      status: 'Active'
    },
    {
      id: 'track-6',
      name: 'Mobile App Development',
      category: 'Web & Programming',
      description:
        'Learn the foundations of building modern mobile applications and cross-platform experiences.',
      coursesCount: 6,
      studentsCount: 185,
      status: 'Inactive'
    }
  ];

  // =========================================================
  // ADMIN REPORTS
  // =========================================================

  readonly adminReports: AdminReport[] = [
    {
      id: 'report-1',
      month: 'Apr',
      users: 180,
      enrollments: 95,
      courses: 14,
      certificates: 28,
      revenue: 4200
    },
    {
      id: 'report-2',
      month: 'May',
      users: 225,
      enrollments: 118,
      courses: 17,
      certificates: 34,
      revenue: 5100
    },
    {
      id: 'report-3',
      month: 'Jun',
      users: 260,
      enrollments: 142,
      courses: 19,
      certificates: 41,
      revenue: 6300
    },
    {
      id: 'report-4',
      month: 'Jul',
      users: 310,
      enrollments: 165,
      courses: 22,
      certificates: 48,
      revenue: 7100
    },
    {
      id: 'report-5',
      month: 'Aug',
      users: 355,
      enrollments: 192,
      courses: 25,
      certificates: 57,
      revenue: 8250
    },
    {
      id: 'report-6',
      month: 'Sep',
      users: 410,
      enrollments: 218,
      courses: 28,
      certificates: 69,
      revenue: 9400
    }
  ];

  // =========================================================
  // ADMIN NOTIFICATIONS
  // =========================================================

  adminNotifications: AdminNotification[] =
    this.readAdminNotifications();

  // =========================================================
  // CERTIFICATES METHODS
  // =========================================================

  addCertificate(
    cert: Omit<Certificate, 'id'>
  ): void {
    const newCert: Certificate = {
      ...cert,
      id: this.generateId()
    };

    this.certificates.unshift(newCert);
    this.persistCertificates();
  }

  updateCertificate(
    id: string,
    updates: Partial<Certificate>
  ): void {
    const certificate =
      this.certificates.find(item => item.id === id);

    if (!certificate) {
      return;
    }

    Object.assign(certificate, updates);
    this.persistCertificates();
  }

  removeCertificate(id: string): void {
    const index =
      this.certificates.findIndex(item => item.id === id);

    if (index === -1) {
      return;
    }

    this.certificates.splice(index, 1);
    this.persistCertificates();
  }

  getCertificate(id: string): Certificate | undefined {
    return this.certificates.find(
      item => item.id === id
    );
  }

  getCertificatesByCourse(
    courseTitle: string
  ): Certificate[] {
    return this.certificates.filter(
      certificate =>
        certificate.courseTitle === courseTitle
    );
  }

  getCertificatesByStatus(
    status: Certificate['status']
  ): Certificate[] {
    return this.certificates.filter(
      certificate =>
        certificate.status === status
    );
  }

  getCertificateCount(): number {
    return this.certificates.length;
  }

  getIssuedCertificateCount(): number {
    return this.certificates.filter(
      certificate =>
        certificate.status === 'Issued'
    ).length;
  }

  // =========================================================
  // INSTRUCTOR METHODS
  // =========================================================

  updateInstructor(
    updates: Partial<InstructorProfile>
  ): void {
    Object.assign(this.instructor, updates);
    this.persistInstructor();
  }

  // =========================================================
  // INSTRUCTOR LIST
  // =========================================================

  getAdminInstructors(): AdminUser[] {
    return this.adminUsers.filter(
      user =>
        user.role === 'Instructor' &&
        user.status !== 'Blocked'
    );
  }

  // =========================================================
  // COURSES METHODS
  // =========================================================

  addCourse(
    course: Omit<InstructorCourse, 'id'>
  ): InstructorCourse {
    const newCourse: InstructorCourse = {
      ...course,
      id: this.generateId()
    };

    this.courses.unshift(newCourse);
    this.persistCourses();

    return newCourse;
  }

  createCourseByAdmin(
    course: Omit<InstructorCourse, 'id'>
  ): InstructorCourse {
    const newCourse = this.addCourse(course);

    if (newCourse.instructorId) {
      this.addInstructorNotification(
        newCourse.instructorId,
        {
          title: 'New Course Assigned',
          message:
            `You have been assigned "${newCourse.title}" by the admin. You can now open the course and start adding its content.`,
          type: 'Course',
          isRead: false,
          relatedCourseId: newCourse.id
        }
      );
    }

    this.addAdminNotification({
      title: 'Course Assigned',
      message:
        `"${newCourse.title}" was assigned to ${newCourse.instructorName || 'an instructor'}.`,
      type: 'Course',
      isRead: false,
      relatedCourseId: newCourse.id
    });

    return newCourse;
  }

  updateCourse(
    id: string,
    updates: Partial<InstructorCourse>
  ): void {
    const course =
      this.courses.find(
        item => item.id === id
      );

    if (!course) {
      return;
    }

    Object.assign(course, updates);
    course.updated = 'Just now';

    this.persistCourses();
  }

  removeCourse(id: string): void {
    const index =
      this.courses.findIndex(
        course => course.id === id
      );

    if (index === -1) {
      return;
    }

    this.courses.splice(index, 1);
    this.persistCourses();
  }

  getCourseById(
    id: string
  ): InstructorCourse | undefined {
    return this.courses.find(
      course => course.id === id
    );
  }

  getCoursesForInstructor(
    instructorId: string
  ): InstructorCourse[] {
    return this.courses.filter(
      course =>
        !course.instructorId ||
        course.instructorId === instructorId
    );
  }

  // =========================================================
  // SECTIONS METHODS
  // =========================================================

  addSection(
    section: Omit<CurriculumSection, 'id'>
  ): void {
    this.sections.push({
      ...section,
      id: this.generateId()
    });

    this.persistSections();
  }

  updateSection(
    sectionId: string,
    section: Omit<CurriculumSection, 'id'>
  ): void {
    const index =
      this.sections.findIndex(
        item =>
          item.id === sectionId
      );

    if (index < 0) {
      return;
    }

    this.sections[index] = {
      ...section,
      id: sectionId
    };

    this.persistSections();
  }

  removeSection(sectionId: string): void {
    this.sections =
      this.sections.filter(
        item =>
          item.id !== sectionId
      );

    this.persistSections();
  }

  // =========================================================
  // LESSONS METHODS
  // =========================================================

  addLesson(
    sectionId: string,
    lesson: Omit<CurriculumLesson, 'id'>
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    section.lessons.push({
      ...lesson,
      id: this.generateId()
    });

    this.persistSections();
  }

  updateLesson(
    sectionId: string,
    lessonId: string,
    lesson: Omit<CurriculumLesson, 'id'>
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    const index =
      section.lessons.findIndex(
        item =>
          item.id === lessonId
      );

    if (index < 0) {
      return;
    }

    section.lessons[index] = {
      ...lesson,
      id: lessonId
    };

    this.persistSections();
  }

  removeLesson(
    sectionId: string,
    lessonId: string
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    section.lessons =
      section.lessons.filter(
        item =>
          item.id !== lessonId
      );

    this.persistSections();
  }

  // =========================================================
  // QUIZZES METHODS
  // =========================================================

  addQuiz(
    sectionId: string,
    quiz: Omit<CurriculumQuiz, 'id'>
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    section.quizzes.push({
      ...quiz,
      id: this.generateId()
    });

    this.persistSections();
  }

  updateQuiz(
    sectionId: string,
    quizId: string,
    quiz: Omit<CurriculumQuiz, 'id'>
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    const index =
      section.quizzes.findIndex(
        item =>
          item.id === quizId
      );

    if (index < 0) {
      return;
    }

    section.quizzes[index] = {
      ...quiz,
      id: quizId
    };

    this.persistSections();
  }

  removeQuiz(
    sectionId: string,
    quizId: string
  ): void {
    const section =
      this.sections.find(
        item =>
          item.id === sectionId
      );

    if (!section) {
      return;
    }

    section.quizzes =
      section.quizzes.filter(
        item =>
          item.id !== quizId
      );

    this.persistSections();
  }

  // =========================================================
  // INSTRUCTOR NOTIFICATIONS
  // =========================================================

  addNotification(
    notification:
      Omit<
        InstructorNotification,
        'id' | 'createdAt'
      >
  ): void {
    this.notifications.unshift({
      ...notification,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    });

    this.persistNotifications();
  }

  addInstructorNotification(
    instructorId: string,
    notification:
      Omit<
        InstructorNotification,
        'id' | 'createdAt' | 'instructorId'
      >
  ): void {
    this.notifications.unshift({
      ...notification,
      instructorId,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    });

    this.persistNotifications();
  }

  getInstructorNotifications(
    instructorId: string
  ): InstructorNotification[] {
    return this.notifications.filter(
      notification =>
        !notification.instructorId ||
        notification.instructorId === instructorId
    );
  }

  removeNotification(id: string): void {
    this.notifications =
      this.notifications.filter(
        item =>
          item.id !== id
      );

    this.persistNotifications();
  }

  markNotificationRead(id: string): void {
    const item =
      this.notifications.find(
        notification =>
          notification.id === id
      );

    if (!item) {
      return;
    }

    item.isRead = true;
    this.persistNotifications();
  }

  // =========================================================
  // ADMIN METHODS
  // =========================================================

  getAdminStats(): AdminStats {
    return {
      ...this.adminStats,
      totalCourses: this.courses.length
    };
  }

  // =========================================================
  // ADMIN USERS
  // =========================================================

  getAdminUsers(): AdminUser[] {
    return [...this.adminUsers];
  }

  getAdminRecentUsers(): AdminUser[] {
    return [...this.adminUsers].slice(0, 4);
  }

  getAdminUser(
    id: string
  ): AdminUser | undefined {
    return this.adminUsers.find(
      user =>
        user.id === id
    );
  }

  addAdminUser(
    user: Omit<AdminUser, 'id' | 'joinedAt'>
  ): AdminUser {
    const newUser: AdminUser = {
      ...user,
      id: this.generateId(),
      joinedAt: this.getCurrentDate()
    };

    this.adminUsers.unshift(newUser);
    this.persistAdminUsers();

    return newUser;
  }

  updateAdminUser(
    id: string,
    updates: Partial<Omit<AdminUser, 'id'>>
  ): void {
    const user =
      this.adminUsers.find(
        item =>
          item.id === id
      );

    if (!user) {
      return;
    }

    Object.assign(user, updates);
    this.persistAdminUsers();
  }

  updateAdminUserStatus(
    id: string,
    status: AdminUser['status']
  ): void {
    this.updateAdminUser(
      id,
      { status }
    );
  }

  removeAdminUser(id: string): void {
    const index =
      this.adminUsers.findIndex(
        item =>
          item.id === id
      );

    if (index === -1) {
      return;
    }

    this.adminUsers.splice(index, 1);
    this.persistAdminUsers();
  }

  // =========================================================
  // ADMIN RECENT DATA
  // =========================================================

  getAdminRecentCourses(): AdminCourse[] {
    return [...this.adminRecentCourses];
  }

  getAdminRecentActivities(): AdminActivity[] {
    return [...this.adminRecentActivities];
  }

  getAdminCategories(): AdminCategory[] {
    return [...this.adminCategories];
  }

  getAdminTracks(): AdminTrack[] {
    return [...this.adminTracks];
  }

  getAdminReports(): AdminReport[] {
    return [...this.adminReports];
  }

  // =========================================================
  // ADMIN NOTIFICATIONS
  // =========================================================

  getAdminNotifications(): AdminNotification[] {
    return [...this.adminNotifications];
  }

  addAdminNotification(
    notification:
      Omit<
        AdminNotification,
        'id' | 'createdAt'
      >
  ): void {
    this.adminNotifications.unshift({
      ...notification,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    });

    this.persistAdminNotifications();
  }

  markAdminNotificationRead(id: string): void {
    const notification =
      this.adminNotifications.find(
        item =>
          item.id === id
      );

    if (!notification) {
      return;
    }

    notification.isRead = true;
    this.persistAdminNotifications();
  }

  markAllAdminNotificationsRead(): void {
    this.adminNotifications.forEach(
      notification => {
        notification.isRead = true;
      }
    );

    this.persistAdminNotifications();
  }

  removeAdminNotification(id: string): void {
    this.adminNotifications =
      this.adminNotifications.filter(
        item =>
          item.id !== id
      );

    this.persistAdminNotifications();
  }

  // =========================================================
  // ADMIN PROFILE
  // =========================================================

  updateAdminProfile(
    updates: Partial<AdminProfile>
  ): void {
    Object.assign(
      this.admin,
      updates
    );

    localStorage.setItem(
      'adminProfile',
      JSON.stringify(this.admin)
    );
  }

  // =========================================================
  // LOCAL STORAGE - ADMIN USERS
  // =========================================================

  private readAdminUsers(): AdminUser[] {
    const defaultUsers: AdminUser[] = [
      {
        id: 'admin-user-1',
        name: 'Naema Sayed',
        email: 'naema@example.com',
        role: 'Student',
        status: 'Active',
        joinedAt: 'Sep 24, 2026'
      },
      {
        id: 'admin-user-2',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        role: 'Instructor',
        status: 'Active',
        joinedAt: 'Sep 23, 2026'
      },
      {
        id: 'admin-user-3',
        name: 'Mariam Adel',
        email: 'mariam@example.com',
        role: 'Student',
        status: 'Active',
        joinedAt: 'Sep 22, 2026'
      },
      {
        id: 'admin-user-4',
        name: 'Omar Hassan',
        email: 'omar@example.com',
        role: 'Student',
        status: 'Pending',
        joinedAt: 'Sep 21, 2026'
      },
      {
        id: 'admin-user-5',
        name: 'Sara Mohamed',
        email: 'sara@example.com',
        role: 'Instructor',
        status: 'Active',
        joinedAt: 'Sep 19, 2026'
      },
      {
        id: 'admin-user-6',
        name: 'Youssef Ali',
        email: 'youssef@example.com',
        role: 'Student',
        status: 'Active',
        joinedAt: 'Sep 18, 2026'
      },
      {
        id: 'admin-user-7',
        name: 'Laila Ahmed',
        email: 'laila@example.com',
        role: 'Instructor',
        status: 'Pending',
        joinedAt: 'Sep 17, 2026'
      },
      {
        id: 'admin-user-8',
        name: 'Karim Mostafa',
        email: 'karim@example.com',
        role: 'Student',
        status: 'Blocked',
        joinedAt: 'Sep 16, 2026'
      },
      {
        id: 'admin-user-9',
        name: 'Mona Hassan',
        email: 'mona@example.com',
        role: 'Admin',
        status: 'Active',
        joinedAt: 'Sep 15, 2026'
      },
      {
        id: 'admin-user-10',
        name: 'Omar Adel',
        email: 'omar.adel@example.com',
        role: 'Student',
        status: 'Active',
        joinedAt: 'Sep 14, 2026'
      }
    ];

    try {
      const saved =
        JSON.parse(
          localStorage.getItem('adminUsers') || 'null'
        );

      if (Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return defaultUsers;
  }

  private persistAdminUsers(): void {
    localStorage.setItem(
      'adminUsers',
      JSON.stringify(this.adminUsers)
    );
  }

  // =========================================================
  // LOCAL STORAGE - ADMIN PROFILE
  // =========================================================

  private readAdmin(): AdminProfile {
    const defaultProfile: AdminProfile = {
      firstName: 'Naema',
      lastName: 'Sayed',
      role: 'Administrator'
    };

    try {
      const saved =
        JSON.parse(
          localStorage.getItem('adminProfile') || 'null'
        );

      if (
        saved &&
        typeof saved === 'object'
      ) {
        return {
          ...defaultProfile,
          ...saved
        };
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return defaultProfile;
  }

  // =========================================================
  // LOCAL STORAGE - CERTIFICATES
  // =========================================================

  private readCertificates(): Certificate[] {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'instructorCertificates'
          ) || 'null'
        );

      if (Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return [
      {
        id: 'cert-1',
        studentName: 'Naema Sayed',
        studentEmail: 'naema.s@pathwayed.edu',
        studentInitials: 'NS',
        courseTitle: 'React Frontend Development',
        certId: 'CERT-2026-00482',
        completionRate: 100,
        issuedDate: 'Sep 20, 2026',
        status: 'Issued'
      },
      {
        id: 'cert-2',
        studentName: 'Omar Hassan',
        studentEmail: 'omar.h@pathwayed.edu',
        studentInitials: 'OH',
        courseTitle: 'Node.js Backend Development',
        certId: 'CERT-2026-00483',
        completionRate: 100,
        issuedDate: 'Sep 18, 2026',
        status: 'Issued'
      },
      {
        id: 'cert-3',
        studentName: 'Mariam Adel',
        studentEmail: 'mariam.a@pathwayed.edu',
        studentInitials: 'MA',
        courseTitle: 'JavaScript Essentials',
        certId: 'CERT-2026-00484',
        completionRate: 100,
        issuedDate: 'Sep 15, 2026',
        status: 'Issued'
      }
    ];
  }

  private persistCertificates(): void {
    localStorage.setItem(
      'instructorCertificates',
      JSON.stringify(this.certificates)
    );
  }

  // =========================================================
  // LOCAL STORAGE - INSTRUCTOR PROFILE
  // =========================================================

  private readInstructor(): InstructorProfile {
    const defaultProfile: InstructorProfile = {
      id: 'admin-user-1',
      firstName: 'Naema',
      lastName: 'Sayed',
      email: 'naema@example.com',
      role: 'Lead Instructor',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio:
        'Product-minded instructor helping ambitious professionals turn practical skills into measurable career progress.',
      skills: [
        'Product Design',
        'Frontend Systems',
        'Mentorship',
        'Career Strategy'
      ]
    };

    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'instructorProfile'
          ) || 'null'
        );

      if (
        saved &&
        typeof saved === 'object'
      ) {
        return {
          ...defaultProfile,
          ...saved,
          skills:
            Array.isArray(saved.skills)
              ? saved.skills
              : defaultProfile.skills
        };
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return defaultProfile;
  }

  private persistInstructor(): void {
    localStorage.setItem(
      'instructorProfile',
      JSON.stringify(this.instructor)
    );
  }

  // =========================================================
  // LOCAL STORAGE - COURSES
  // =========================================================

  private readCourses(): InstructorCourse[] {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'instructorCourses'
          ) || 'null'
        );

      if (Array.isArray(saved)) {
        return saved.map(
          (course: Partial<InstructorCourse>) => ({
            id: course.id || this.generateId(),
            title: course.title || 'Untitled Course',
            description: course.description || '',
            category: course.category || 'Uncategorized',
            track: course.track || '',
            subcategory: course.subcategory || '',
            image: course.image || '',
            price: course.price || '$0',
            students: course.students || '0',
            rating: course.rating || '—',
            updated: course.updated || 'Just now',
            status:
              course.status === 'In Review'
                ? 'In Review'
                : course.status === 'Changes Required'
                  ? 'Changes Required'
                  : course.status === 'Published'
                    ? 'Published'
                    : course.status === 'Assigned'
                      ? 'Assigned'
                      : 'Draft',
            level: course.level || '',
            language: course.language || 'English',
            duration: course.duration || '',
            objectives: course.objectives || '',
            prerequisites: course.prerequisites || '',
            instructorId: course.instructorId,
            instructorName: course.instructorName,
            instructorEmail: course.instructorEmail,
            reviewMessage: course.reviewMessage
          })
        );
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return [
      {
        id: 'course-1',
        title: 'Full-Stack Web Development',
        category: 'Full-Stack + Web Dev',
        image:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
        price: '$90',
        students: '520',
        rating: '4.9',
        updated: '3d ago',
        status: 'Published',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      },
      {
        id: 'course-2',
        title: 'React Frontend Development',
        category: 'Frontend + React',
        image:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
        price: '$60',
        students: '486',
        rating: '4.8',
        updated: '5d ago',
        status: 'Published',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      },
      {
        id: 'course-3',
        title: 'Design Systems in Figma',
        category: 'Product Design',
        image:
          'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
        price: '$75',
        students: '314',
        rating: '4.9',
        updated: '1w ago',
        status: 'Draft',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      },
      {
        id: 'course-4',
        title: 'Modern JavaScript Patterns',
        category: 'JavaScript + Frontend',
        image:
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85',
        price: '$55',
        students: '291',
        rating: '4.7',
        updated: '2w ago',
        status: 'Published',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      },
      {
        id: 'course-5',
        title: 'Node.js & Express Backend',
        category: 'Backend + Node.js',
        image:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=85',
        price: '$75',
        students: '260',
        rating: '4.7',
        updated: '1w ago',
        status: 'Published',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      },
      {
        id: 'course-6',
        title: 'Enterprise TypeScript Applications',
        category: 'Enterprise + TypeScript',
        image:
          'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=85',
        price: '$65',
        students: '0',
        rating: '—',
        updated: '2d ago',
        status: 'In Review',
        instructorId: 'admin-user-1',
        instructorName: 'Naema Sayed',
        instructorEmail: 'naema@example.com'
      }
    ];
  }

  private persistCourses(): void {
    localStorage.setItem(
      'instructorCourses',
      JSON.stringify(this.courses)
    );
  }

  // =========================================================
  // LOCAL STORAGE - INSTRUCTOR NOTIFICATIONS
  // =========================================================

  private readNotifications(): InstructorNotification[] {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'instructorNotifications'
          ) || '[]'
        );

      if (Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return [];
  }

  private persistNotifications(): void {
    localStorage.setItem(
      'instructorNotifications',
      JSON.stringify(this.notifications)
    );
  }

  // =========================================================
  // LOCAL STORAGE - ADMIN NOTIFICATIONS
  // =========================================================

  private readAdminNotifications(): AdminNotification[] {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'adminNotifications'
          ) || 'null'
        );

      if (Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return [
      {
        id: 'admin-notification-1',
        title: 'New user registered',
        message:
          'A new student account was created on the platform.',
        type: 'User',
        isRead: false,
        createdAt: '10 minutes ago'
      },
      {
        id: 'admin-notification-2',
        title: 'Course published',
        message:
          'React Frontend Development was successfully published.',
        type: 'Course',
        isRead: false,
        createdAt: '35 minutes ago'
      },
      {
        id: 'admin-notification-3',
        title: 'Monthly report ready',
        message:
          'The latest platform performance report is now available.',
        type: 'Report',
        isRead: true,
        createdAt: '2 hours ago'
      },
      {
        id: 'admin-notification-4',
        title: 'System update',
        message:
          'Platform maintenance settings were updated successfully.',
        type: 'System',
        isRead: true,
        createdAt: 'Yesterday'
      }
    ];
  }

  private persistAdminNotifications(): void {
    localStorage.setItem(
      'adminNotifications',
      JSON.stringify(this.adminNotifications)
    );
  }

  // =========================================================
  // LOCAL STORAGE - SECTIONS
  // =========================================================

  private readSections(): CurriculumSection[] {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            'instructorCurriculum'
          ) || 'null'
        );

      if (Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // Ignore invalid localStorage data
    }

    return [
      {
        id: 'section-html',
        title:
          'Introduction to Web Development',
        lessons: [
          {
            id: 'lesson-html-intro',
            title:
              'Introduction to HTML',
            description:
              'Learn the foundations of HTML documents.',
            type: 'Video',
            content: '',
            duration: '12 min',
            order: 1,
            preview: true
          },
          {
            id: 'lesson-html-elements',
            title:
              'HTML Elements',
            description:
              'Build pages with semantic HTML elements.',
            type: 'Video',
            content: '',
            duration: '15 min',
            order: 2,
            preview: false
          }
        ],
        quizzes: []
      },
      {
        id: 'section-interfaces',
        title:
          'Building Modern Interfaces',
        lessons: [
          {
            id: 'lesson-components',
            title:
              'Components and Design Patterns',
            description:
              'Create reusable interface systems.',
            type: 'Video',
            content: '',
            duration: '32 min',
            order: 1,
            preview: false
          }
        ],
        quizzes: []
      }
    ];
  }

  private persistSections(): void {
    localStorage.setItem(
      'instructorCurriculum',
      JSON.stringify(this.sections)
    );
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private generateId(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2)
    );
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }
    );
  }
}