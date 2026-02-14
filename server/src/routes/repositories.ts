import { Router } from 'express';
import { repositoryController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sync repositories from GitHub
router.post('/sync', repositoryController.syncRepositories);

// Get user's repositories
router.get('/', repositoryController.getRepositories);

// Get single repository
router.get('/:id', repositoryController.getRepository);

// Toggle repository active status
router.patch('/:id/toggle', repositoryController.toggleRepository);

export default router;
