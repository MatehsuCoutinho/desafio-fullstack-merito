import { Router } from 'express';
import * as FundController from '../controllers/fund.controller';
import { writeLimiter, brapiLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/', FundController.index);
router.get('/:id', FundController.show);
router.post('/', brapiLimiter, writeLimiter, FundController.store);
router.patch('/:id/sync', brapiLimiter, FundController.sync);
router.delete('/:id', writeLimiter, FundController.destroy);

export default router;