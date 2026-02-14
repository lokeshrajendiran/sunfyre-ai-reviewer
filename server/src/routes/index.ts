import { Router } from 'express';
import authRoutes from './auth';
import repositoryRoutes from './repositories';
import pullRequestRoutes from './pullRequests';

const router = Router();

router.use('/auth', authRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/pull-requests', pullRequestRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sunfyre API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
