export interface InstructorItem {
  name: string;
  role: string;
  bio: string;
  image: string;
  rating: string;
  learners: string;
  tone: string;
}

export const INSTRUCTORS_CONFIG = {
  eyebrow: 'MASTER PRACTITIONERS',
  title: 'Learn From Experienced Instructors',
  description: 'Instruction from active design directors, software architects, corporate linguists, and founders who do the work daily.',
  items: [
    { name: 'Sophia Lin', role: 'Principal Product Designer', bio: 'Former Staff Designer at Stripe and Figma designing community.', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=85', rating: '4.95', learners: '12,400+', tone: 'violet' },
    { name: 'David Sterling', role: 'Former VP of Operations', bio: 'Scaled 3 high-growth venture companies to sustainable 9-figure profitability.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85', rating: '4.90', learners: '9,800+', tone: 'cyan' },
    { name: 'Dr. Elena Rostova', role: 'Applied Linguistics Professor', bio: 'Polyglot advisor to international delegations and executive speaking coach.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=85', rating: '4.92', learners: '14,200+', tone: 'coral' },
    { name: 'Marcus Vance', role: 'Lead Software Architect', bio: 'Open-source contributor and technical book author on distributed frontend systems.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85', rating: '4.88', learners: '18,500+', tone: 'gold' },
  ] satisfies InstructorItem[],
};
