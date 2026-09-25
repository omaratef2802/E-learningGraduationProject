export interface LearningStep {
  number: string;
  icon: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS_CONFIG = {
  eyebrow: 'YOUR LEARNING JOURNEY',
  title: 'How PathwayEd Works',
  description: 'A structured, streamlined journey to acquire market-ready capabilities.',
  steps: [
    { number: '01', icon: '⌕', title: 'Choose a Course', description: 'Explore comprehensive categories and select curriculum tailored precisely to your ambitions.' },
    { number: '02', icon: '▱', title: 'Learn & Practice', description: 'Complete self-paced lessons, interactive assignments, coding challenges, and capstones.' },
    { number: '03', icon: '♙', title: 'Complete & Get Certified', description: 'Finish assessments and instantly claim a verified digital certificate to showcase in your portfolio.' },
  ] satisfies LearningStep[],
};
