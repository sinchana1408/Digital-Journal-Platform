import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtUserPayload } from '../utils/auth';
import { DbService } from '../services/db.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        timezone: string;
        avatar?: string | null;
        bio?: string | null;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.lumajournal_token) {
      token = req.cookies.lumajournal_token;
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
      return;
    }

    const user = await DbService.findUserById(payload.id);
    if (!user) {
      res.status(401).json({ success: false, error: 'User account no longer exists.' });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      avatar: user.avatar,
      bio: user.bio,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed.' });
  }
}
