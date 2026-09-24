export interface HeaderLink {
  label: string;
  route: string;
  fragment?: string;
}

export const HEADER_CONFIG = {
  brandName: 'PathwayEd',
  links: [
    { label: 'Home', route: '/' },
    { label: 'Categories', route: '/', fragment: 'disciplines' },
    { label: 'Courses', route: '/courses' },
    { label: 'About', route: '/about' },
  ] satisfies HeaderLink[],
  loginRoute: '/login',
  signupRoute: '/signup',
  profileRoute: '/instructor-dashboard',
};
