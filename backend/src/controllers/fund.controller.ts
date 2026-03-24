import { Request, Response } from 'express';
import * as FundService from '../services/fund.service';

export async function index(req: Request, res: Response) {
    try {
        const funds = await FundService.getAllFunds();
        res.json(funds);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function show(req: Request, res: Response) {
    try {
        const fund = await FundService.getFundById(req.params.id as string);
        if (!fund) {
            res.status(404).json({ error: 'Fundo não encontrado.' });
            return;
        }
        res.json(fund);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function store(req: Request, res: Response) {
    try {
        const { ticker } = req.body;

        if (!ticker) {
            res.status(400).json({ error: 'O campo ticker é obrigatório.' });
            return;
        }

        const fund = await FundService.createFund(ticker);
        res.status(201).json(fund);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function sync(req: Request, res: Response) {
    try {
        const fund = await FundService.syncFundQuota(req.params.id as string);
        res.json(fund);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function destroy(req: Request, res: Response) {
    try {
        await FundService.deleteFund(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}