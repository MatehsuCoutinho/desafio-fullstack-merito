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

// Dados obrigatórios apenas para criação manual
interface CustomFundData {
    name: string;
    ticker: string;
    type: string;
    cota: number;
}

export async function createFund(ticker: string, customData?: CustomFundData) {
    const existing = await getFundByTicker(ticker);
    if (existing) {
        throw new Error(`Fundo com ticker "${ticker.toUpperCase()}" já está cadastrado.`);
    }

    // Tenta buscar na BRAPI primeiro
    const brapiData = await searchTicker(ticker).catch(() => null);

    if (brapiData) {
        // Fundo encontrado na BRAPI — cria com os dados dela
        return prisma.fund.create({
            data: {
                name: brapiData.name,
                ticker: brapiData.ticker,
                type: brapiData.type,
                quotaValue: brapiData.quotaValue,
            },
        });
    }

    // Não encontrado na BRAPI — exige dados manuais
    if (!customData) {
        throw new Error(
            `Ticker "${ticker.toUpperCase()}" não encontrado na BRAPI. ` +
            `Forneça os dados manualmente para criar um fundo personalizado.`
        );
    }

    return prisma.fund.create({
        data: {
            name: customData.name,
            ticker: customData.ticker.toUpperCase(),
            type: customData.type,
            quotaValue: customData.cota || 10.50, 
        },
    });
}

export async function syncFundQuota(id: string) {
    const fund = await getFundById(id);
    if (!fund) throw new Error('Fundo não encontrado.');

    // Tenta buscar na BRAPI — se falhar, é personalizado, ignora silenciosamente
    const brapiData = await searchTicker(fund.ticker).catch(() => null);
    if (!brapiData) return fund;

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