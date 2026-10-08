import { Transaction } from '../types';

export interface MonthlySpendingSummary {
  monthKey: string; // "YYYY-MM"
  label: string; // "Jun 26"
  fullMonthName: string; // "June 2026"
  totalSpending: number;
  transactionCount: number;
  categoryBreakdown?: Record<string, number>;
}

export interface SpendingPredictionHistoryResult {
  hasFourMonths: boolean;
  completeMonths: MonthlySpendingSummary[]; // Exactly the 4 most recent complete months in chronological order
  allCompleteMonths: MonthlySpendingSummary[];
  availableMonthsCount: number;
  missingMonthsCount: number;
  currentIncompleteMonth: {
    monthKey: string;
    label: string;
    fullMonthName: string;
    spendingSoFar: number;
    transactionCount: number;
  } | null;
  targetPredictedMonthLabel: string; // e.g. "October 2026"
  monthlySpendingArray: number[]; // [m1, m2, m3, m4]
}

/**
 * Returns the current year-month key in "YYYY-MM" format.
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a "YYYY-MM" key into a readable short label (e.g. "Jun 26")
 */
export function formatMonthShortLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, 1);
  return !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    : monthKey;
}

/**
 * Formats a "YYYY-MM" key into a readable full label (e.g. "June 2026")
 */
export function formatMonthFullLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, 1);
  return !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : monthKey;
}

/**
 * Extracts and groups expense transactions by month in chronological order.
 * If excludeCurrentMonth is true, omits the ongoing (incomplete) current month.
 */
export function extractMonthlySpending(
  transactions: Transaction[],
  excludeCurrentMonth = false
): MonthlySpendingSummary[] {
  const currentKey = getCurrentMonthKey();
  const monthMap = new Map<
    string,
    { total: number; count: number; categories: Record<string, number> }
  >();

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date) {
      const monthKey = tx.date.slice(0, 7); // "YYYY-MM"
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        if (excludeCurrentMonth && monthKey >= currentKey) {
          continue;
        }
        const existing = monthMap.get(monthKey) || {
          total: 0,
          count: 0,
          categories: {},
        };
        existing.total += tx.amount;
        existing.count += 1;
        const cat = tx.category || 'Miscellaneous';
        existing.categories[cat] = (existing.categories[cat] || 0) + tx.amount;
        monthMap.set(monthKey, existing);
      }
    }
  }

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  return sortedMonthKeys.map((key) => {
    const data = monthMap.get(key)!;
    return {
      monthKey: key,
      label: formatMonthShortLabel(key),
      fullMonthName: formatMonthFullLabel(key),
      totalSpending: Math.round(data.total),
      transactionCount: data.count,
      categoryBreakdown: data.categories,
    };
  });
}

/**
 * Specifically dynamically extracts the four most recent COMPLETE months
 * from the user's transaction ledger, excluding the current incomplete month.
 * The order is guaranteed chronological: Oldest → Newest.
 */
export function getFourMostRecentCompleteMonths(
  transactions: Transaction[]
): SpendingPredictionHistoryResult {
  const currentKey = getCurrentMonthKey();

  // 1. Gather all expense transactions grouped by month
  const allMonths = extractMonthlySpending(transactions, false);

  // 2. Identify the ongoing incomplete month if present
  const currentMonthData = allMonths.find((m) => m.monthKey === currentKey);
  const currentIncompleteMonth = currentMonthData
    ? {
        monthKey: currentMonthData.monthKey,
        label: currentMonthData.label,
        fullMonthName: currentMonthData.fullMonthName,
        spendingSoFar: currentMonthData.totalSpending,
        transactionCount: currentMonthData.transactionCount,
      }
    : null;

  // 3. Filter only completed months (strictly before current month)
  const allCompleteMonths = allMonths.filter((m) => m.monthKey < currentKey);

  // 4. Determine target predicted month (the current or upcoming month)
  const targetPredictedMonthLabel = formatMonthFullLabel(currentKey);

  // 5. Check if at least 4 complete months exist
  const availableMonthsCount = allCompleteMonths.length;
  const hasFourMonths = availableMonthsCount >= 4;
  const missingMonthsCount = Math.max(0, 4 - availableMonthsCount);

  // Take the 4 most recent complete months in chronological order (Oldest → Newest)
  const completeMonths = hasFourMonths
    ? allCompleteMonths.slice(-4)
    : allCompleteMonths;

  const monthlySpendingArray = completeMonths.map((m) => m.totalSpending);

  return {
    hasFourMonths,
    completeMonths,
    allCompleteMonths,
    availableMonthsCount,
    missingMonthsCount,
    currentIncompleteMonth,
    targetPredictedMonthLabel,
    monthlySpendingArray,
  };
}

