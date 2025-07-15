export const ADMIN = 'admin';
export const USER = 'user';

export type Role = ADMIN | USER;

type User = {
  roles: Role[];
};
