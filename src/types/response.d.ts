import type { Role } from './generic.d.ts';

export interface ResponseApi<T> {
  result: T;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export type SignUpData = User;

export interface LoginData {
  access_token: string;
  user: User;
}
