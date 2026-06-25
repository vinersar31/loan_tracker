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
import { Landmark, LogOut } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { stats, schedule, addPayment, updatePayment, deletePayment, uploadDocuments, deleteDocument } = useLoanData();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline/20 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <UserPreferencesProvider>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-2 shadow-glow">
              <Landmark className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-main">
                Mortgage Tracker
              </h1>
              <p className="text-xs text-secondary">
                Track your loan payments and progress
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SettingsPanel />
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger/10 px-3.5 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="mt-6 space-y-5">
          <Dashboard stats={stats} schedule={schedule} />
          <EconomicIndicators />
          <PaymentForm onAdd={addPayment} />
          <HistoryList
            schedule={schedule}
            onDelete={deletePayment}
            onUpdate={updatePayment}
            onUploadDocuments={uploadDocuments}
            onDeleteDocument={deleteDocument}
          />
        </main>

        <footer className="mt-10 pb-6 text-center text-xs text-dim">
          Loan Tracker · amounts in RON · data stored in your Firebase
        </footer>
      </div>
    </UserPreferencesProvider>
  );
}
