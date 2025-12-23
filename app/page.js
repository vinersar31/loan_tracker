'use client';
import { useLoanData } from "@/hooks/useLoanData";
import Dashboard from "@/components/Dashboard";
import PaymentForm from "@/components/PaymentForm";
import HistoryList from "@/components/HistoryList";
import EconomicIndicators from "@/components/EconomicIndicators";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsPanel from "@/components/SettingsPanel";
import { UserPreferencesProvider } from "@/hooks/useUserPreferences";

export default function Home() {
  const { stats, schedule, addPayment, updatePayment, deletePayment } = useLoanData();

  return (
    <UserPreferencesProvider>
      <div className="app-container">
        <header>
          <h1>Mortgage Tracker</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle />
            <SettingsPanel />
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
