import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models';

// Extend Express Request to include our custom user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' },
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      req.user = user;
      req.userId = user._id.toString();
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' },
      });
    }
  } catch (error) {
    next(error);
  }
};
