import bcrypt from "bcryptjs";
import { pool } from "../db/postgres.js";
import type { User, PublicUser } from "../models/auth.model.js";

interface UserRow {
  id: string;
  name: string;
  roll_no: string;
  email: string | null;
  password_hash: string;
  role: User["role"];
  created_at: string;
}

function fromRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    rollNo: row.roll_no,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function findUserByRollNo(rollNo: string): Promise<User | null> {
  const { rows } = await pool.query<UserRow>(
    "SELECT id, name, roll_no, email, password_hash, role, created_at FROM users WHERE roll_no = $1",
    [rollNo],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<UserRow>(
    "SELECT id, name, roll_no, email, password_hash, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function createUser(data: {
  name: string;
  rollNo: string;
  email?: string | null;
  password: string;
  role?: User["role"];
}): Promise<User> {
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(data.password);
  const role = data.role ?? "student";
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (id, name, roll_no, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, name, roll_no, email, password_hash, role, created_at`,
    [id, data.name, data.rollNo, data.email ?? null, passwordHash, role],
  );
  return fromRow(rows[0]!);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
