import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

jest.mock('../services/brapi.service', () => ({
    searchTicker: jest.fn().mockResolvedValue({
        ticker: 'FIXA11',
        name: 'Fundo Renda Fixa',
        type: 'Renda Fixa',
        quotaValue: 100.0,
    }),
}));

describe('Transactions', () => {
    let fundId: string;
    let portfolioId: string;
    let transactionId: string;

    beforeAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.fund.deleteMany();

        const fund = await prisma.fund.create({
            data: {
                name: 'Fundo Renda Fixa',
                ticker: 'FIXA11',
                type: 'Renda Fixa',
                quotaValue: 100.0,
            },
        });
        fundId = fund.id;

        let portfolio = await prisma.portfolio.findFirst();
        if (!portfolio) {
            portfolio = await prisma.portfolio.create({ data: {} });
        } else {
            portfolio = await prisma.portfolio.update({
                where: { id: portfolio.id },
                data: { totalBalance: 0 },
            });
        }
        portfolioId = portfolio.id;
    });

    afterAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.fund.deleteMany();
        await prisma.portfolio.updateMany({ data: { totalBalance: 0 } });
        await prisma.$disconnect();
    });

    it('POST /transactions — deve registrar um aporte', async () => {
        const res = await request(app)
            .post('/transactions')
            .send({
                date: '2024-03-01',
                type: 'APORTE',
                value: 1000,
                fundId,
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.type).toBe('APORTE');
        expect(Number(res.body.value)).toBe(1000);
        expect(Number(res.body.quotas)).toBe(10); // 1000 / 100

        transactionId = res.body.id;
    });

    it('GET /transactions/portfolio — saldo deve ser 1000 após aporte', async () => {
        const res = await request(app).get('/transactions/portfolio');

        expect(res.status).toBe(200);
        expect(Number(res.body.totalBalance)).toBe(1000);
    });

    it('GET /transactions/quotas/:fundId — deve retornar 10 cotas', async () => {
        const res = await request(app).get(`/transactions/quotas/${fundId}`);

        expect(res.status).toBe(200);
        expect(Number(res.body.totalQuotas)).toBe(10);
    });

    it('POST /transactions — deve registrar um resgate parcial', async () => {
        const res = await request(app)
            .post('/transactions')
            .send({
                date: '2024-03-10',
                type: 'RESGATE',
                value: 500,
                fundId,
            });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('RESGATE');
        expect(Number(res.body.quotas)).toBe(-5); // -500 / 100
    });

    it('GET /transactions/portfolio — saldo deve ser 500 após resgate', async () => {
        const res = await request(app).get('/transactions/portfolio');

        expect(res.status).toBe(200);
        expect(Number(res.body.totalBalance)).toBe(500);
    });

    it('POST /transactions — deve rejeitar resgate acima do saldo', async () => {
        const res = await request(app)
            .post('/transactions')
            .send({
                date: '2024-03-15',
                type: 'RESGATE',
                value: 99999,
                fundId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/insuficiente/i);
    });

    it('POST /transactions — deve rejeitar valor zero ou negativo', async () => {
        const res = await request(app)
            .post('/transactions')
            .send({
                date: '2024-03-15',
                type: 'APORTE',
                value: 0,
                fundId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/maior que zero/i);
    });

    it('POST /transactions — deve rejeitar body incompleto', async () => {
        const res = await request(app)
            .post('/transactions')
            .send({ type: 'APORTE' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/obrigatórios/i);
    });

    it('GET /transactions — deve listar movimentações ordenadas por data', async () => {
        const res = await request(app).get('/transactions');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('DELETE /transactions/:id — deve estornar a transação e ajustar saldo', async () => {
        const before = await request(app).get('/transactions/portfolio');
        const balanceBefore = Number(before.body.totalBalance);

        const res = await request(app).delete(`/transactions/${transactionId}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/estornada/i);

        const after = await request(app).get('/transactions/portfolio');
        const balanceAfter = Number(after.body.totalBalance);

        expect(balanceAfter).toBe(balanceBefore - 1000);
    });
});