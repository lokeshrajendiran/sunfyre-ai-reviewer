import { Router } from 'express';
import passport from '../config/passport';
import { authController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  authController.githubCallback
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, authController.logout);

export default router;
