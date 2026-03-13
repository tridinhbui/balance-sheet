export const ACCOUNTS = {
    assets: [
        { en: "Cash", vi: "Tiền mặt" }, { en: "Accounts Receivable", vi: "Phải thu KH" },
        { en: "Inventory", vi: "Hàng tồn kho" }, { en: "Supplies", vi: "Vật tư" },
        { en: "Prepaid Insurance", vi: "Bảo hiểm TT" }, { en: "Land", vi: "Đất đai" },
        { en: "Buildings", vi: "Nhà xưởng" }, { en: "Equipment", vi: "Thiết bị" },
        { en: "Vehicles", vi: "Xe cộ" }, { en: "Patents", vi: "Bằng sáng chế" },
        { en: "Trademarks", vi: "Nhãn hiệu" }, { en: "Copyrights", vi: "Bản quyền" },
        { en: "Goodwill", vi: "Lợi thế TM" }, { en: "Short-term Investments", vi: "Đầu tư NH" },
        { en: "Notes Receivable", vi: "Thương phiếu phải thu" }, { en: "Tools", vi: "Công cụ dụng cụ" },
        { en: "Furniture", vi: "Nội thất" }, { en: "Computer Software", vi: "Phần mềm" }
    ],
    liabilities: [
        { en: "Accounts Payable", vi: "Phải trả NB" }, { en: "Notes Payable", vi: "Thương phiếu phải trả" },
        { en: "Salaries Payable", vi: "Lương phải trả" }, { en: "Interest Payable", vi: "Lãi vay phải trả" },
        { en: "Taxes Payable", vi: "Thuế phải nộp" }, { en: "Unearned Revenue", vi: "Doanh thu chưa TH" },
        { en: "Bonds Payable", vi: "Trái phiếu" }, { en: "Mortgage Payable", vi: "Nợ thế chấp" },
        { en: "Warranty Liability", vi: "Dự phòng bảo hành" }, { en: "Bank Overdraft", vi: "Thấu chi ngân hàng" },
        { en: "Utilities Payable", vi: "Điện nước phải trả" }
    ],
    equity: [
        { en: "Common Stock", vi: "Cổ phiếu phổ thông" }, { en: "Retained Earnings", vi: "LN giữ lại" },
        { en: "Paid-in Capital", vi: "Vốn góp bổ sung" }, { en: "Treasury Stock", vi: "Cổ phiếu quỹ" },
        { en: "Preferred Stock", vi: "Cổ phiếu ưu đãi" }, { en: "Owner's Capital", vi: "Vốn chủ sở hữu" }
    ]
};

export type AccountItem = {
    id: string;
    en: string;
    vi: string;
    cat: 'assets' | 'liab' | 'equity';
    val: number;
};
