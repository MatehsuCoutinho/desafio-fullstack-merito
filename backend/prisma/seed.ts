import { prisma } from '../src/lib/prisma';

async function main() {
    const existing = await prisma.portfolio.findFirst();
    if (!existing) {
        await prisma.portfolio.create({ data: {} });
        console.log('Portfolio criado com saldo inicial 0');
    } else {
        console.log('Portfolio já existe, seed ignorado');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());