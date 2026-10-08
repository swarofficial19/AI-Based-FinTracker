import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Topbar } from './Topbar';
import { LayoutDashboard, ReceiptText, BrainCircuit, ShieldCheck, MessageSquareCode } from 'lucide-react';

interface LayoutProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAddTx: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTx,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Persistent Sidebar (Desktop) + Slide-over Drawer (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          activeTab={activeTab}
          onOpenMobile={() => setIsOpenMobile(true)}
          onOpenAddTx={onOpenAddTx}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for quick thumb navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-xs lg:hidden">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <ReceiptText className="h-4 w-4" />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-insights')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'ai-insights' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>ML Models</span>
        </button>

        <button
          onClick={() => setActiveTab('advisor')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'advisor' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'assistant' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <MessageSquareCode className="h-4 w-4" />
          <span>Assistant</span>
        </button>
      </nav>
    </div>
  );
};
