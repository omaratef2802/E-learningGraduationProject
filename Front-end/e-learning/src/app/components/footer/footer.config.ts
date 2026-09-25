export interface FooterLink { label: string; route: string; }
export const FOOTER_CONFIG = {
  brand: 'PathwayEd',
  description: 'Learn skills. Build your career. Accessible and flexible digital education designed for ambitious professionals.',
  platform: [{ label: 'About', route: '/about' }, { label: 'Categories', route: '/categories' }, { label: 'Courses', route: '/courses' }] satisfies FooterLink[],
  learning: [{ label: 'My Learning', route: '/learning' }, { label: 'Certificates', route: '/certificates' }, { label: 'Wishlist', route: '/wishlist' }] satisfies FooterLink[],
  support: [{ label: 'Help Center', route: '/help' }, { label: 'Contact', route: '/contact' }] satisfies FooterLink[],
};
