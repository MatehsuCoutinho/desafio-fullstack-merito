import { prisma } from '../lib/prisma';

interface CreateFundDTO {
    name: string;
    ticker: string;
    type: string;
    quotaValue: number;
}

export async function getAllFunds() {
    return prisma.fund.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getFundById(id: string) {
    return prisma.fund.findUnique({
        where: { id },
    });
}

export async function getFundByTicker(ticker: string) {
    return prisma.fund.findUnique({
        where: { ticker: ticker.toUpperCase() },
    });
}

export async function createFund(data: CreateFundDTO) {
    const existing = await getFundByTicker(data.ticker);
    if (existing) {
        throw new Error(`Fundo com ticker "${data.ticker}" já existe.`);
    }

    return prisma.fund.create({
        data: {
            name: data.name,
            ticker: data.ticker.toUpperCase(),
            type: data.type,
            quotaValue: data.quotaValue,
        },
    });
}

export async function deleteFund(id: string) {
    const fund = await getFundById(id);
    if (!fund) {
        throw new Error('Fundo não encontrado.');
    }

    const hasTransactions = await prisma.transaction.findFirst({
        where: { fundId: id },
    });

    if (hasTransactions) {
        throw new Error('Não é possível excluir um fundo com movimentações registradas.');
    }

    return prisma.fund.delete({ where: { id } });
}