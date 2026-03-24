import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';
import { writeLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/', TransactionController.index);
router.get('/portfolio', TransactionController.portfolio);
router.get('/quotas/:fundId', TransactionController.quotasByFund);
router.post('/', writeLimiter, TransactionController.store);
router.delete('/:id', writeLimiter, TransactionController.destroy);

export default router;