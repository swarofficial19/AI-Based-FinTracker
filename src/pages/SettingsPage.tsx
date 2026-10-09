import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { isMockMode, setMockModeOverride, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Server,
  Database,
  BrainCircuit,
  ShieldCheck,
  Check,
  RefreshCw,
  ExternalLink,
  Code,
  Radio,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateLocalProfile } = useAuth();
  const [mockMode, setMockMode] = useState<boolean>(isMockMode());
  const [backendUrl, setBackendUrl] = useState<string>(getApiBaseUrl());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Profile update form
  const [name, setName] = useState(user?.name ?? '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome ?? 0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(user?.monthlyExpenses ?? 0);
  const [currentSavings, setCurrentSavings] = useState(user?.currentSavings ?? 0);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setMonthlyIncome(user.monthlyIncome ?? 0);
      setMonthlyExpenses(user.monthlyExpenses ?? 0);
      setCurrentSavings(user.currentSavings ?? 0);
    }
  }, [user]);

  const handleToggleMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setMockMode(val);
    setMockModeOverride(val);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      }).catch(() => null);
      if (res && res.ok) {
        setTestStatus('SUCCESS: FastAPI backend connected and active!');
      } else {
        setTestStatus(
          `NOTICE: FastAPI backend at ${backendUrl} is currently offline. FinTracker is operating smoothly using the production mock adapter.`
        );
      }
    } catch {
      setTestStatus(
        `NOTICE: FastAPI backend is offline. Using local high-fidelity mock adapter.`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocalProfile({
      name,
      monthlyIncome,
      monthlyExpenses,
      currentSavings,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          System Architecture & Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend configuration, machine learning runtime specifications and PostgreSQL schema blueprint
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Configuration & Profile */}
        <div className="lg:col-span-6 space-y-6">
          {/* API Backend Toggle */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-600" />
                <span>FastAPI Service Connection</span>
              </div>
            }
            subtitle="Configure connection to the Python ML inference service"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Use Mock API Adapter (Models 1, 4, 5)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Toggle development adapter for Models 1, 4, 5. Models 2 & 3 always communicate directly with the real FastAPI backend.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mockMode}
                    onChange={handleToggleMock}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  VITE_API_BASE_URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="https://showcase-jolly-series.ngrok-free.dev"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isTesting ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Radio className="h-3.5 w-3.5" />
                    )}
                    <span>Ping</span>
                  </button>
                </div>
              </div>

              {testStatus && (
                <div className="rounded-lg bg-slate-100 p-2.5 text-xs text-slate-700 font-mono leading-relaxed border border-slate-200">
                  {testStatus}
                </div>
              )}
            </div>
          </Card>

          {/* User Financial Baseline */}
          <Card
            title="User Profile & Baseline Metrics"
            subtitle="Core parameters used by the financial intelligence models"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Inflow (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Burn (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Database Blueprint & Architecture */}
        <div className="lg:col-span-6 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                <span>PostgreSQL Target Schema Blueprint</span>
              </div>
            }
            subtitle="Normalized relational tables prepared for production deployment"
          >
            <div className="rounded-lg bg-slate-900 p-3.5 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto space-y-2">
              <div className="text-emerald-400 font-bold">// PostgreSQL Relational Entities</div>
              <div>
                <span className="text-blue-400">TABLE</span> users (id UUID PK, email VARCHAR, name VARCHAR, created_at TIMESTAMPTZ);
              </div>
              <div>
                <span className="text-blue-400">TABLE</span> transactions (id UUID PK, user_id UUID FK, description TEXT, amount NUMERIC(12,2), type VARCHAR(10), category VARCHAR(50), date DATE, payment_method VARCHAR(30));
              </div>
              <div>
                <span className="text-blue-400">TABLE</span> financial_goals (id UUID PK, user_id UUID FK, name VARCHAR, target_amount NUMERIC, current_amount NUMERIC, target_date DATE);
              </div>
              <div>
                <span className="text-blue-400">TABLE</span> ai_predictions (id UUID PK, user_id UUID FK, model_name VARCHAR, input_features JSONB, prediction JSONB, created_at TIMESTAMPTZ);
              </div>
            </div>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-emerald-600" />
                <span>The 5 ML Models Architecture</span>
              </div>
            }
            subtitle="Strict boundary: scikit-learn models handle all predictions"
          >
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">1. Expense Categorization:</strong>
                  <p className="text-[11px] text-slate-500 font-mono">TF-IDF Vectorizer + Logistic Regression</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                  Multi-Class
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">2. Spending Prediction:</strong>
                  <p className="text-[11px] text-slate-500 font-mono">Extra Trees Regressor</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                  Regression
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">3. Financial Well-Being:</strong>
                  <p className="text-[11px] text-slate-500 font-mono">Random Forest Classifier</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                  Classifier
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">4. Banking Intent:</strong>
                  <p className="text-[11px] text-slate-500 font-mono">TF-IDF + Linear SVM (BANKING77)</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                  77 Classes
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">5. Investment Risk:</strong>
                  <p className="text-[11px] text-slate-500 font-mono">Random Forest Regressor (Score 1-7)</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                  Regressor
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
