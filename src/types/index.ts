export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Subscriptions'
  | 'Travel'
  | 'Miscellaneous';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isAiCategorized?: boolean;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  emergencyFund: number;
  riskTolerance?: 'Conservative' | 'Moderate' | 'Aggressive';
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  balanceChangePct: number;
  incomeChangePct: number;
  expenseChangePct: number;
  savingsChangePct: number;
}

// ----------------------------------------
// ML API 1: Expense Categorization
// TF-IDF + Logistic Regression
// ----------------------------------------
export interface CategorizeExpenseRequest {
  description: string;
}

export interface CategorizeExpenseResponse {
  category: ExpenseCategory;
  confidence: number;
  model: 'TF-IDF + Logistic Regression';
  explanation?: string;
  enhanced_by_ai?: boolean;
}

// ----------------------------------------
// ML API 2: Spending Prediction
// Extra Trees Regressor
// ----------------------------------------
export interface PredictSpendingRequest {
  monthly_spending: number[];
}

export interface PredictSpendingResponse {
  predicted_next_month_spending: number;
  predicted_spending?: number;
  currency?: 'INR' | string;
  model?: 'Extra Trees Regressor' | string;
  trend_percentage?: number;
  explanation?: string;
  enhanced_by_ai?: boolean;
}

// ----------------------------------------
// ML API 3: Financial Well-Being
// Random Forest Classifier
// ----------------------------------------
export type WellbeingCategory =
  | 'Very Low'
  | 'Low'
  | 'Medium Low'
  | 'Medium High'
  | 'High'
  | 'Very High';

export interface FinancialWellbeingRequest {
  PPINCIMP: number;
  SAVINGSRANGES: number;
  ENDSMEET: number;
  ABSORBSHOCK: number;
  MATHARDSHIP_1: number;
  SAVEHABIT: number;
  GOALCONF: number;
  MANAGE1_2: number;
  MANAGE1_3: number;
  DISTRESS: number;
  ACT1_2: number;
  FS1_1: number;
  FS1_7: number;
  SWB_1: number;
  SWB_2: number;
  agecat: number;
  PPEDUC: number;
  PPHHSIZE: number;
  PPMARIT: number;
  EMPLOY: number;
  HHEDUC: number;
  KIDS_NoChildren: number;
  PPT18OV: number;
  PCTLT200FPL: number;
  RETIRE: number;
}

export interface FinancialWellbeingResponse {
  category: WellbeingCategory;
  confidence: number;
  model: 'Random Forest Classifier';
  explanation?: string;
  enhanced_by_ai?: boolean;
}

// ----------------------------------------
// ML API 4: BANKING77 Query Intent
// TF-IDF + Linear SVM
// ----------------------------------------
export interface BankingIntentRequest {
  query: string;
}

export interface BankingIntentResponse {
  intent: string;
  readable_intent: string;
  confidence: number;
  model: 'TF-IDF + Linear SVM (BANKING77)';
  suggested_action?: string;
  contextual_answer?: string;
  explanation?: string;
  enhanced_by_ai?: boolean;
}

// ----------------------------------------
// ML API 5: Investment Risk Model
// Random Forest Regressor
// ----------------------------------------
export interface InvestmentRiskRequest {
  age: number;
  income: number;
  expenses: number;
  savings: number;
  emergency_fund: number;
  investment_amount: number;
  goal: string;
  horizon_years: number;
  financial_profile?: Record<string, unknown>;
}

export interface InvestmentRiskResponse {
  risk_score: number; // 1.0 to 7.0
  risk_category: 'Conservative' | 'Moderate' | 'Aggressive';
  model: 'Random Forest Regressor';
  breakdown: {
    capacity_score: number;
    horizon_factor: number;
    stability_factor: number;
  };
  explanation?: string;
  enhanced_by_ai?: boolean;
}

// ----------------------------------------
// Unified AI Response Pipeline
// Section 6 Architecture
// ----------------------------------------
export interface UnifiedPipelineRequest {
  query: string;
  spending_history?: number[];
  recent_transactions?: Transaction[];
  detected_intent?: BankingIntentResponse;
}

export interface UnifiedPipelineResponse {
  query: string;
  answer: string;
  spendingVariance?: {
    previousMonth: number;
    currentMonth: number;
    difference: number;
    pctChange: number;
    topCategory?: string;
  };
  enhanced_by_ai: boolean;
}

// ----------------------------------------
// Investment Recommendation Engine
// (ML Risk Category + Rule-based constraints)
// ----------------------------------------
export interface RecommendedVehicle {
  id: string;
  category_name: string;
  asset_class: 'Equity' | 'Debt / Fixed Income' | 'Hybrid' | 'Commodities / Gold' | 'Cash / Liquid';
  percentage: number; // e.g. 25 (%)
  amount_inr: number; // e.g. 2500 (₹)
  risk_level: 'Low' | 'Moderate' | 'High';
  suitable_instruments: string[]; // e.g. ['Nifty 50 Index Fund', 'Nifty Next 50']
  rationale: string;
  horizon_fit: string;
  color: string;
}

export interface InvestmentRecommendationRequest {
  age: number;
  income: number;
  expenses: number;
  savings: number;
  emergency_fund: number;
  investment_amount: number;
  goal: string;
  horizon_years: number;
  risk_category: 'Conservative' | 'Moderate' | 'Aggressive';
  risk_score?: number;
}

export interface InvestmentAllocation {
  low_risk: number; // percentage (0-100)
  equity: number; // percentage (0-100)
  cash: number; // percentage (0-100)
}

export interface AssetClassAllocation {
  equity: number;
  debt_fixed_income: number;
  hybrid: number;
  gold: number;
  liquid_cash: number;
}

export interface AssetClassAmounts {
  equity_inr: number;
  debt_fixed_income_inr: number;
  hybrid_inr: number;
  gold_inr: number;
  liquid_cash_inr: number;
}

export interface InvestmentRecommendationResponse {
  recommended_investment: number;
  emergency_target: number;
  emergency_gap: number;
  emergency_months: number;
  emergency_status: 'Healthy' | 'Needs Attention' | 'Critical Reserve Gap';
  allocation: InvestmentAllocation;
  allocated_amounts: {
    low_risk_inr: number;
    equity_inr: number;
    cash_inr: number;
  };
  asset_class_allocation: AssetClassAllocation;
  asset_class_amounts: AssetClassAmounts;
  categories: RecommendedVehicle[];
  safety_adjustments_applied: string[];
  surplus_ratio: number;
  warning: string | null;
  explanation: string;
  enhanced_by_ai?: boolean;
}

// Assistant Chat message
export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intentData?: BankingIntentResponse;
  nlpSummary?: string;
}
