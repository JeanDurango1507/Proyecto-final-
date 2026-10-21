import { Router } from 'express';
import { TransactionsController } from '../../controllers/transactions.controller';

const router = Router();
const transactionsController = new TransactionsController();

router.get('/transactions', transactionsController.list);
router.get('/transactions/:id', transactionsController.getById);
router.post('/transactions', transactionsController.create);
router.patch('/transactions/:id', transactionsController.update);

export default router;
