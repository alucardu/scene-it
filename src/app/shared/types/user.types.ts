export type User = {
  createdAt: string;
  email: string;
  uid: string;
  username: string;
  role: 'user' | 'admin';
}
