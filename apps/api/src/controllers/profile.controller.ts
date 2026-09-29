import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { updateProfileSchema, changePasswordSchema } from '@lumajournal/shared';

export class ProfileController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const user = await AuthService.updateProfile(req.user!.id, validated);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const result = await AuthService.changePassword(
        req.user!.id,
        validated.currentPassword,
        validated.newPassword
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No image file uploaded' });
        return;
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const user = await AuthService.updateProfile(req.user!.id, { avatar: avatarUrl });
      res.json({ success: true, avatarUrl, user });
    } catch (error) {
      next(error);
    }
  }
}
