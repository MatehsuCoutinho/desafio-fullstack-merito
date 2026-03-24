import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Portfolio, Transaction, Fund } from '../types';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend, BarChart, Bar,
} from 'recharts';

export default function DashboardPage() {
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [p, t, f] = await Promise.all([
                    api.get('/transactions/portfolio'),
                    api.get('/transactions'),
                    api.get('/funds'),
                ]);
                setPortfolio(p.data);
                setTransactions(t.data);
                setFunds(f.data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p>Carregando...</p>;

    // Evolução do saldo ao longo do tempo
    const balanceEvolution = (() => {
        const sorted = [...transactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        let accumulated = 0;
        return sorted.map((t) => {
            accumulated += t.type === 'APORTE' ? Number(t.value) : -Number(t.value);
            return {
                date: new Date(t.date).toLocaleDateString('pt-BR'),
                saldo: Number(accumulated.toFixed(2)),
            };
        });
    })();

    // Distribuição de cotas por fundo
    const quotasByFund = (() => {
        const map: Record<string, number> = {};
        transactions.forEach((t) => {
            const ticker = t.fund.ticker;
            if (!map[ticker]) map[ticker] = 0;
            map[ticker] += Number(t.quotas);
        });
        return Object.entries(map)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value: Number(value.toFixed(4)) }));
    })();

    // Aportes vs Resgates por fundo
    const aportesVsResgates = (() => {
        const map: Record<string, { fundo: string; aportes: number; resgates: number }> = {};
        transactions.forEach((t) => {
            const ticker = t.fund.ticker;
            if (!map[ticker]) map[ticker] = { fundo: ticker, aportes: 0, resgates: 0 };
            if (t.type === 'APORTE') map[ticker].aportes += Number(t.value);
            else map[ticker].resgates += Number(t.value);
        });
        return Object.values(map);
    })();

    const PIE_COLORS = ['#003580', '#0056b3', '#0099cc', '#00bcd4', '#4dd0e1', '#80deea'];

    const formatBRL = (v: number) =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div>
            <h1 style={styles.title}>Dashboard</h1>

            {/* Cards de resumo */}
            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Saldo da Carteira</p>
                    <p style={styles.cardValue}>
                        {formatBRL(Number(portfolio?.totalBalance ?? 0))}
                    </p>
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Total de Movimentações</p>
                    <p style={styles.cardValue}>{transactions.length}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Fundos na Carteira</p>
                    <p style={styles.cardValue}>{funds.length}</p>
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>Total Aportado</p>
                    <p style={{ ...styles.cardValue, color: '#155724' }}>
                        {formatBRL(
                            transactions
                                .filter((t) => t.type === 'APORTE')
                                .reduce((acc, t) => acc + Number(t.value), 0)
                        )}
                    </p>
                </div>
            </div>

            {transactions.length === 0 ? (
                <div style={styles.empty}>
                    <p>Nenhuma movimentação ainda. Cadastre um fundo e faça um aporte!</p>
                </div>
            ) : (
                <>
                    {/* Gráfico de evolução do saldo */}
                    <div style={styles.chartCard}>
                        <h2 style={styles.chartTitle}>Evolução do Saldo</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={balanceEvolution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) =>
                                        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    }
                                    width={100}
                                />
                                <Tooltip
                                    formatter={(v) => formatBRL(Number(v ?? 0))} labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="saldo"
                                    stroke="#003580"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#003580' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.chartsRow}>
                        {/* Gráfico de pizza — distribuição de cotas */}
                        {quotasByFund.length > 0 && (
                            <div style={{ ...styles.chartCard, flex: 1 }}>
                                <h2 style={styles.chartTitle}>Distribuição de Cotas por Fundo</h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={quotasByFund}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label={({ name, percent }) =>
                                                `${name} ${(percent! * 100).toFixed(1)}%`
                                            }
                                        >
                                            {quotasByFund.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(4)} cotas`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Gráfico de barras — aportes vs resgates */}
                        {aportesVsResgates.length > 0 && (
                            <div style={{ ...styles.chartCard, flex: 1 }}>
                                <h2 style={styles.chartTitle}>Aportes vs Resgates por Fundo</h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={aportesVsResgates}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="fundo" tick={{ fontSize: 12 }} />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) =>
                                                v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            }
                                            width={100}
                                        />
                                        <Tooltip formatter={(value) => formatBRL(Number(value ?? 0))} />
                                        <Legend />
                                        <Bar dataKey="aportes" name="Aportes" fill="#003580" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="resgates" name="Resgates" fill="#dc3545" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Tabela de movimentações */}
                    <h2 style={styles.subtitle}>Últimas Movimentações</h2>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Data</th>
                                <th style={styles.th}>Fundo</th>
                                <th style={styles.th}>Ticker</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Valor</th>
                                <th style={styles.th}>Cotas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={styles.td}>{t.fund.name}</td>
                                    <td style={styles.td}>{t.fund.ticker}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            background: t.type === 'APORTE' ? '#d4edda' : '#f8d7da',
                                            color: t.type === 'APORTE' ? '#155724' : '#721c24',
                                        }}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{formatBRL(Number(t.value))}</td>
                                    <td style={styles.td}>{Number(t.quotas).toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    title: { marginBottom: '24px' },
    subtitle: { margin: '32px 0 16px' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    card: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardLabel: { fontSize: '13px', color: '#666', marginBottom: '8px' },
    cardValue: { fontSize: '24px', fontWeight: 'bold', color: '#003580' },
    chartCard: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' },
    chartTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#333' },
    chartsRow: { display: 'flex', gap: '24px', marginBottom: '0' },
    empty: { background: '#fff', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    th: { background: '#003580', color: '#fff', padding: '12px', textAlign: 'left' as const, fontSize: '14px' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '12px', fontSize: '14px' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
};