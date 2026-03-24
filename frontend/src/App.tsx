import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import FundsPage from './pages/FundsPage.tsx';
import TransactionsPage from './pages/TransactionsPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <span style={styles.brand}>💼 Mérito Investimentos</span>
        <div style={styles.links}>
          <NavLink to="/" style={navStyle} end>Dashboard</NavLink>
          <NavLink to="/funds" style={navStyle}>Fundos</NavLink>
          <NavLink to="/transactions" style={navStyle}>Movimentações</NavLink>
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
  color: isActive ? '#fff' : '#ccc',
  textDecoration: 'none',
  fontWeight: isActive ? 'bold' : 'normal',
  padding: '4px 8px',
  borderRadius: '4px',
  background: isActive ? '#0056b3' : 'transparent',
});

const styles = {
  nav: {
    background: '#003580',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  links: {
    display: 'flex',
    gap: '12px',
  },
  main: {
    maxWidth: '960px',
    margin: '32px auto',
    padding: '0 16px',
  },
};