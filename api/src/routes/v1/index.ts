import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './users.route';
import transactionRoutes from './transactions.route';

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);
router.use(transactionRoutes);

export default router;
