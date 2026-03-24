import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import fundRoutes from './routes/fund.routes';
import transactionRoutes from './routes/transaction.routes';
import brapiRoutes from './routes/brapi.routes';
import { globalLimiter } from './middlewares/rateLimiter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/funds', fundRoutes);
app.use('/transactions', transactionRoutes);
app.use('/brapi', brapiRoutes);

export default app;