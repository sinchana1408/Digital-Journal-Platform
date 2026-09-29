import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtUserPayload {
  id: string;
  email: string;
  name: string;
}

export function generateToken(payload: JwtUserPayload, rememberMe: boolean = false): string {
  const expiresIn = rememberMe ? '30d' : config.jwtExpiresIn;
  return jwt.sign(payload, config.jwtSecret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtUserPayload;
  } catch (error) {
    return null;
  }
}
