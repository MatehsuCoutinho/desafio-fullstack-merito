export interface Fund {
    id: string;
    name: string;
    ticker: string;
    type: string;
    quotaValue: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'APORTE' | 'RESGATE';
    value: string;
    quotas: string;
    fundId: string;
    portfolioId: string;
    createdAt: string;
    fund: {
        name: string;
        ticker: string;
        type: string;
    };
}

export interface Portfolio {
    id: string;
    totalBalance: string;
    createdAt: string;
    updatedAt: string;
}

export interface BrapiSearchResult {
    ticker: string;
    name: string;
    type: string;
    quotaValue: number;
}