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

    if (loading) return <p style={{ color: '#aaa', padding: '40px', fontFamily: 'sans-serif' }}>Carregando...</p>;

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

    const PIE_COLORS = ['#C0392B', '#E74C3C', '#5e5e5e', '#555555', '#888888', '#AAAAAA'];

    const formatBRL = (v: number) =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const tooltipStyle = {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '13px',
    };

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <span style={styles.pageAccent}>///</span>
                <h1 style={styles.title}>DASHBOARD</h1>
            </div>

            {/* Cards de resumo */}
            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>SALDO DA CARTEIRA</p>
                    <p style={styles.cardValue}>
                        {formatBRL(Number(portfolio?.totalBalance ?? 0))}
                    </p>
                    <div style={styles.cardBar} />
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>TOTAL DE MOVIMENTAÇÕES</p>
                    <p style={styles.cardValue}>{transactions.length}</p>
                    <div style={styles.cardBar} />
                </div>
                <div style={styles.card}>
                    <p style={styles.cardLabel}>FUNDOS NA CARTEIRA</p>
                    <p style={styles.cardValue}>{funds.length}</p>
                    <div style={styles.cardBar} />
                </div>
                <div style={{ ...styles.card, ...styles.cardHighlight }}>
                    <p style={{ ...styles.cardLabel, color: '#aaa' }}>TOTAL APORTADO</p>
                    <p style={{ ...styles.cardValue, color: '#fff' }}>
                        {formatBRL(
                            transactions
                                .filter((t) => t.type === 'APORTE')
                                .reduce((acc, t) => acc + Number(t.value), 0)
                        )}
                    </p>
                    <div style={{ ...styles.cardBar, background: '#fff' }} />
                </div>
            </div>

            {transactions.length === 0 ? (
                <div style={styles.empty}>
                    <p style={{ color: '#888', letterSpacing: '0.05em' }}>
                        NENHUMA MOVIMENTAÇÃO AINDA — CADASTRE UM FUNDO E FAÇA UM APORTE.
                    </p>
                </div>
            ) : (
                <>
                    {/* Gráfico de evolução do saldo */}
                    <div style={styles.chartCard}>
                        <h2 style={styles.chartTitle}>
                            <span style={styles.chartAccent}>—</span> EVOLUÇÃO DO SALDO
                        </h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={balanceEvolution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888', fontFamily: 'sans-serif' }} axisLine={{ stroke: '#333' }} tickLine={false} />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#888', fontFamily: 'sans-serif' }}
                                    tickFormatter={(v) =>
                                        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    }
                                    width={110}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={(v) => formatBRL(Number(v ?? 0))}
                                    labelStyle={{ fontWeight: 'bold', color: '#C0392B' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="saldo"
                                    stroke="#C0392B"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#C0392B', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#E74C3C' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.chartsRow}>
                        {quotasByFund.length > 0 && (
                            <div style={{ ...styles.chartCard, flex: 1 }}>
                                <h2 style={styles.chartTitle}>
                                    <span style={styles.chartAccent}>—</span> DISTRIBUIÇÃO DE COTAS
                                </h2>
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
                                            labelLine={{ stroke: '#555' }}
                                        >
                                            {quotasByFund.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={(value) => `${Number(value ?? 0).toFixed(4)} cotas`}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {aportesVsResgates.length > 0 && (
                            <div style={{ ...styles.chartCard, flex: 1 }}>
                                <h2 style={styles.chartTitle}>
                                    <span style={styles.chartAccent}>—</span> APORTES VS RESGATES
                                </h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={aportesVsResgates}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                        <XAxis dataKey="fundo" tick={{ fontSize: 11, fill: '#888' }} axisLine={{ stroke: '#333' }} tickLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#888' }}
                                            tickFormatter={(v) =>
                                                v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            }
                                            width={110}
                                            axisLine={{ stroke: '#333' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={(value) => formatBRL(Number(value ?? 0))}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
                                        <Bar dataKey="aportes" name="Aportes" fill="#C0392B" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="resgates" name="Resgates" fill="#555" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Tabela de movimentações */}
                    <div style={styles.tableHeader}>
                        <span style={styles.chartAccent}>—</span>
                        <h2 style={styles.subtitle}>ÚLTIMAS MOVIMENTAÇÕES</h2>
                    </div >
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>DATA</th>
                                    <th style={styles.th}>FUNDO</th>
                                    <th style={styles.th}>TICKER</th>
                                    <th style={styles.th}>TIPO</th>
                                    <th style={styles.th}>VALOR</th>
                                    <th style={styles.th}>COTAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            {new Date(t.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={styles.td}>{t.fund.name}</td>
                                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#fff' }}>{t.fund.ticker}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                background: t.type === 'APORTE' ? 'rgba(192,57,43,0.15)' : 'rgba(80,80,80,0.3)',
                                                color: t.type === 'APORTE' ? '#E74C3C' : '#aaa',
                                                border: `1px solid ${t.type === 'APORTE' ? '#C0392B' : '#444'}`,
                                            }}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{formatBRL(Number(t.value))}</td>
                                        <td style={{ ...styles.td, color: '#888' }}>{Number(t.quotas).toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#0B0B0C',
    minHeight: '100vh',
    padding: '16px',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },

  pageAccent: {
    color: '#E5484D',
    fontSize: '20px',
    fontWeight: '900',
    letterSpacing: '-1px',
  },

  title: {
    fontSize: 'clamp(20px, 4vw, 28px)',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: '0.1em',
    margin: 0,
  },

  subtitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '0.1em',
    margin: 0,
  },

  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '32px 0 16px',
    flexWrap: 'wrap',
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },

  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },

  card: {
    background: '#141416',
    borderRadius: '6px',
    padding: '16px',
    border: '1px solid #26262A',
    position: 'relative',
    transition: 'all 0.2s ease',
  },

  cardHighlight: {
    background: '#1A1A1D',
    border: '1px solid #E5484D',
  },

  cardBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    background: '#E5484D',
  },

  cardLabel: {
    fontSize: '11px',
    color: '#71717A',
    marginBottom: '8px',
    letterSpacing: '0.12em',
    fontWeight: '600',
  },

  cardValue: {
    fontSize: 'clamp(18px, 5vw, 24px)',
    fontWeight: '900',
    color: '#FFFFFF',
  },

  chartCard: {
    background: '#141416',
    borderRadius: '6px',
    padding: '16px',
    border: '1px solid #26262A',
    marginBottom: '20px',
    flex: '1 1 100%',
  },

  chartTitle: {
    fontSize: '13px',
    fontWeight: '800',
    marginBottom: '16px',
    color: '#FFFFFF',
    letterSpacing: '0.12em',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  chartAccent: {
    color: '#E5484D',
    fontWeight: '900',
    fontSize: '16px',
  },

  chartsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },

  empty: {
    background: '#141416',
    borderRadius: '6px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid #26262A',
    color: '#71717A',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#141416',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #26262A',
    minWidth: '600px',
  },

  th: {
    background: '#101012',
    color: '#71717A',
    padding: '12px',
    textAlign: 'left' as const,
    fontSize: '11px',
    letterSpacing: '0.1em',
    fontWeight: '700',
    borderBottom: '1px solid #26262A',
  },

  tr: {
    borderBottom: '1px solid #1F1F23',
  },

  td: {
    padding: '12px',
    fontSize: '13px',
    color: '#A1A1AA',
  },

  badge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
  },
};