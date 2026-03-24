import { prisma } from '../lib/prisma';

interface CreateTransactionDTO {
    date: string;
    type: 'APORTE' | 'RESGATE';
    value: number;
    fundId: string;
}

export async function getAllTransactions() {
    return prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        include: {
            fund: {
                select: { name: true, ticker: true, type: true },
            },
        },
    });
}

export async function getPortfolio() {
    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) throw new Error('Carteira não encontrada.');
    return portfolio;
}

export async function getQuotasByFund(fundId: string) {
    const result = await prisma.transaction.groupBy({
        by: ['fundId'],
        where: { fundId },
        _sum: { quotas: true },
    });

    return Number(result[0]?._sum?.quotas ?? 0);
}

export async function createTransaction(data: CreateTransactionDTO) {
    const fund = await prisma.fund.findUnique({ where: { id: data.fundId } });
    if (!fund) throw new Error('Fundo não encontrado.');

    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) throw new Error('Carteira não encontrada.');

    const quotaValue = Number(fund.quotaValue);
    const value = Number(data.value);

    if (value <= 0) throw new Error('O valor da movimentação deve ser maior que zero.');

    const quotas = value / quotaValue;

    if (data.type === 'RESGATE') {
        const currentQuotas = await getQuotasByFund(data.fundId);

        if (quotas > currentQuotas) {
            throw new Error(
                `Cotas insuficientes. Você possui ${currentQuotas.toFixed(6)} cotas neste fundo.`
            );
        }

        const currentBalance = Number(portfolio.totalBalance);
        if (value > currentBalance) {
            throw new Error(
                `Saldo insuficiente. Saldo atual: R$ ${currentBalance.toFixed(2)}.`
            );
        }
    }

    const balanceDelta = data.type === 'APORTE' ? value : -value;
    const quotasDelta = data.type === 'APORTE' ? quotas : -quotas;

    const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                date: new Date(data.date),
                type: data.type,
                value: value,
                quotas: quotasDelta,
                fundId: data.fundId,
                portfolioId: portfolio.id,
            },
            include: {
                fund: {
                    select: { name: true, ticker: true, type: true },
                },
            },
        }),
        prisma.portfolio.update({
            where: { id: portfolio.id },
            data: {
                totalBalance: {
                    increment: balanceDelta,
                },
            },
        }),
    ]);

    return transaction;
}

export async function deleteTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new Error('Movimentação não encontrada.');

    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) throw new Error('Carteira não encontrada.');

    if (transaction.type === 'RESGATE') {
        const quotasToRestore = Math.abs(Number(transaction.quotas));
        const currentQuotas = await getQuotasByFund(transaction.fundId);
        if (currentQuotas + quotasToRestore < 0) {
            throw new Error('Erro ao estornar movimentação: saldo de cotas inconsistente.');
        }
    }

    const balanceDelta = transaction.type === 'APORTE'
        ? -Number(transaction.value)
        : Number(transaction.value);

    await prisma.$transaction([
        prisma.transaction.delete({ where: { id } }),
        prisma.portfolio.update({
            where: { id: portfolio.id },
            data: {
                totalBalance: { increment: balanceDelta },
            },
        }),
    ]);

    return { message: 'Movimentação estornada com sucesso.' };
}