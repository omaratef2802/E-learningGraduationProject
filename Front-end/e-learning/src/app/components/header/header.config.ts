export interface HeaderLink {
  label: string;
  route: string;
  fragment?: string;
}

export const HEADER_CONFIG = {
  brandName: 'PathwayEd',
  // Single catalog entry points. A specific category is reached from
  // /categories by id, so there is no separate per-slug nav link.
  links: [
    { label: 'Home', route: '/' },
    { label: 'Categories', route: '/categories' },
    { label: 'Courses', route: '/courses' },
    { label: 'About', route: '/about' },
  ] satisfies HeaderLink[],
  loginRoute: '/login',
  signupRoute: '/signup',
  profileRoute: '/instructor-dashboard',
};
