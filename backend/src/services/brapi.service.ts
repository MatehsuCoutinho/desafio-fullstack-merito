import axios from 'axios';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

interface BrapiQuoteResult {
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    quoteType: string;
}

function mapQuoteType(quoteType: string, symbol: string): string {
    const types: Record<string, string> = {
        EQUITY: 'Ações',
        ETF: 'ETF',
        FUND: 'Fundo',
        FIXED_INCOME: 'Renda Fixa',
        FII: 'Fundo Imobiliário',
        BDR: 'BDR',
    };

    if (types[quoteType]) return types[quoteType];

    // Tenta inferir pelo ticker quando o tipo não é reconhecido
    if (symbol.endsWith('11')) return 'Fundo Imobiliário';
    if (symbol.endsWith('34') || symbol.endsWith('35')) return 'BDR';

    return 'Outros';
}

export async function searchTicker(ticker: string) {
    try {
        const { data } = await axios.get(`${BRAPI_BASE_URL}/quote/${ticker.toUpperCase()}`, {
            params: { token: BRAPI_TOKEN },
        });

        const result: BrapiQuoteResult = data?.results?.[0];

        if (!result) {
            throw new Error(`Ticker "${ticker.toUpperCase()}" não encontrado na BRAPI.`);
        }

        return {
            ticker: result.symbol,
            name: result.shortName,
            type: mapQuoteType(result.quoteType, result.symbol),
            quotaValue: result.regularMarketPrice,
        };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error(`Ticker "${ticker.toUpperCase()}" não encontrado.`);
        }
        throw new Error(error.message ?? 'Erro ao consultar a BRAPI.');
    }
}