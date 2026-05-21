import express from 'express';
import SubscriptionController from './subscriptionController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware);

// POST /api/v1/subscription/top-up — Deposit funds into wallet
router.post('/top-up', SubscriptionController.topUp);

// POST /api/v1/subscription/subscribe — Purchase a premium plan
router.post('/subscribe', SubscriptionController.subscribe);

// GET /api/v1/subscription/status — Get wallet balance & subscription info
router.get('/status', SubscriptionController.getStatus);

export default router;
