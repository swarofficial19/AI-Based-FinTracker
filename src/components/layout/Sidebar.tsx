import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  BrainCircuit,
  HeartPulse,
  ShieldCheck,
  Target,
  MessageSquareCode,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'spending-prediction'
  | 'ai-insights'
  | 'wellbeing'
  | 'advisor'
  | 'goals'
  | 'assistant'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'spending-prediction', label: 'Spending Prediction', icon: TrendingUp },
    { id: 'ai-insights', label: 'AI Models & Insights', icon: BrainCircuit, badge: '5 ML Models' },
    { id: 'wellbeing', label: 'Financial Well-Being', icon: HeartPulse },
    { id: 'advisor', label: 'Investment Advisor', icon: ShieldCheck },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquareCode, badge: 'BANKING77' },
    { id: 'settings', label: 'Settings & Architecture', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-68 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">FinTracker</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Financial Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-600">
            FINANCIAL COMMAND
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="text-[10px] text-slate-600 font-medium tracking-tight">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* ML Architecture Note */}
        <div className="mx-3 my-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold text-slate-800">5 ML Models Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            TF-IDF · Extra Trees · Random Forest · Linear SVM (BANKING77).
          </p>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="shrink-0 border-t border-slate-100 p-3 bg-white">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NU'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {user?.name || 'New User'}
                </p>
                <p className="truncate text-[11px] text-slate-600">{user?.email || 'user@fintracker.ai'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
