import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Fund, Transaction } from '../types';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [form, setForm] = useState({ date: '', type: 'APORTE', value: '', fundId: '' });
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
            setForm({ date: '', type: 'APORTE', value: '', fundId: '' });
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
        <div>
            <h1 style={styles.title}>Movimentações</h1>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Nova Movimentação</h2>

                <div style={styles.formGrid}>
                    <div>
                        <label style={styles.label}>Data</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Tipo</label>
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
                        <label style={styles.label}>Valor (R$)</label>
                        <input
                            type="number"
                            style={styles.input}
                            placeholder="0,00"
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Fundo</label>
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

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Movimentação'}
                </button>
            </div>

            <h2 style={styles.subtitle}>Histórico</h2>

            {transactions.length === 0 ? (
                <p>Nenhuma movimentação registrada.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Data</th>
                            <th style={styles.th}>Fundo</th>
                            <th style={styles.th}>Ticker</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Cotas</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id} style={styles.tr}>
                                <td style={styles.td}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
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
                                <td style={styles.td}>
                                    {Number(t.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td style={styles.td}>{Number(t.quotas).toFixed(4)}</td>
                                <td style={styles.td}>
                                    <button
                                        style={{ ...styles.btnSmall, background: '#dc3545' }}
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        Estornar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    title: { marginBottom: '24px' },
    subtitle: { margin: '32px 0 16px' },
    card: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' },
    input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' as const },
    btn: { padding: '10px 24px', background: '#003580', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    btnSmall: { padding: '6px 12px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    error: { color: '#dc3545', marginTop: '8px', fontSize: '14px' },
    success: { color: '#28a745', marginTop: '8px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    th: { background: '#003580', color: '#fff', padding: '12px', textAlign: 'left' as const, fontSize: '14px' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '12px', fontSize: '14px' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
};