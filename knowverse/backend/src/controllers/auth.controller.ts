import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: user });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { token, user } = await authService.login(req.body);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, message: 'Login successful', data: { user, token } });
  },

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.id);
    res.json({ success: true, data: user });
  },
};
