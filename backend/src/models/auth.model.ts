// User account shapes.

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  rollNo: string;
  email: string | null;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;
