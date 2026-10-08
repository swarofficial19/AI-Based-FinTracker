import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SpendingPredictionPage } from './pages/SpendingPredictionPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { WellbeingPage } from './pages/WellbeingPage';
import { InvestmentAdvisorPage } from './pages/InvestmentAdvisorPage';
import { GoalsPage } from './pages/GoalsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            onOpenAddTx={() => setIsAddTxOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            isAddModalOpen={isAddTxOpen}
            setIsAddModalOpen={setIsAddTxOpen}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'spending-prediction':
        return <SpendingPredictionPage />;
      case 'ai-insights':
        return <AiInsightsPage />;
      case 'wellbeing':
        return <WellbeingPage />;
      case 'advisor':
        return <InvestmentAdvisorPage />;
      case 'goals':
        return <GoalsPage />;
      case 'assistant':
        return <AiAssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            onOpenAddTx={() => setIsAddTxOpen(true)}
          />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenAddTx={() => setIsAddTxOpen(true)}
    >
      {renderActivePage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
