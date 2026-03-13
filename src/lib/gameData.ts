// Sub-categories: Assets = Current + Fixed | Liabilities = Current + Long-term | Equity

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
  ],
  longTermLiab: [
    { en: "Long-term debt", vi: "Nợ dài hạn" },
    { en: "Bonds payable", vi: "Trái phiếu phải trả" },
    { en: "Mortgage payable", vi: "Nợ thế chấp" },
    { en: "Deferred tax liability", vi: "Thuế thu nhập hoãn lại phải trả" },
    { en: "Pension obligation", vi: "Nghĩa vụ lương hưu" },
    { en: "Lease liability", vi: "Nợ thuê tài sản" },
  ],
  equity: [
    { en: "Common stock", vi: "Cổ phiếu phổ thông" },
    { en: "Preferred stock", vi: "Cổ phiếu ưu đãi" },
    { en: "Paid-in capital", vi: "Thặng dư vốn cổ phần" },
    { en: "Retained earnings", vi: "Lợi nhuận giữ lại" },
    { en: "Treasury stock", vi: "Cổ phiếu quỹ" },
    { en: "Owner's capital", vi: "Vốn chủ sở hữu" },
    { en: "Owner's drawings", vi: "Rút vốn" },
    { en: "Accumulated other comprehensive income", vi: "Lợi nhuận toàn diện khác lũy kế" },
  ],
};

export type AccountCategory = 'currentAssets' | 'fixedAssets' | 'currentLiab' | 'longTermLiab' | 'equity';

export type AccountItem = {
  id: string;
  en: string;
  vi: string;
  cat: AccountCategory;
  val: number;
};
