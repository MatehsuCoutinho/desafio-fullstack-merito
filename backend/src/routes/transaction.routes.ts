import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';

const router = Router();

router.get('/', TransactionController.index);
router.get('/portfolio', TransactionController.portfolio);
router.get('/quotas/:fundId', TransactionController.quotasByFund);
router.post('/', TransactionController.store);
router.delete('/:id', TransactionController.destroy);

export default router;