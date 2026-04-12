'use client';
import { useLoanData } from "@/hooks/useLoanData";
import Dashboard from "@/components/Dashboard";
import PaymentForm from "@/components/PaymentForm";
import HistoryList from "@/components/HistoryList";
import EconomicIndicators from "@/components/EconomicIndicators";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsPanel from "@/components/SettingsPanel";
import { UserPreferencesProvider } from "@/hooks/useUserPreferences";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/components/Login";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { stats, schedule, addPayment, updatePayment, deletePayment } = useLoanData();

  if (authLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
              Loading...
          </div>
      );
  }

  if (!user) {
      return <Login />;
  }

  return (
    <UserPreferencesProvider>
      <div className="app-container">
        <header>
          <h1>Mortgage Tracker</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle />
            <SettingsPanel />
            <button
                onClick={logout}
                style={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    background: 'rgba(255, 61, 0, 0.1)',
                    color: 'var(--danger)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 61, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--danger)';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 61, 0, 0.1)';
                    e.currentTarget.style.color = 'var(--danger)';
                }}
            >
                Sign Out
            </button>
          </div>
        </header>
        <main>
          <Dashboard stats={stats} />
          <EconomicIndicators />
          <PaymentForm onAdd={addPayment} />
          <HistoryList
            schedule={schedule}
            onDelete={deletePayment}
            onUpdate={updatePayment}
          />
        </main>
      </div>
    </UserPreferencesProvider>
  );
}
