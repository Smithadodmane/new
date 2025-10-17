import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LogEntry from './components/LogEntry';
import AnalyzeWeek from './components/AnalyzeWeek';
import PredictCause from './components/PredictCause';
import PredictAlertness from './components/PredictAlertnessClean';
import PredictMedical from './components/PredictMedical';
import Login from './components/Login';

type Page = 'dashboard' | 'log-entry' | 'analyze-week' | 'predict-cause' | 'predict-alertness' | 'predict-medical';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('safeBiteUser');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogin = (u: { email: string }) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('safeBiteUser');
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} user={user} />}
      {currentPage === 'log-entry' && <LogEntry onNavigate={handleNavigate} />}
      {currentPage === 'analyze-week' && <AnalyzeWeek onNavigate={handleNavigate} />}
      {currentPage === 'predict-cause' && <PredictCause onNavigate={handleNavigate} />}
      {currentPage === 'predict-alertness' && <PredictAlertness onNavigate={handleNavigate} />}
      {currentPage === 'predict-medical' && <PredictMedical onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
