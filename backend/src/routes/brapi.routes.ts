import { Router } from 'express';
import * as BrapiController from '../controllers/brapi.controller';
import { brapiLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/search/:ticker', brapiLimiter, BrapiController.search);

export default router;