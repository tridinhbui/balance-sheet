// Sub-categories: Assets = Current + Fixed | Liabilities = Current + Long-term | Equity
// 100 accounts total

export const ACCOUNTS = {
  currentAssets: [
    { en: "Cash", vi: "Tiền mặt" },
    { en: "Cash equivalents", vi: "Tương đương tiền" },
    { en: "Accounts receivable", vi: "Phải thu khách hàng" },
    { en: "Inventory", vi: "Hàng tồn kho" },
    { en: "Prepaid expenses", vi: "Chi phí trả trước" },
    { en: "Supplies", vi: "Vật tư" },
    { en: "Short-term investments", vi: "Đầu tư ngắn hạn" },
    { en: "Notes receivable", vi: "Phải thu theo khế ước" },
    { en: "Marketable securities", vi: "Chứng khoán khả mại" },
    { en: "Petty cash", vi: "Quỹ tiền mặt nhỏ" },
    { en: "Bank deposits", vi: "Tiền gửi ngân hàng" },
    { en: "Trade receivables", vi: "Phải thu thương mại" },
    { en: "Other receivables", vi: "Phải thu khác" },
    { en: "Prepaid insurance", vi: "Bảo hiểm trả trước" },
    { en: "Prepaid rent", vi: "Tiền thuê trả trước" },
    { en: "Advance to suppliers", vi: "Tạm ứng người bán" },
    { en: "Raw materials", vi: "Nguyên vật liệu" },
    { en: "Work in progress", vi: "Sản phẩm dở dang" },
    { en: "Finished goods", vi: "Thành phẩm" },
    { en: "Merchandise inventory", vi: "Hàng hóa tồn kho" },
  ],
  fixedAssets: [
    { en: "Land", vi: "Đất đai" },
    { en: "Buildings", vi: "Nhà xưởng" },
    { en: "Equipment", vi: "Máy móc thiết bị" },
    { en: "Vehicles", vi: "Phương tiện vận tải" },
    { en: "Furniture", vi: "Nội thất" },
    { en: "Accumulated depreciation", vi: "Hao mòn lũy kế" },
    { en: "Intangible assets", vi: "Tài sản vô hình" },
    { en: "Patents", vi: "Bằng sáng chế" },
    { en: "Trademarks", vi: "Thương hiệu" },
    { en: "Goodwill", vi: "Lợi thế thương mại" },
    { en: "Leasehold improvements", vi: "Cải tạo thuê tài sản" },
    { en: "Computer equipment", vi: "Thiết bị máy tính" },
    { en: "Machinery", vi: "Máy móc" },
    { en: "Office equipment", vi: "Thiết bị văn phòng" },
    { en: "Copyrights", vi: "Bản quyền" },
    { en: "Franchise", vi: "Quyền nhượng quyền" },
    { en: "Software", vi: "Phần mềm" },
    { en: "Land improvements", vi: "Cải tạo đất" },
    { en: "Construction in progress", vi: "Xây dựng cơ bản dở dang" },
    { en: "Investment property", vi: "Bất động sản đầu tư" },
    { en: "Natural resources", vi: "Tài nguyên thiên nhiên" },
    { en: "Mineral rights", vi: "Quyền khai thác khoáng sản" },
    { en: "Art and collectibles", vi: "Tác phẩm nghệ thuật" },
    { en: "Long-term investments", vi: "Đầu tư dài hạn" },
  ],
  currentLiab: [
    { en: "Accounts payable", vi: "Phải trả người bán" },
    { en: "Accrued expenses", vi: "Chi phí phải trả" },
    { en: "Wages payable", vi: "Lương phải trả" },
    { en: "Interest payable", vi: "Lãi vay phải trả" },
    { en: "Taxes payable", vi: "Thuế phải nộp" },
    { en: "Notes payable", vi: "Vay ngắn hạn" },
    { en: "Short-term debt", vi: "Nợ ngắn hạn" },
    { en: "Unearned revenue", vi: "Doanh thu chưa thực hiện" },
    { en: "Current portion of long-term debt", vi: "Phần nợ dài hạn đến hạn" },
    { en: "Dividends payable", vi: "Cổ tức phải trả" },
    { en: "Salaries payable", vi: "Lương phải trả" },
    { en: "Utilities payable", vi: "Điện nước phải trả" },
    { en: "Rent payable", vi: "Tiền thuê phải trả" },
    { en: "Insurance payable", vi: "Bảo hiểm phải trả" },
    { en: "Customer deposits", vi: "Tiền đặt cọc khách hàng" },
    { en: "Bank overdraft", vi: "Thấu chi ngân hàng" },
    { en: "Warranty liability", vi: "Dự phòng bảo hành" },
    { en: "Income tax payable", vi: "Thuế TNDN phải nộp" },
    { en: "Sales tax payable", vi: "Thuế GTGT phải nộp" },
    { en: "Payroll taxes payable", vi: "Thuế BHXH phải trả" },
    { en: "Short-term borrowings", vi: "Vay ngắn hạn" },
    { en: "Accrued interest", vi: "Lãi vay phải trả tích lũy" },
  ],
  longTermLiab: [
    { en: "Long-term debt", vi: "Nợ dài hạn" },
    { en: "Bonds payable", vi: "Trái phiếu phải trả" },
    { en: "Mortgage payable", vi: "Nợ thế chấp" },
    { en: "Deferred tax liability", vi: "Thuế thu nhập hoãn lại phải trả" },
    { en: "Pension obligation", vi: "Nghĩa vụ lương hưu" },
    { en: "Lease liability", vi: "Nợ thuê tài sản" },
    { en: "Debentures payable", vi: "Trái phiếu công ty" },
    { en: "Loans payable", vi: "Khoản vay phải trả" },
    { en: "Deferred revenue", vi: "Doanh thu hoãn lại" },
    { en: "Post-employment benefits", vi: "Phúc lợi sau nghỉ hưu" },
    { en: "Asset retirement obligation", vi: "Nghĩa vụ thanh lý tài sản" },
    { en: "Convertible bonds", vi: "Trái phiếu chuyển đổi" },
    { en: "Subordinated debt", vi: "Nợ thứ cấp" },
    { en: "Term loan", vi: "Khoản vay có kỳ hạn" },
  ],
  equityCapital: [
    { en: "Common stock", vi: "Cổ phiếu phổ thông" },
    { en: "Preferred stock", vi: "Cổ phiếu ưu đãi" },
    { en: "Paid-in capital", vi: "Thặng dư vốn cổ phần" },
    { en: "Treasury stock", vi: "Cổ phiếu quỹ" },
    { en: "Owner's capital", vi: "Vốn chủ sở hữu" },
    { en: "Additional paid-in capital", vi: "Vốn góp bổ sung" },
    { en: "Share premium", vi: "Thặng dư phát hành" },
    { en: "Partnership capital", vi: "Vốn góp hợp danh" },
    { en: "Donated capital", vi: "Vốn được tài trợ" },
    { en: "Contributed surplus", vi: "Thặng dư đóng góp" },
  ],
  equityRetained: [
    { en: "Retained earnings", vi: "Lợi nhuận giữ lại" },
    { en: "Owner's drawings", vi: "Rút vốn" },
    { en: "Accumulated other comprehensive income", vi: "LN toàn diện khác lũy kế" },
    { en: "Capital reserve", vi: "Quỹ dự trữ vốn" },
    { en: "Legal reserve", vi: "Quỹ dự phòng pháp định" },
    { en: "Revaluation surplus", vi: "Thặng dư đánh giá lại" },
    { en: "Appropriated retained earnings", vi: "LN giữ lại đã phân bổ" },
    { en: "Unappropriated retained earnings", vi: "LN giữ lại chưa phân bổ" },
    { en: "Reserves", vi: "Các quỹ dự trữ" },
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
  vi: string;
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
