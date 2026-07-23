import api from './client';

export type InvoiceType = 'PATIENT_SALE' | 'INSURANCE_CLAIM' | 'WHOLESALE_CREDIT' | 'SUPPLIER_BILL';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'INSURANCE' | 'BANK_TRANSFER';
export type ExpenseCategory = 'UTILITIES' | 'RENT' | 'SALARIES' | 'SUPPLIES' | 'MAINTENANCE' | 'OTHER';

export interface InvoiceItem {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  taxRate?: number;
  lineTotal: number;
}

export interface PaymentTransaction {
  id: string;
  transactionNo: string;
  invoiceId?: string;
  saleId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  customerId?: string;
  customer?: { id: string; name: string; phone?: string; email?: string };
  saleId?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms?: string;
  billingAddress?: string;
  taxId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  items: InvoiceItem[];
  payments?: PaymentTransaction[];
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  vendor?: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  expenseDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  salesRevenue: number;
  invoiceCollectedRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalExpenses: number;
  netOperatingIncome: number;
  accountsReceivable: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  unpaidInvoicesCount: number;
}

export const billingApi = {
  listInvoices: (params?: Record<string, string>) =>
    api.get('/billing/invoices', { params }).then(r => r.data),
  getInvoice: (id: string) => api.get(`/billing/invoices/${id}`).then(r => r.data),
  createInvoice: (data: Record<string, unknown>) => api.post('/billing/invoices', data).then(r => r.data),
  updateInvoiceStatus: (id: string, status: InvoiceStatus) =>
    api.patch(`/billing/invoices/${id}/status`, { status }).then(r => r.data),
  recordPayment: (id: string, data: Record<string, unknown>) =>
    api.post(`/billing/invoices/${id}/payments`, data).then(r => r.data),

  listExpenses: (params?: Record<string, string>) =>
    api.get('/billing/expenses', { params }).then(r => r.data),
  createExpense: (data: Record<string, unknown>) => api.post('/billing/expenses', data).then(r => r.data),
  updateExpense: (id: string, data: Record<string, unknown>) => api.patch(`/billing/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: string) => api.delete(`/billing/expenses/${id}`).then(r => r.data),

  getSummary: () => api.get('/billing/summary').then(r => r.data),
};
