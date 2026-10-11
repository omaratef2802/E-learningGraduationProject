export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export const FEATURES_CONFIG = {
  title: 'Everything You Need to Keep Learning',
  description: 'One platform to learn new skills, track your progress, complete courses, and build your professional profile.',
  items: [
    { icon: '▣', title: 'Structured Learning', description: 'Comprehensive curriculum crafted by senior practitioners, organized into bite-sized and actionable modules.' },
    { icon: '⌁', title: 'Progress Tracking', description: 'Interactive telemetry dashboard that measures your milestones, quiz performance, and skill velocity automatically.' },
    { icon: '✿', title: 'Verified Certificates', description: 'Receive tamper-proof accredited credentials shareable on LinkedIn and promote your profile upon project completion.' },
  ] satisfies FeatureItem[],
};
