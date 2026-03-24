import { Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';

export async function index(req: Request, res: Response) {
    try {
        const transactions = await TransactionService.getAllTransactions();
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function portfolio(req: Request, res: Response) {
    try {
        const data = await TransactionService.getPortfolio();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function quotasByFund(req: Request, res: Response) {
    try {
        const quotas = await TransactionService.getQuotasByFund(req.params.fundId as string);
        res.json({ fundId: req.params.fundId, totalQuotas: quotas });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function store(req: Request, res: Response) {
    try {
        const { date, type, value, fundId } = req.body;

        if (!date || !type || value === undefined || value === null || !fundId) {
            res.status(400).json({ error: 'Campos obrigatórios: date, type, value, fundId.' });
            return;
        }

        if (!['APORTE', 'RESGATE'].includes(type)) {
            res.status(400).json({ error: 'Tipo deve ser APORTE ou RESGATE.' });
            return;
        }

        const transaction = await TransactionService.createTransaction({ date, type, value, fundId });
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function destroy(req: Request, res: Response) {
    try {
        const result = await TransactionService.deleteTransaction(req.params.id as string);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}