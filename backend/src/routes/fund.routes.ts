import { Router } from 'express';
import * as FundController from '../controllers/fund.controller';

const router = Router();

router.get('/', FundController.index);
router.get('/:id', FundController.show);
router.post('/', FundController.store);
router.patch('/:id/sync', FundController.sync);
router.delete('/:id', FundController.destroy);

export default router;