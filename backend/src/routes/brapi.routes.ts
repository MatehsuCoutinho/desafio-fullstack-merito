import { Router } from 'express';
import * as BrapiController from '../controllers/brapi.controller';

const router = Router();

router.get('/search/:ticker', BrapiController.search);

export default router;