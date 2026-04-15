import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Fund, BrapiSearchResult } from '../types';

export default function FundsPage() {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [ticker, setTicker] = useState('');
    const [preview, setPreview] = useState<BrapiSearchResult | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualType, setManualType] = useState('');
    const [manualCota, setManualCota] = useState('');
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
        setManualMode(false);
        setManualName('');
        setManualType('');
        setManualCota('');
        try {
            const res = await api.get(`/brapi/search/${ticker.toUpperCase()}`);
            setPreview(res.data);
        } catch (e: any) {
            setError('Ticker não encontrado na BRAPI. Preencha os dados manualmente para cadastrá-lo.');
            setManualMode(true);
        } finally {
            setSearching(false);
        }
    }

    async function handleAdd() {
        if (!preview && !manualMode) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (preview) {
                await api.post('/funds', { ticker: preview.ticker });
                setSuccess(`Fundo ${preview.ticker} cadastrado com sucesso!`);
                setPreview(null);
            } else {
                if (!manualName.trim() || !manualType.trim() || !manualCota) {
                    setError('Preencha nome, tipo e valor da cota.');
                    setLoading(false);
                    return;
                }
                await api.post('/funds', {
                    ticker: ticker.toUpperCase(),
                    name: manualName,
                    type: manualType,
                    cota: Number(manualCota),
                });
                setSuccess(`Fundo ${ticker.toUpperCase()} cadastrado com sucesso!`);
                setManualMode(false);
                setManualName('');
                setManualType('');
                setManualCota('');
            }
            setTicker('');
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
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <span style={styles.pageAccent}>///</span>
                <h1 style={styles.title}>FUNDOS</h1>
            </div>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                    <span style={styles.cardAccent}>—</span> BUSCAR E CADASTRAR FUNDO
                </h2>
                <div style={styles.row}>
                    <input
                        style={styles.input}
                        placeholder="Digite o ticker (ex: MXRF11, HGLG11, KNRI11...)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button style={styles.btn} onClick={handleSearch} disabled={searching}>
                        {searching ? 'BUSCANDO...' : 'BUSCAR'}
                    </button>
                </div>

                {error && <p style={styles.error}>⚠ {error}</p>}
                {success && <p style={styles.success}>✓ {success}</p>}

                {manualMode && (
                    <div style={styles.preview}>
                        <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px', letterSpacing: '0.05em' }}>
                            CADASTRO MANUAL — TICKER: <span style={{ color: '#fff' }}>{ticker.toUpperCase()}</span>
                        </p>
                        <div style={styles.manualGrid}>
                            <div style={styles.manualField}>
                                <label style={styles.manualLabel}>NOME DO FUNDO</label>
                                <input
                                    style={styles.input}
                                    placeholder="Ex: Maxi Renda FII"
                                    value={manualName}
                                    onChange={(e) => setManualName(e.target.value)}
                                />
                            </div>
                            <div style={styles.manualField}>
                                <label style={styles.manualLabel}>TIPO</label>
                                <input
                                    style={styles.input}
                                    placeholder="Ex: Fundo Imobiliário, Ações..."
                                    value={manualType}
                                    onChange={(e) => setManualType(e.target.value)}
                                />
                            </div>
                            <div style={styles.manualField}>
                                <label style={styles.manualLabel}>VALOR DA COTA (R$)</label>
                                <input
                                    style={styles.input}
                                    placeholder="Ex: 10.50"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={manualCota}
                                    onChange={(e) => setManualCota(e.target.value)}
                                />
                            </div>
                        </div>
                        <button style={styles.btnAdd} onClick={handleAdd} disabled={loading}>
                            {loading ? 'CADASTRANDO...' : '+ CADASTRAR FUNDO MANUALMENTE'}
                        </button>
                    </div>
                )}

                {preview && (
                    <div style={styles.preview}>
                        <div style={styles.previewGrid}>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>NOME</span>
                                <span style={styles.previewValue}>{preview.name}</span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>TICKER</span>
                                <span style={{ ...styles.previewValue, color: '#C0392B', fontSize: '20px' }}>{preview.ticker}</span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>TIPO</span>
                                <span style={styles.previewValue}>{preview.type}</span>
                            </div>
                            <div style={styles.previewItem}>
                                <span style={styles.previewLabel}>VALOR DA COTA</span>
                                <span style={{ ...styles.previewValue, color: '#fff', fontSize: '20px' }}>
                                    {Number(preview.quotaValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                        <button style={styles.btnAdd} onClick={handleAdd} disabled={loading}>
                            {loading ? 'CADASTRANDO...' : '+ CADASTRAR FUNDO'}
                        </button>
                    </div>
                )}
            </div>

            <div style={styles.tableHeader}>
                <span style={styles.pageAccent}>—</span>
                <h2 style={styles.subtitle}>FUNDOS CADASTRADOS</h2>
            </div>

            {funds.length === 0 ? (
                <p style={{ color: '#666', letterSpacing: '0.05em', fontSize: '13px' }}>NENHUM FUNDO CADASTRADO.</p>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>NOME</th>
                                <th style={styles.th}>TICKER</th>
                                <th style={styles.th}>TIPO</th>
                                <th style={styles.th}>VALOR DA COTA</th>
                                <th style={styles.th}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funds.map((f) => (
                                <tr key={f.id} style={styles.tr}>
                                    <td style={styles.td}>{f.name}</td>
                                    <td style={{ ...styles.td, fontWeight: '800', color: '#fff', letterSpacing: '0.05em' }}>{f.ticker}</td>
                                    <td style={styles.td}>{f.type}</td>
                                    <td style={{ ...styles.td, color: '#C0392B', fontWeight: '700' }}>
                                        {Number(f.quotaValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.btnSmall} onClick={() => handleSync(f.id, f.ticker)}>
                                            SINCRONIZAR
                                        </button>
                                        <button
                                            style={{ ...styles.btnSmall, ...styles.btnDanger }}
                                            onClick={() => handleDelete(f.id, f.ticker)}
                                        >
                                            REMOVER
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
        letterSpacing: '0.1em',
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
        borderRadius: '4px',
        padding: '20px',
        border: '1px solid #222',
    },

    cardTitle: {
        fontSize: '13px',
        fontWeight: '800',
        marginBottom: '16px',
        color: '#fff',
        letterSpacing: '0.1em',
        display: 'flex',
        gap: '10px',
    },

    cardAccent: {
        color: '#C0392B',
        fontWeight: '900',
    },

    row: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },

    input: {
        flex: '1 1 200px',
        padding: '12px',
        background: '#0d0d0d',
        border: '1px solid #333',
        color: '#fff',
    },

    btn: {
        flex: '1 1 120px',
        padding: '12px',
        background: '#C0392B',
        color: '#fff',
        border: 'none',
        fontWeight: '800',
    },

    btnAdd: {
        width: '100%',
        marginTop: '16px',
        padding: '12px',
        border: '1px solid #C0392B',
        color: '#C0392B',
        background: 'transparent',
    },

    btnSmall: {
        padding: '6px 10px',
        border: '1px solid #333',
        background: 'transparent',
        color: '#aaa',
        marginRight: '6px',
    },

    btnDanger: {
        borderColor: '#C0392B',
        color: '#C0392B',
    },

    preview: {
        marginTop: '16px',
        padding: '16px',
        background: '#0d0d0d',
        border: '1px solid #2a2a2a',
    },

    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
    },

    previewItem: {
        display: 'flex',
        flexDirection: 'column' as const,
    },

    previewLabel: {
        fontSize: '10px',
        color: '#666',
    },

    previewValue: {
        fontSize: '14px',
        color: '#bbb',
    },

    error: { color: '#E74C3C' },
    success: { color: '#27AE60' },

    manualGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '4px',
    },

    manualField: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
    },

    manualLabel: {
        fontSize: '10px',
        color: '#666',
        letterSpacing: '0.08em',
    },

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
};