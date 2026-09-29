import { DbService } from './db.service';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AppError } from '../middleware/error.middleware';
import crypto from 'crypto';

export class AuthService {
  static async register(input: { name: string; email: string; password: string }) {
    const existing = await DbService.findUserByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await DbService.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login(input: { email: string; password: string; rememberMe?: boolean }) {
    const user = await DbService.findUserByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken(
      { id: user.id, email: user.email, name: user.name },
      input.rememberMe
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await DbService.findUserById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }

  static async forgotPassword(email: string) {
    const user = await DbService.findUserByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return {
        message: 'If an account exists with this email, password reset instructions have been generated.',
        resetToken: null,
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await DbService.createResetToken(user.id, token, expiresAt);

    return {
      message: 'Password reset instructions have been generated.',
      resetToken: token, // Returned for easy testing and local verification
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetTokenRecord = await DbService.findValidResetToken(token);
    if (!resetTokenRecord) {
      throw new AppError('Password reset link is invalid or has expired.', 400);
    }

    const newHash = await hashPassword(newPassword);
    await DbService.updateUser(resetTokenRecord.userId, { passwordHash: newHash });
    await DbService.markResetTokenUsed(token);

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  static async changePassword(userId: string, current: string, next: string) {
    const user = await DbService.findUserById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const matches = await comparePassword(current, user.passwordHash);
    if (!matches) throw new AppError('Current password is incorrect.', 400);

    const newHash = await hashPassword(next);
    await DbService.updateUser(userId, { passwordHash: newHash });

    return { message: 'Password updated successfully.' };
  }

  static async updateProfile(userId: string, data: { name?: string; bio?: string | null; timezone?: string; avatar?: string | null }) {
    const updated = await DbService.updateUser(userId, data);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      bio: updated.bio,
      timezone: updated.timezone,
      updatedAt: updated.updatedAt,
    };
  }
}
