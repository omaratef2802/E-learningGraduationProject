export interface CertificateItem {
  id: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string;
  certificateId: string;
  courseTitle: string;
  completionDate: string;
  formattedDate: string;
  finalScore: number;
  grade: string;
  status: 'Verified' | 'Pending' | 'Revoked' | string;
  learnerId: string;
  endorsementText: string;
}
