export interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  badge?: string | number;
}
