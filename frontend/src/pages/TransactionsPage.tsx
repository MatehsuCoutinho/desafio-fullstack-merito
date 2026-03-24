import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Fund, Transaction } from '../types';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        date: today,
        type: 'APORTE',
        value: '',
        fundId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function loadData() {
        const [t, f] = await Promise.all([
            api.get('/transactions'),
            api.get('/funds'),
        ]);
        setTransactions(t.data);
        setFunds(f.data);
    }

    useEffect(() => { loadData(); }, []);

    async function handleSubmit() {
        setError('');
        setSuccess('');
        if (!form.date || !form.value || !form.fundId) {
            setError('Preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/transactions', {
                ...form,
                value: Number(form.value),
            });
            setSuccess('Movimentação registrada com sucesso!');
            setForm({ date: 'today', type: 'APORTE', value: '', fundId: '' });
            loadData();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erro ao registrar movimentação.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Deseja estornar esta movimentação?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            setSuccess('Movimentação estornada.');
            loadData();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erro ao estornar.');
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <span style={styles.pageAccent}>///</span>
                <h1 style={styles.title}>MOVIMENTAÇÕES</h1>
            </div>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                    <span style={styles.cardAccent}>—</span> NOVA MOVIMENTAÇÃO
                </h2>

                <div style={styles.formGrid}>
                    <div>
                        <label style={styles.label}>DATA</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={form.date}
                            max={today}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>TIPO</label>
                        <select
                            style={styles.input}
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="APORTE">Aporte</option>
                            <option value="RESGATE">Resgate</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>VALOR (R$)</label>
                        <input
                            type="number"
                            style={styles.input}
                            placeholder="0,00"
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>FUNDO</label>
                        <select
                            style={styles.input}
                            value={form.fundId}
                            onChange={(e) => setForm({ ...form, fundId: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {funds.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.ticker} — {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && <p style={styles.error}>⚠ {error}</p>}
                {success && <p style={styles.success}>✓ {success}</p>}

                <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'REGISTRANDO...' : 'REGISTRAR MOVIMENTAÇÃO'}
                </button>
            </div>

            <div style={styles.tableHeader}>
                <span style={styles.pageAccent}>—</span>
                <h2 style={styles.subtitle}>HISTÓRICO</h2>
            </div>

            {transactions.length === 0 ? (
                <p style={{ color: '#666', letterSpacing: '0.05em', fontSize: '13px' }}>NENHUMA MOVIMENTAÇÃO REGISTRADA.</p>
            ) : (
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
                                <th style={styles.th}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id} style={styles.tr}>
                                    <td style={styles.td}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                    <td style={styles.td}>{t.fund.name}</td>
                                    <td style={{ ...styles.td, fontWeight: '800', color: '#fff', letterSpacing: '0.05em' }}>{t.fund.ticker}</td>
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
                                    <td style={{ ...styles.td, color: t.type === 'APORTE' ? '#C0392B' : '#bbb', fontWeight: '700' }}>
                                        {Number(t.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td style={{ ...styles.td, color: '#666' }}>{Number(t.quotas).toFixed(4)}</td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.btnDanger}
                                            onClick={() => handleDelete(t.id)}
                                        >
                                            ESTORNAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        background: '#0d0d0d',
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
        color: '#C0392B',
        fontSize: '20px',
        fontWeight: 'bold',
    },

    title: {
        fontSize: 'clamp(20px, 4vw, 28px)',
        fontWeight: '900',
        color: '#fff',
    },

    subtitle: {
        fontSize: '16px',
        fontWeight: '800',
        color: '#fff',
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
        WebkitOverflowScrolling: 'touch',
    },

    card: {
        background: '#161616',
        padding: '20px',
        border: '1px solid #222',
    },

    cardTitle: {
        fontSize: '13px',
        fontWeight: '800',
        marginBottom: '16px',
        color: '#fff',
        display: 'flex',
        gap: '10px',
    },

    cardAccent: {
        color: '#C0392B',
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
    },

    label: {
        fontSize: '10px',
        color: '#666',
    },

    input: {
        width: '100%',
        padding: '12px',
        background: '#0d0d0d',
        border: '1px solid #333',
        color: '#fff',
    },

    btn: {
        width: '100%',
        padding: '12px',
        background: '#C0392B',
        color: '#fff',
        border: 'none',
        fontWeight: '800',
    },

    btnDanger: {
        padding: '6px 10px',
        border: '1px solid #C0392B',
        background: 'transparent',
        color: '#C0392B',
    },

    error: { color: '#E74C3C' },
    success: { color: '#27AE60' },

    table: {
        width: '100%',
        borderCollapse: 'collapse',
        background: '#161616',
        border: '1px solid #222',
        minWidth: '600px',
    },

    th: {
        padding: '12px',
        fontSize: '11px',
        color: '#666',
        borderBottom: '1px solid #222',
    },

    tr: {
        borderBottom: '1px solid #1e1e1e',
    },

    td: {
        padding: '12px',
        fontSize: '13px',
        color: '#bbb',
    },

    badge: {
        padding: '4px 10px',
        fontSize: '11px',
    },
};