import { Response, NextFunction, RequestHandler } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { AuthRequest } from '../middleware';

// GitHub OAuth callback handler
const githubCallback: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    console.log('GitHub OAuth callback hit');
    if (!req.user) {
      return res.redirect(`${config.client.url}/login?error=auth_failed`);
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    // Redirect to frontend login with token so client stores it
    res.redirect(`${config.client.url}/login?token=${token}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${config.client.url}/login?error=server_error`);
  }
};

// Get current user
const getCurrentUser: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    res.json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        profile: req.user.profile,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user data' },
    });
  }
};

// Logout
const logout: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    // In a JWT setup, logout is handled client-side by removing the token
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Logout failed' },
    });
  }
};

export const authController = {
  githubCallback,
  getCurrentUser,
  logout,
};
