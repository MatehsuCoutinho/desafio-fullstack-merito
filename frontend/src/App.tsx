import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import FundsPage from './pages/FundsPage.tsx';
import TransactionsPage from './pages/TransactionsPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.brandWrapper}>
            <span style={styles.brandAccent}>///</span>
            <span style={styles.brand}>MÉRITO INVESTIMENTOS</span>
          </div>

          <div style={styles.links}>
            <NavLink to="/" style={navStyle} end>
              DASHBOARD
            </NavLink>
            <NavLink to="/funds" style={navStyle}>
              FUNDOS
            </NavLink>
            <NavLink to="/transactions" style={navStyle}>
              MOVIMENTAÇÕES
            </NavLink>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/funds" element={<FundsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  flex: '1 1 120px',
  textAlign: 'center' as const,

  color: isActive ? '#fff' : '#777',
  textDecoration: 'none',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.1em',

  padding: '10px',
  borderRadius: '3px',

  border: `1px solid ${isActive ? '#C0392B' : '#222'}`,
  background: isActive ? 'rgba(192,57,43,0.15)' : '#111',
});

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: '#0d0d0d',
    borderBottom: '1px solid #1e1e1e',
    padding: '18px 32px',
  },

  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },

  brandWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: '1 1 100%',
  },

  brandAccent: {
    color: '#C0392B',
    fontWeight: '900',
    fontSize: '18px',
    letterSpacing: '-1px',
  },

  brand: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '900',
    letterSpacing: '0.12em',
  },

  links: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
  },

  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 12px',
  },
};