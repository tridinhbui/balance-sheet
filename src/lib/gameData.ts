// Sub-categories: Assets = Current + Fixed | Liabilities = Current + Long-term | Equity
// 100 accounts total

export const ACCOUNTS = {
  currentAssets: [
    { en: "Cash" },
    { en: "Cash equivalents" },
    { en: "Accounts receivable" },
    { en: "Inventory" },
    { en: "Prepaid expenses" },
    { en: "Supplies" },
    { en: "Short-term investments" },
    { en: "Notes receivable" },
    { en: "Marketable securities" },
    { en: "Petty cash" },
    { en: "Bank deposits" },
    { en: "Trade receivables" },
    { en: "Other receivables" },
    { en: "Prepaid insurance" },
    { en: "Prepaid rent" },
    { en: "Advance to suppliers" },
    { en: "Raw materials" },
    { en: "Work in progress" },
    { en: "Finished goods" },
    { en: "Merchandise inventory" },
  ],
  fixedAssets: [
    { en: "Land" },
    { en: "Buildings" },
    { en: "Equipment" },
    { en: "Vehicles" },
    { en: "Furniture" },
    { en: "Accumulated depreciation" },
    { en: "Intangible assets" },
    { en: "Patents" },
    { en: "Trademarks" },
    { en: "Goodwill" },
    { en: "Leasehold improvements" },
    { en: "Computer equipment" },
    { en: "Machinery" },
    { en: "Office equipment" },
    { en: "Copyrights" },
    { en: "Franchise" },
    { en: "Software" },
    { en: "Land improvements" },
    { en: "Construction in progress" },
    { en: "Investment property" },
    { en: "Natural resources" },
    { en: "Mineral rights" },
    { en: "Art and collectibles" },
    { en: "Long-term investments" },
  ],
  currentLiab: [
    { en: "Accounts payable" },
    { en: "Accrued expenses" },
    { en: "Wages payable" },
    { en: "Interest payable" },
    { en: "Taxes payable" },
    { en: "Notes payable" },
    { en: "Short-term debt" },
    { en: "Unearned revenue" },
    { en: "Current portion of long-term debt" },
    { en: "Dividends payable" },
    { en: "Salaries payable" },
    { en: "Utilities payable" },
    { en: "Rent payable" },
    { en: "Insurance payable" },
    { en: "Customer deposits" },
    { en: "Bank overdraft" },
    { en: "Warranty liability" },
    { en: "Income tax payable" },
    { en: "Sales tax payable" },
    { en: "Payroll taxes payable" },
    { en: "Short-term borrowings" },
    { en: "Accrued interest" },
  ],
  longTermLiab: [
    { en: "Long-term debt" },
    { en: "Bonds payable" },
    { en: "Mortgage payable" },
    { en: "Deferred tax liability" },
    { en: "Pension obligation" },
    { en: "Lease liability" },
    { en: "Debentures payable" },
    { en: "Loans payable" },
    { en: "Deferred revenue" },
    { en: "Post-employment benefits" },
    { en: "Asset retirement obligation" },
    { en: "Convertible bonds" },
    { en: "Subordinated debt" },
    { en: "Term loan" },
  ],
  equityCapital: [
    { en: "Common stock" },
    { en: "Preferred stock" },
    { en: "Paid-in capital" },
    { en: "Treasury stock" },
    { en: "Owner's capital" },
    { en: "Additional paid-in capital" },
    { en: "Share premium" },
    { en: "Partnership capital" },
    { en: "Donated capital" },
    { en: "Contributed surplus" },
  ],
  equityRetained: [
    { en: "Retained earnings" },
    { en: "Owner's drawings" },
    { en: "Accumulated other comprehensive income" },
    { en: "Capital reserve" },
    { en: "Legal reserve" },
    { en: "Revaluation surplus" },
    { en: "Appropriated retained earnings" },
    { en: "Unappropriated retained earnings" },
    { en: "Reserves" },
  ],
};

export type AccountCategory = 'currentAssets' | 'fixedAssets' | 'currentLiab' | 'longTermLiab' | 'equityCapital' | 'equityRetained';

