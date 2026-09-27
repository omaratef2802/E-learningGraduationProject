import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  icon: string;
}

interface ValueCard {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

interface FeaturePoint {
  icon: string;
  title: string;
  description: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutPage {
  readonly stats: StatItem[] = [
    { value: '50K+', label: 'Active Students', sublabel: 'Learning worldwide', icon: '🎓' },
    { value: '1,200+', label: 'Expert Mentors', sublabel: 'Industry professionals', icon: '👨‍🏫' },
    { value: '350+', label: 'Learning Tracks', sublabel: 'Web, Mobile, UI/UX & AI', icon: '📚' },
    { value: '98%', label: 'Career Success', sublabel: 'Reported career growth', icon: '⭐' },
  ];

  readonly values: ValueCard[] = [
    {
      icon: '🚀',
      title: 'Our Mission',
      description: 'To break down barriers to education by providing accessible, project-focused, and industry-grade learning pathways for everyone.',
      tag: 'PURPOSE'
    },
    {
      icon: '��',
      title: 'Our Vision',
      description: 'Building a global ecosystem where passion meets opportunity, empowering learners to become market-ready software professionals.',
      tag: 'FUTURE'
    },
    {
      icon: '💎',
      title: 'Core Values',
      description: 'Uncompromising quality, continuous innovation, inclusive growth, and dedicated mentorship for every student.',
      tag: 'PRINCIPLES'
    }
  ];

  readonly features: FeaturePoint[] = [
    {
      icon: '⚡',
      title: 'Hands-on Projects',
      description: 'Master concepts by building real-world software, web apps, and design portfolios that impress hiring managers.'
    },
    {
      icon: '🌟',
      title: 'Top-tier Instructors',
      description: 'Gain insights from practicing engineers, designers, and tech leaders who bring real industry experience.'
    },
    {
      icon: '📜',
      title: 'Verified Certification',
      description: 'Earn shareable digital certificates verified by PathwayEd to showcase on LinkedIn and your resume.'
    },
    {
      icon: '🤝',
      title: 'Active Community',
      description: 'Join a vibrant community of peers to collaborate on projects, review code, and get career advice.'
    }
  ];

  readonly timeline: TimelineEvent[] = [
    {
      year: '2023',
      title: 'PathwayEd Launched',
      description: 'Started with 10 core web development tracks aimed at practical project creation.'
    },
    {
      year: '2024',
      title: '10K Milestone',
      description: 'Crossed 10,000 active students and launched our instructor portal for global educators.'
    },
    {
      year: '2025',
      title: 'Track Expansion',
      description: 'Introduced full-stack, UI/UX design, mobile development, and data science certificates.'
    },
    {
      year: '2026',
      title: 'Next-Gen Platform',
      description: 'Evolved into a comprehensive learning hub with interactive progress tracking and career mentorship.'
    }
  ];
}
