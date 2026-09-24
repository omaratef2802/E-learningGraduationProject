export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'busy';
}
