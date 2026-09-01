export interface SellerValueBreakdown {
  brandName?: string;
  categoryName?: string;
  totalValue: number;
}

export interface SellerTopClient {
  clientCode: string;
  clientName: string;
  totalValue: number;
}

export interface SellerTopProduct {
  productCode: string;
  productName: string;
  quantity: number;
  totalValue: number;
}

export interface SellerDashboard {
  sellerId: string;
  sellerName: string;
  sellerType: string;
  employeeCode: string | null;
  invoiceSellerCode: string | null;
  sellerDocumentId: string;
  currentMonthSales: number;
  monthlyGoal: number;
  yearAverageTicket: number;
  yearSalesCount: number;
  yearTotalSales: number;
  salesByBrand: Array<SellerValueBreakdown & { brandName: string }>;
  salesByCategory: Array<SellerValueBreakdown & { categoryName: string }>;
  topClients: SellerTopClient[];
  topProducts: SellerTopProduct[];
}
