export interface AppUser {
  uid: string;
  username: string;
}

export interface UserContextType {
  user: AppUser | null;
  loading: boolean;
  loginAsGuest: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}