/**
 * Realistic 4-month historical transaction dataset matching the specification:
 * June 2026: ₹32,500
 * July 2026: ₹36,200
 * August 2026: ₹34,800
 * September 2026: ₹39,100
 * (Target next-month prediction for October 2026: ₹38,925.74)
 */
export const SAMPLE_4_MONTH_TRANSACTIONS: Transaction[] = [
  // --- JUNE 2026: Total ₹32,500 ---
  {
    id: 'sample_tx_jun_01',
    userId: 'usr_fintracker_demo',
    description: 'Fresh Mart Grocery & Provisions',
    amount: 11200,
    type: 'expense',
    category: 'Groceries',
    date: '2026-06-05',
    paymentMethod: 'UPI',
    notes: 'Monthly staples and household pantry',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jun_02',
    userId: 'usr_fintracker_demo',
    description: 'Electricity & High-speed Broadband Bill',
    amount: 4800,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-06-12',
    paymentMethod: 'Net Banking',
    notes: 'Quarterly utilities',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jun_03',
    userId: 'usr_fintracker_demo',
    description: 'Weekend Dining & Family Dinner',
    amount: 4500,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-18',
    paymentMethod: 'Credit Card',
    notes: 'Family gathering',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jun_04',
    userId: 'usr_fintracker_demo',
    description: 'Fuel & Metro Smart Card Recharge',
    amount: 3200,
    type: 'expense',
    category: 'Transportation',
    date: '2026-06-22',
    paymentMethod: 'UPI',
    notes: 'Daily office commute',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jun_05',
    userId: 'usr_fintracker_demo',
    description: 'Summer Apparel & Footwear',
    amount: 6800,
    type: 'expense',
    category: 'Shopping',
    date: '2026-06-28',
    paymentMethod: 'Credit Card',
    notes: 'Seasonal wardrobe refresh',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jun_06',
    userId: 'usr_fintracker_demo',
    description: 'Streaming & Cloud Subscriptions',
    amount: 2000,
    type: 'expense',
    category: 'Subscriptions',
    date: '2026-06-30',
    paymentMethod: 'Credit Card',
    notes: 'Digital tools',
    isAiCategorized: true,
  },

  // --- JULY 2026: Total ₹36,200 ---
  {
    id: 'sample_tx_jul_01',
    userId: 'usr_fintracker_demo',
    description: 'Wholesale Supermarket Pantry',
    amount: 12400,
    type: 'expense',
    category: 'Groceries',
    date: '2026-07-04',
    paymentMethod: 'UPI',
    notes: 'Monthly bulk groceries',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jul_02',
    userId: 'usr_fintracker_demo',
    description: 'Tata Power Electricity & Gas Clearance',
    amount: 5100,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-07-10',
    paymentMethod: 'Net Banking',
    notes: 'Summer AC power billing',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jul_03',
    userId: 'usr_fintracker_demo',
    description: 'Monsoon Weekend Getaway Stay',
    amount: 7200,
    type: 'expense',
    category: 'Travel',
    date: '2026-07-16',
    paymentMethod: 'Credit Card',
    notes: 'Outstation weekend trip',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jul_04',
    userId: 'usr_fintracker_demo',
    description: 'Team Dinner & Gourmet Dining',
    amount: 4800,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-07-22',
    paymentMethod: 'UPI',
    notes: 'Social dinner',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jul_05',
    userId: 'usr_fintracker_demo',
    description: 'Electronics & Audio Accessories',
    amount: 4700,
    type: 'expense',
    category: 'Shopping',
    date: '2026-07-27',
    paymentMethod: 'Credit Card',
    notes: 'Noise-canceling earphones',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_jul_06',
    userId: 'usr_fintracker_demo',
    description: 'Vehicle Maintenance & Fuel',
    amount: 2000,
    type: 'expense',
    category: 'Transportation',
    date: '2026-07-30',
    paymentMethod: 'UPI',
    notes: 'Routine service inspection',
    isAiCategorized: true,
  },

  // --- AUGUST 2026: Total ₹34,800 ---
  {
    id: 'sample_tx_aug_01',
    userId: 'usr_fintracker_demo',
    description: 'Organic Groceries & Dairy Supplies',
    amount: 11900,
    type: 'expense',
    category: 'Groceries',
    date: '2026-08-05',
    paymentMethod: 'UPI',
    notes: 'Farm-fresh groceries',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_aug_02',
    userId: 'usr_fintracker_demo',
    description: 'Broadband & Water Utility Clearance',
    amount: 4600,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-08-11',
    paymentMethod: 'Net Banking',
    notes: 'Fiber net clearance',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_aug_03',
    userId: 'usr_fintracker_demo',
    description: 'Festive Shopping & Gifts',
    amount: 8500,
    type: 'expense',
    category: 'Shopping',
    date: '2026-08-18',
    paymentMethod: 'Credit Card',
    notes: 'Raksha Bandhan & festive items',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_aug_04',
    userId: 'usr_fintracker_demo',
    description: 'Cafe Visits & Weekend Brunches',
    amount: 3800,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-08-23',
    paymentMethod: 'UPI',
    notes: 'Weekend outings',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_aug_05',
    userId: 'usr_fintracker_demo',
    description: 'Fuel Station Full Tank & Tolls',
    amount: 3500,
    type: 'expense',
    category: 'Transportation',
    date: '2026-08-28',
    paymentMethod: 'UPI',
    notes: 'Highway travel tolls',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_aug_06',
    userId: 'usr_fintracker_demo',
    description: 'Quarterly Cloud Backup & Media',
    amount: 2500,
    type: 'expense',
    category: 'Subscriptions',
    date: '2026-08-30',
    paymentMethod: 'Credit Card',
    notes: 'Storage subscription',
    isAiCategorized: true,
  },

  // --- SEPTEMBER 2026: Total ₹39,100 ---
  {
    id: 'sample_tx_sep_01',
    userId: 'usr_fintracker_demo',
    description: 'BigBasket Monthly Provisions & Fresh Foods',
    amount: 13200,
    type: 'expense',
    category: 'Groceries',
    date: '2026-09-04',
    paymentMethod: 'UPI',
    notes: 'Monthly staples',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_sep_02',
    userId: 'usr_fintracker_demo',
    description: 'IndiGo Flight Tickets for Conference',
    amount: 7800,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-10',
    paymentMethod: 'Credit Card',
    notes: 'Annual tech summit travel',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_sep_03',
    userId: 'usr_fintracker_demo',
    description: 'Festive Season Electronics & Decor',
    amount: 8200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-16',
    paymentMethod: 'Credit Card',
    notes: 'Diwali preparations and gadgets',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_sep_04',
    userId: 'usr_fintracker_demo',
    description: 'Electricity & Gas Utility Clearance',
    amount: 4100,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-09-22',
    paymentMethod: 'Net Banking',
    notes: 'Monthly utility settlement',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_sep_05',
    userId: 'usr_fintracker_demo',
    description: 'Swiggy & Fine Dining Celebrations',
    amount: 3600,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-09-26',
    paymentMethod: 'UPI',
    notes: 'Celebratory dinner',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_sep_06',
    userId: 'usr_fintracker_demo',
    description: 'Commute, Metro & Fuel Expenses',
    amount: 2200,
    type: 'expense',
    category: 'Transportation',
    date: '2026-09-29',
    paymentMethod: 'UPI',
    notes: 'Urban mobility recharge',
    isAiCategorized: true,
  },

  // --- OCTOBER 2026 (Ongoing incomplete month) ---
  {
    id: 'sample_tx_oct_01',
    userId: 'usr_fintracker_demo',
    description: 'Supermarket Grocery Restock',
    amount: 2450,
    type: 'expense',
    category: 'Groceries',
    date: '2026-10-02',
    paymentMethod: 'UPI',
    notes: 'Weekly greens',
    isAiCategorized: true,
  },
  {
    id: 'sample_tx_oct_02',
    userId: 'usr_fintracker_demo',
    description: 'Coffee & Breakfast Cafe',
    amount: 550,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-04',
    paymentMethod: 'UPI',
    notes: 'Quick breakfast',
    isAiCategorized: true,
  },
];