export const CATEGORY_CARD_STYLE: Record<AccountCategory, { border: string; bg: string; accent: string }> = {
  currentAssets: { border: 'border-l-4 border-l-blue-500', bg: 'bg-blue-50/50', accent: 'text-blue-600' },
  fixedAssets: { border: 'border-l-4 border-l-indigo-500', bg: 'bg-indigo-50/50', accent: 'text-indigo-600' },
  currentLiab: { border: 'border-l-4 border-l-orange-500', bg: 'bg-orange-50/50', accent: 'text-orange-600' },
  longTermLiab: { border: 'border-l-4 border-l-amber-600', bg: 'bg-amber-50/50', accent: 'text-amber-700' },
  equityCapital: { border: 'border-l-4 border-l-emerald-500', bg: 'bg-emerald-50/50', accent: 'text-emerald-600' },
  equityRetained: { border: 'border-l-4 border-l-teal-500', bg: 'bg-teal-50/50', accent: 'text-teal-600' },
};

export const MAX_LEVEL = 20;
export const BOSS_NAMES: Record<number, string> = {
  1: 'Slime', 2: 'Goblin', 3: 'Skeleton', 4: 'Orc', 5: 'Troll',
  6: 'Minotaur', 7: 'Hydra', 8: 'Phoenix', 9: 'Dragon', 10: 'Demon',
  11: 'Titan', 12: 'Behemoth', 13: 'Leviathan', 14: 'Cerberus', 15: 'Chimera',
  16: 'Kraken', 17: 'Fenrir', 18: 'Jormungandr', 19: 'Surtur', 20: 'Imbalance King',
};

export const BOSS_ICONS: Record<number, string> = {
  1: '🟢', 2: '👺', 3: '💀', 4: '👹', 5: '🧌',
  6: '🐂', 7: '🐉', 8: '🔥', 9: '🐲', 10: '😈',
  11: '⚡', 12: '🦣', 13: '🐋', 14: '🐕', 15: '🦁',
  16: '🦑', 17: '🐺', 18: '🐍', 19: '🔥', 20: '👑',
};

export const CATEGORY_EXPLANATIONS: Record<AccountCategory, { title: string; explain: string }> = {
  currentAssets: {
    title: "Current Assets",
    explain: "Assets convertible to cash within 1 year or one business cycle. Examples: cash, inventory, receivables.",
  },
  fixedAssets: {
    title: "Fixed Assets",
    explain: "Long-term assets (>1 year): land, buildings, machinery, intangible assets (patents, trademarks).",
  },
  currentLiab: {
    title: "Current Liabilities",
    explain: "Obligations due within 1 year: accounts payable, wages payable, short-term debt, taxes payable.",
  },
  longTermLiab: {
    title: "Long-term Liabilities",
    explain: "Obligations due after 1 year: long-term debt, bonds payable, mortgage, lease obligations.",
  },
  equityCapital: {
    title: "Equity - Capital",
    explain: "Owner/stockholder contributions: common stock, preferred stock, paid-in capital.",
  },
  equityRetained: {
    title: "Equity - Retained & Reserves",
    explain: "Retained earnings, reserves, revaluation surplus.",
  },
};

export type AccountItem = {
  id: string;
  en: string;
  cat: AccountCategory;
  val: number;
};

// Tips shown before each level (rotates by level index)
export const LEVEL_TIPS: string[] = [
  "Assets = what the company owns. Split into Current (short-term) and Fixed (long-term).",
  "Liabilities = what the company owes. Current = due within 1 year, Long-term = due after 1 year.",
  "Equity = owner's stake. Capital = contributed capital, Retained = earnings & reserves.",
  "Golden formula: Assets = Liabilities + Equity. The balance sheet always balances!",
  "Current Assets: cash, inventory, receivables... convertible to cash within 1 year.",
  "Fixed Assets: land, buildings, machinery, patents... used long-term (>1 year).",
  "Current Liabilities: accounts payable, wages, short-term debt... due within 1 year.",
  "Long-term Liabilities: long-term debt, bonds, mortgage... due after 1 year.",
  "Equity Capital: common stock, preferred stock, paid-in capital.",
  "Equity Retained: retained earnings, reserves, revaluation surplus.",
];

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<Difficulty, { time: number; lives: number; cardMultiplier: number }> = {
  easy: { time: 90, lives: 5, cardMultiplier: 0.7 },
  medium: { time: 120, lives: 3, cardMultiplier: 1 },
  hard: { time: 90, lives: 2, cardMultiplier: 1.3 },
};
