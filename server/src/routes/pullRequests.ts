import { Router } from 'express';
import { pullRequestController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sync pull requests for a repository
router.post('/repository/:repositoryId/sync', pullRequestController.syncPullRequests);

// Get pull requests for a repository
router.get('/repository/:repositoryId', pullRequestController.getPullRequests);

// Get single pull request
router.get('/:id', pullRequestController.getPullRequest);

// Analyze pull request with AI
router.post('/:id/analyze', pullRequestController.analyzePullRequest);

// Get AI reviews for a pull request
router.get('/:id/reviews', pullRequestController.getAIReviews);

export default router;
