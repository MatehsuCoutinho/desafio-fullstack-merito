import { prisma } from '../lib/prisma';
import { searchTicker } from './brapi.service';

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

export async function createFund(ticker: string) {
    const existing = await getFundByTicker(ticker);
    if (existing) {
        throw new Error(`Fundo com ticker "${ticker.toUpperCase()}" já está cadastrado.`);
    }

    // Busca os dados na BRAPI automaticamente
    const brapiData = await searchTicker(ticker);

    return prisma.fund.create({
        data: {
            name: brapiData.name,
            ticker: brapiData.ticker,
            type: brapiData.type,
            quotaValue: brapiData.quotaValue,
        },
    });
}

export async function syncFundQuota(id: string) {
    const fund = await getFundById(id);
    if (!fund) throw new Error('Fundo não encontrado.');

    // Busca o valor atualizado da cota na BRAPI
    const brapiData = await searchTicker(fund.ticker);

    return prisma.fund.update({
        where: { id },
        data: { quotaValue: brapiData.quotaValue },
    });
}

export async function deleteFund(id: string) {
    const fund = await getFundById(id);
    if (!fund) throw new Error('Fundo não encontrado.');

    const hasTransactions = await prisma.transaction.findFirst({
        where: { fundId: id },
    });

    if (hasTransactions) {
        throw new Error('Não é possível excluir um fundo com movimentações registradas.');
    }

    return prisma.fund.delete({ where: { id } });
}