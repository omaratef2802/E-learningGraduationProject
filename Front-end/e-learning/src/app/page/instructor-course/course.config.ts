export interface DashboardCourse {
  title: string;
  category: string;
  image: string;
  price: string;
  students: string;
  rating: string;
  updated: string;
  status: string;
}

export const DASHBOARD_CONFIG = {
  brand: 'PathwayEd',

  role: 'Instructor Portal',

  navItems: [
    'Dashboard',
    'My Courses',
    'Create Course',
    'Students',
    'Certificates',
    'Notifications',
    'Profile',
    'Settings'
  ],

  courses: [

    {
      title: 'Full-Stack Web Development',
      category: 'Full-Stack + Web Dev',
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
      price: '$90',
      students: '520',
      rating: '4.9',
      updated: '3d ago',
      status: 'Published'
    },

    {
      title: 'React Frontend Development',
      category: 'Frontend + React',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
      price: '$60',
      students: '486',
      rating: '4.8',
      updated: '5d ago',
      status: 'Published'
    },

    {
      title: 'Design Systems in Figma',
      category: 'Product Design',
      image:
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
      price: '$75',
      students: '314',
      rating: '4.9',
      updated: '1w ago',
      status: 'Draft'
    },

    {
      title: 'Modern JavaScript Patterns',
      category: 'JavaScript + Frontend',
      image:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85',
      price: '$55',
      students: '291',
      rating: '4.7',
      updated: '2w ago',
      status: 'Published'
    },

    {
      title: 'Node.js & Express Backend',
      category: 'Backend + Node.js',
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=85',
      price: '$75',
      students: '260',
      rating: '4.7',
      updated: '1w ago',
      status: 'Published'
    },

    {
      title: 'Enterprise TypeScript Applications',
      category: 'Enterprise + TypeScript',
      image:
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=85',
      price: '$65',
      students: '0',
      rating: '—',
      updated: '2d ago',
      status: 'In Review'
    }

  ] satisfies DashboardCourse[]
};