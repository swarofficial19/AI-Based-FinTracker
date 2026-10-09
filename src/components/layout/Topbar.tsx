import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopbarProps {
  activeTab: NavTab;
  onOpenMobile: () => void;
  onOpenAddTx: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Dashboard',
    subtitle: 'Consolidated accounts, spending velocity and monthly metrics',
  },
  transactions: {
    title: 'Transaction Ledger',
    subtitle: 'Manage and categorize financial ledger entries with ML assistance',
  },
  analytics: {
    title: 'Financial Analytics',
    subtitle: 'Multi-quarter income, expenditure dynamics, and category distributions',
  },
  'spending-prediction': {
    title: 'Spending Prediction',
    subtitle: 'Model 2 Extra Trees Regressor forecasting upcoming month expenditure from past 4 months',
  },
  'ai-insights': {
    title: 'AI Models & Intelligence',
    subtitle: 'Transparent inspection of the 5 custom-trained scikit-learn models',
  },
  wellbeing: {
    title: 'Financial Well-Being Index',
    subtitle: 'Random Forest multi-class financial resilience evaluation',
  },
  advisor: {
    title: 'Investment Advisory',
    subtitle: 'Random Forest risk regression & constraint-governed asset allocation',
  },
  goals: {
    title: 'Financial Goals Tracker',
    subtitle: 'Milestone tracking with target completion velocity modeling',
  },
  assistant: {
    title: 'Banking AI Assistant',
    subtitle: 'BANKING77 Intent Model (TF-IDF + Linear SVM) query resolution',
  },
  settings: {
    title: 'System Settings & Architecture',
    subtitle: 'FastAPI REST backend configuration & technical specifications',
  },
};

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onOpenMobile,
  onOpenAddTx,
}) => {
  const meta = TAB_TITLES[activeTab] || {
    title: 'Dashboard',
    subtitle: 'Personal Finance Command Center',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      {/* Left zone: Mobile toggle & Breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight sm:text-base">
              {meta.title}
            </h1>
            <span className="hidden sm:inline-block text-slate-300">/</span>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-normal">
              {meta.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right zone: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTx}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-700 transition-colors whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="System notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>
      </div>
    </header>
  );
};
