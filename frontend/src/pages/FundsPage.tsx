import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Fund, BrapiSearchResult } from '../types';

export default function FundsPage() {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [ticker, setTicker] = useState('');
    const [preview, setPreview] = useState<BrapiSearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadFunds() {
        const res = await api.get('/funds');
        setFunds(res.data);
    }

    useEffect(() => { loadFunds(); }, []);

    async function handleSearch() {
        if (!ticker.trim()) return;
        setSearching(true);
        setError('');
        setPreview(null);
        try {
            const res = await api.get(`/brapi/search/${ticker.toUpperCase()}`);
            setPreview(res.data);
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Ticker não encontrado.');
        } finally {
            setSearching(false);
        }
    }

    async function handleAdd() {
        if (!preview) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/funds', { ticker: preview.ticker });
            setSuccess(`Fundo ${preview.ticker} cadastrado com sucesso!`);
            setTicker('');
            setPreview(null);
            loadFunds();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erro ao cadastrar fundo.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSync(id: string, ticker: string) {
        try {
            await api.patch(`/funds/${id}/sync`);
            setSuccess(`Cota de ${ticker} atualizada!`);
            loadFunds();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erro ao sincronizar.');
        }
    }

    async function handleDelete(id: string, ticker: string) {
        if (!confirm(`Deseja remover o fundo ${ticker}?`)) return;
        try {
            await api.delete(`/funds/${id}`);
            setSuccess(`Fundo ${ticker} removido.`);
            loadFunds();
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erro ao remover fundo.');
        }
    }

    return (
        <div>
            <h1 style={styles.title}>Fundos</h1>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Buscar e Cadastrar Fundo</h2>
                <div style={styles.row}>
                    <input
                        style={styles.input}
                        placeholder="Digite o ticker (ex: MXRF11, HGLG11, KNRI11, XPML11...)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button style={styles.btn} onClick={handleSearch} disabled={searching}>
                        {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                {preview && (
                    <div style={styles.preview}>
                        <p><strong>Nome:</strong> {preview.name}</p>
                        <p><strong>Ticker:</strong> {preview.ticker}</p>
                        <p><strong>Tipo:</strong> {preview.type}</p>
                        <p><strong>Valor da Cota:</strong>{' '}
                            {Number(preview.quotaValue).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </p>
                        <button style={styles.btnGreen} onClick={handleAdd} disabled={loading}>
                            {loading ? 'Cadastrando...' : '+ Cadastrar Fundo'}
                        </button>
                    </div>
                )}
            </div>

            <h2 style={styles.subtitle}>Fundos Cadastrados</h2>

            {funds.length === 0 ? (
                <p>Nenhum fundo cadastrado.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nome</th>
                            <th style={styles.th}>Ticker</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Valor da Cota</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funds.map((f) => (
                            <tr key={f.id} style={styles.tr}>
                                <td style={styles.td}>{f.name}</td>
                                <td style={styles.td}>{f.ticker}</td>
                                <td style={styles.td}>{f.type}</td>
                                <td style={styles.td}>
                                    {Number(f.quotaValue).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </td>
                                <td style={styles.td}>
                                    <button
                                        style={styles.btnSmall}
                                        onClick={() => handleSync(f.id, f.ticker)}
                                    >
                                        Sincronizar
                                    </button>
                                    <button
                                        style={{ ...styles.btnSmall, ...styles.btnRed }}
                                        onClick={() => handleDelete(f.id, f.ticker)}
                                    >
                                        Remover
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
    row: { display: 'flex', gap: '8px' },
    input: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
    btn: { padding: '10px 20px', background: '#003580', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    btnGreen: { marginTop: '12px', padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    btnSmall: { padding: '6px 12px', background: '#003580', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '8px' },
    btnRed: { background: '#dc3545' },
    preview: { marginTop: '16px', padding: '16px', background: '#f0f4ff', borderRadius: '8px', lineHeight: '1.8' },
    error: { color: '#dc3545', marginTop: '8px', fontSize: '14px' },
    success: { color: '#28a745', marginTop: '8px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    th: { background: '#003580', color: '#fff', padding: '12px', textAlign: 'left' as const, fontSize: '14px' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '12px', fontSize: '14px' },
};