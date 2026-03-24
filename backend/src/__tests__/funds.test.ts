import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

// Mock da BRAPI para não fazer chamadas externas nos testes
jest.mock('../services/brapi.service', () => ({
    searchTicker: jest.fn().mockResolvedValue({
        ticker: 'MXRF11',
        name: 'Maxi Renda FII',
        type: 'Fundo Imobiliário',
        quotaValue: 10.5,
    }),
}));

describe('Funds', () => {
    let createdFundId: string;

    beforeAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.fund.deleteMany();
    });

    afterAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.fund.deleteMany();
        await prisma.$disconnect();
    });

    it('POST /funds — deve cadastrar um fundo via ticker', async () => {
        const res = await request(app)
            .post('/funds')
            .send({ ticker: 'MXRF11' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.ticker).toBe('MXRF11');
        expect(res.body.name).toBe('Maxi Renda FII');
        expect(res.body.type).toBe('Fundo Imobiliário');
        expect(Number(res.body.quotaValue)).toBe(10.5);

        createdFundId = res.body.id;
    });

    it('POST /funds — deve rejeitar ticker duplicado', async () => {
        const res = await request(app)
            .post('/funds')
            .send({ ticker: 'MXRF11' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/já está cadastrado/i);
    });

    it('POST /funds — deve rejeitar body sem ticker', async () => {
        const res = await request(app)
            .post('/funds')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/ticker é obrigatório/i);
    });

    it('GET /funds — deve listar os fundos', async () => {
        const res = await request(app).get('/funds');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /funds/:id — deve retornar o fundo pelo id', async () => {
        const res = await request(app).get(`/funds/${createdFundId}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdFundId);
    });

    it('GET /funds/:id — deve retornar 404 para id inexistente', async () => {
        const res = await request(app).get('/funds/id-inexistente');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/não encontrado/i);
    });

    it('DELETE /funds/:id — deve rejeitar exclusão de fundo com movimentações', async () => {
        const portfolio = await prisma.portfolio.findFirst();

        await prisma.transaction.create({
            data: {
                date: new Date(),
                type: 'APORTE',
                value: 100,
                quotas: 9.52,
                fundId: createdFundId,
                portfolioId: portfolio!.id,
            },
        });

        const res = await request(app).delete(`/funds/${createdFundId}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/movimentações registradas/i);
    });
});