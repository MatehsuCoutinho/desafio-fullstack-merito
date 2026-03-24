import { Request, Response } from 'express';
import * as BrapiService from '../services/brapi.service';

export async function search(req: Request, res: Response) {
    try {
        const { ticker } = req.params;

        if (!ticker) {
            res.status(400).json({ error: 'Ticker é obrigatório.' });
            return;
        }

        const result = await BrapiService.searchTicker(ticker as string);
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
}