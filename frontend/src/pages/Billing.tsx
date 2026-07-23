import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText, Plus, Search, DollarSign, TrendingUp, TrendingDown,
  CreditCard, CheckCircle2, Clock, Printer, X, Loader2,
  PieChart, Building2, FileCheck, Layers, Edit, Trash2
} from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/ui/Badge';
import { billingApi } from '../api/billing';
import type { Invoice, Expense, FinancialSummary, InvoiceStatus, InvoiceType, PaymentMethod, ExpenseCategory } from '../api/billing';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import { customersApi } from '../api/customers';
import type { Customer } from '../api/customers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['UTILITIES', 'RENT', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'OTHER'];
const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'BANK_TRANSFER'];

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'new-invoice' | 'analytics' | 'expenses' | 'ar'>('invoices');

  // Summary State
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Selected Invoice Modal for View / Print / Pay
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'UTILITIES' as ExpenseCategory,
    title: '',
    amount: 0,
    vendor: '',
    paymentMethod: 'CASH' as PaymentMethod,
    referenceNo: '',
    notes: '',
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // New Invoice Builder State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newInvType, setNewInvType] = useState<InvoiceType>('PATIENT_SALE');
  const [newInvCustomerId, setNewInvCustomerId] = useState('');
  const [newInvDueDate, setNewInvDueDate] = useState(format(new Date(Date.now() + 14 * 86400000), 'yyyy-MM-dd'));
  const [newInvPaymentTerms, setNewInvPaymentTerms] = useState('Net 14');
  const [newInvAddress, setNewInvAddress] = useState('');
  const [newInvTaxId, setNewInvTaxId] = useState('');
  const [newInvNotes, setNewInvNotes] = useState('');
  const [newInvDiscount, setNewInvDiscount] = useState(0);
  const [newInvItems, setNewInvItems] = useState<Array<{
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    taxRate: number;
  }>>([
    { productId: '', description: '', quantity: 1, unitPrice: 0, costPrice: 0, taxRate: 0 }
  ]);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // Load Data Callbacks
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await billingApi.getSummary();
      setSummary(data);
    } catch {
      toast.error('Failed to load financial summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const params: Record<string, string> = {};
      if (invoiceSearch) params.search = invoiceSearch;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await billingApi.listInvoices(params);
      setInvoices(res.data || []);
    } catch {
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  }, [invoiceSearch, statusFilter, typeFilter]);

  const loadExpenses = useCallback(async () => {
    setExpensesLoading(true);
    try {
      const res = await billingApi.listExpenses();
      setExpenses(res.data || []);
    } catch {
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadInvoices();
    productsApi.list({ pageSize: '100' }).then(r => setProducts(r.data || [])).catch(() => {});
    customersApi.list({ pageSize: '100' }).then(r => setCustomers(r.data || [])).catch(() => {});
  }, [loadSummary, loadInvoices]);

  useEffect(() => {
    if (activeTab === 'expenses') loadExpenses();
  }, [activeTab, loadExpenses]);

  // Invoice Payment submit
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (payAmount <= 0) { toast.error('Please enter a valid amount'); return; }
    setSubmittingPay(true);
    try {
      const res = await billingApi.recordPayment(selectedInvoice.id, {
        amount: payAmount,
        paymentMethod: payMethod,
        transactionRef: payRef || undefined,
        notes: payNotes || undefined,
      });
      toast.success(`Payment of ETB ${payAmount.toFixed(2)} recorded`);
      setPayModalOpen(false);
      setSelectedInvoice(res.invoice);
      loadInvoices();
      loadSummary();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmittingPay(false);
    }
  };

  // Add / Edit Expense submit
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || expenseForm.amount <= 0) {
      toast.error('Please provide a valid title and amount');
      return;
    }
    setSubmittingExpense(true);
    try {
      if (editingExpenseId) {
        await billingApi.updateExpense(editingExpenseId, expenseForm);
        toast.success('Expense updated');
      } else {
        await billingApi.createExpense(expenseForm);
        toast.success('Expense recorded');
      }
      setAddExpenseOpen(false);
      setEditingExpenseId(null);
      setExpenseForm({ category: 'UTILITIES', title: '', amount: 0, vendor: '', paymentMethod: 'CASH', referenceNo: '', notes: '' });
      loadExpenses();
      loadSummary();
    } catch {
      toast.error(editingExpenseId ? 'Failed to update expense' : 'Failed to create expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense? This cannot be undone.')) return;
    setDeletingExpenseId(id);
    try {
      await billingApi.deleteExpense(id);
      toast.success('Expense deleted');
      loadExpenses();
      loadSummary();
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  // Open edit modal pre-filled
  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      category: exp.category,
      title: exp.title,
      amount: exp.amount,
      vendor: exp.vendor || '',
      paymentMethod: exp.paymentMethod,
      referenceNo: exp.referenceNo || '',
      notes: exp.notes || '',
    });
    setAddExpenseOpen(true);
  };

  // New Invoice Line Item handlers
  const handleItemProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    setNewInvItems(items => items.map((item, i) => {
      if (i !== index) return item;
      if (!prod) return { ...item, productId: '' };
      return {
        ...item,
        productId: prod.id,
        description: `${prod.name} (${prod.dosageForm} ${prod.strength || ''})`,
        unitPrice: prod.defaultSellingPrice,
        costPrice: prod.costPrice ?? prod.defaultCostPrice ?? 0,
        taxRate: prod.taxRate || 0,
      };
    }));
  };

  // Create Invoice submit
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newInvItems.some(i => !i.description || i.quantity <= 0)) {
      toast.error('Please ensure all items have descriptions and valid quantities');
      return;
    }
    setCreatingInvoice(true);
    try {
      const created = await billingApi.createInvoice({
        type: newInvType,
        customerId: newInvCustomerId || undefined,
        dueDate: newInvDueDate,
        paymentTerms: newInvPaymentTerms,
        billingAddress: newInvAddress || undefined,
        taxId: newInvTaxId || undefined,
        notes: newInvNotes || undefined,
        discountAmount: newInvDiscount,
        items: newInvItems,
      });
      toast.success(`Invoice ${created.invoiceNumber} issued successfully`);
      setActiveTab('invoices');
      loadInvoices();
      loadSummary();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setCreatingInvoice(false);
    }
  };

  // Calculations for Invoice Builder
  const invSubtotal = newInvItems.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const invTaxTotal = newInvItems.reduce((s, i) => s + (i.unitPrice * i.quantity * i.taxRate), 0);
  const invGrandTotal = Math.max(0, invSubtotal + invTaxTotal - newInvDiscount);
  const invCOGS = newInvItems.reduce((s, i) => s + (i.costPrice * i.quantity), 0);
  const invEstProfit = invGrandTotal - invCOGS;

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'PARTIALLY_PAID': return <Badge variant="warning">Partial</Badge>;
      case 'ISSUED': return <Badge variant="neutral">Issued</Badge>;
      case 'OVERDUE': return <Badge variant="danger">Overdue</Badge>;
      case 'CANCELLED': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh' }}>
      <TopBar
        title="Billing & Financials"
        subtitle="Manage patient & insurance billing, profit margins, accounts receivable, and expenses"
        actions={
          <button
            onClick={() => setActiveTab('new-invoice')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
            }}
          >
            <Plus size={14} /> Create Invoice
          </button>
        }
      />

      <div style={{ padding: '24px 28px' }}>

        {/* Financial KPI Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          {/* Total Revenue */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Revenue</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(15,110,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#0F6E5C" />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif" }}>
              {summaryLoading ? '…' : `ETB ${(summary?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
              POS: ETB {(summary?.salesRevenue || 0).toFixed(0)} · Invoices: ETB {(summary?.invoiceCollectedRevenue || 0).toFixed(0)}
            </div>
          </div>

          {/* Cost of Goods Sold (COGS) */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Cost of Goods (COGS)</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={16} color="#64748B" />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>
              {summaryLoading ? '…' : `ETB ${(summary?.totalCOGS || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Inventory purchase cost</div>
          </div>

          {/* Gross Operating Profit */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Gross Profit</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#10B981" />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F6E5C', fontFamily: "'Space Grotesk', sans-serif" }}>
              {summaryLoading ? '…' : `ETB ${(summary?.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>
              Margin: {summary?.grossProfitMargin || 0}%
            </div>
          </div>

          {/* Accounts Receivable (AR) */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Accounts Receivable</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(193,122,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#C17A1F" />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C17A1F', fontFamily: "'Space Grotesk', sans-serif" }}>
              {summaryLoading ? '…' : `ETB ${(summary?.accountsReceivable || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
              {summary?.unpaidInvoicesCount || 0} unpaid invoices
            </div>
          </div>

          {/* Net Income */}
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Net Operating Profit</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart size={16} color="#0EA5E9" />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0EA5E9', fontFamily: "'Space Grotesk', sans-serif" }}>
              {summaryLoading ? '…' : `ETB ${(summary?.netOperatingIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
              Expenses: ETB {(summary?.totalExpenses || 0).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #EEF2F0', paddingBottom: 12 }}>
          {[
            { key: 'invoices', label: 'Invoices & Bills', icon: <FileText size={15} /> },
            { key: 'new-invoice', label: 'New Invoice Builder', icon: <Plus size={15} /> },
            { key: 'analytics', label: 'Financial P&L Statement', icon: <TrendingUp size={15} /> },
            { key: 'expenses', label: 'Operating Expenses', icon: <TrendingDown size={15} /> },
            { key: 'ar', label: 'Accounts Receivable (Credit)', icon: <Building2 size={15} /> },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 10, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  backgroundColor: active ? '#0F6E5C' : '#fff',
                  color: active ? '#fff' : '#64748B',
                  boxShadow: active ? '0 4px 12px rgba(15,110,92,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: INVOICES & BILLS LIST */}
        {activeTab === 'invoices' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: 260, maxWidth: 360 }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Search invoice #, customer..."
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 38, backgroundColor: '#fff' }}
                />
              </div>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', backgroundColor: '#fff' }}>
                <option value="">All Statuses</option>
                <option value="ISSUED">Issued</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', backgroundColor: '#fff' }}>
                <option value="">All Invoice Types</option>
                <option value="PATIENT_SALE">Patient Sale</option>
                <option value="INSURANCE_CLAIM">Insurance Claim</option>
                <option value="WHOLESALE_CREDIT">Wholesale Credit</option>
              </select>
            </div>

            {/* Invoices Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {invoicesLoading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading invoices…</div>
              ) : invoices.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>No invoices found matching criteria.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAFBFA' }}>
                      {['Invoice #', 'Issue Date', 'Customer / Insurance', 'Type', 'Status', 'Total', 'Paid', 'Balance Due', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFA' }}>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#0F6E5C' }}>
                          {inv.invoiceNumber}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#4A5568' }}>
                          {format(new Date(inv.issueDate), 'dd MMM yyyy')}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>
                          {inv.customer?.name || 'Walk-in Patient'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Badge variant="neutral">{inv.type.replace('_', ' ')}</Badge>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{getStatusBadge(inv.status)}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>
                          ETB {inv.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>
                          ETB {inv.amountPaid.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: inv.balanceDue > 0 ? '#C17A1F' : '#64748B' }}>
                          ETB {inv.balanceDue.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => { setSelectedInvoice(inv); setViewModalOpen(true); }}
                              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #E8EDE9', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4A5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Printer size={13} /> View / Print
                            </button>
                            {inv.balanceDue > 0 && inv.status !== 'CANCELLED' && (
                              <button
                                onClick={() => { setSelectedInvoice(inv); setPayAmount(inv.balanceDue); setPayModalOpen(true); }}
                                style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <CreditCard size={13} /> Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NEW INVOICE BUILDER */}
        {activeTab === 'new-invoice' && (
          <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #EEF2F0', padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D1117', marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck color="#0F6E5C" /> Issue Financial Invoice / Bill
            </h2>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Invoice Type *</label>
                  <select value={newInvType} onChange={e => setNewInvType(e.target.value as InvoiceType)} style={inputStyle}>
                    <option value="PATIENT_SALE">Patient Billing / Sale</option>
                    <option value="INSURANCE_CLAIM">Insurance Claim Invoice</option>
                    <option value="WHOLESALE_CREDIT">Wholesale Credit Bill</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Customer / Patient</label>
                  <select value={newInvCustomerId} onChange={e => setNewInvCustomerId(e.target.value)} style={inputStyle}>
                    <option value="">Walk-in Customer / Generic</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Payment Due Date *</label>
                  <input type="date" required value={newInvDueDate} onChange={e => setNewInvDueDate(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Payment Terms</label>
                  <input placeholder="e.g. Net 14, Due on Receipt" value={newInvPaymentTerms} onChange={e => setNewInvPaymentTerms(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Billing Address</label>
                  <input placeholder="Customer address or facility" value={newInvAddress} onChange={e => setNewInvAddress(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Customer Tax ID / TIN</label>
                  <input placeholder="TIN Number" value={newInvTaxId} onChange={e => setNewInvTaxId(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Invoice Notes</label>
                  <input placeholder="Notes or instructions" value={newInvNotes} onChange={e => setNewInvNotes(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0D1117', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Invoice Line Items
                </label>

                <div style={{ borderRadius: 12, border: '1px solid #EEF2F0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAFBFA' }}>
                        <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', textAlign: 'left' }}>Item / Product Selection</th>
                        <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', width: 90 }}>Qty</th>
                        <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', width: 120 }}>Unit Price</th>
                        <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', width: 110 }}>Cost Price</th>
                        <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', width: 120 }}>Line Total</th>
                        <th style={{ padding: '10px 12px', width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newInvItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F8FAFA' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <select
                              value={item.productId}
                              onChange={e => handleItemProductChange(idx, e.target.value)}
                              style={{ ...inputStyle, padding: '7px 10px', fontSize: 13, marginBottom: 4 }}
                            >
                              <option value="">Select Inventory Product…</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ETB {p.defaultSellingPrice}</option>)}
                            </select>
                            <input
                              placeholder="Or custom item description"
                              value={item.description}
                              onChange={e => setNewInvItems(items => items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                              style={{ ...inputStyle, padding: '6px 10px', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="number" min="1"
                              value={item.quantity}
                              onChange={e => setNewInvItems(items => items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                              style={{ ...inputStyle, padding: '7px 10px', fontSize: 13 }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="number" step="0.01" min="0"
                              value={item.unitPrice}
                              onChange={e => setNewInvItems(items => items.map((it, i) => i === idx ? { ...it, unitPrice: Number(e.target.value) } : it))}
                              style={{ ...inputStyle, padding: '7px 10px', fontSize: 13 }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="number" step="0.01" min="0"
                              value={item.costPrice}
                              onChange={e => setNewInvItems(items => items.map((it, i) => i === idx ? { ...it, costPrice: Number(e.target.value) } : it))}
                              style={{ ...inputStyle, padding: '7px 10px', fontSize: 13, color: '#64748B' }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                            ETB {(item.unitPrice * item.quantity).toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {newInvItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewInvItems(items => items.filter((_, i) => i !== idx))}
                                style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', padding: 4 }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '10px 16px', backgroundColor: '#FAFBFA', borderTop: '1px solid #EEF2F0' }}>
                    <button
                      type="button"
                      onClick={() => setNewInvItems(items => [...items, { productId: '', description: '', quantity: 1, unitPrice: 0, costPrice: 0, taxRate: 0 }])}
                      style={{ fontSize: 13, color: '#0F6E5C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={14} /> Add Line Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Invoice Totals & Profit Calculations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 12 }}>
                <div style={{ padding: 16, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>Invoice Profit Analysis</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#64748B' }}>
                    <span>Estimated Line Items COGS:</span>
                    <strong style={{ fontFamily: "'Space Mono', monospace" }}>ETB {invCOGS.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#0F6E5C', fontWeight: 700 }}>
                    <span>Estimated Net Profit:</span>
                    <strong style={{ fontFamily: "'Space Mono', monospace" }}>ETB {invEstProfit.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>ETB {invSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', alignItems: 'center' }}>
                    <span>Discount (ETB):</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={newInvDiscount}
                      onChange={e => setNewInvDiscount(Number(e.target.value))}
                      style={{ ...inputStyle, width: 120, padding: '4px 8px', textAlign: 'right', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0D1117', borderTop: '1px solid #E8EDE9', paddingTop: 8 }}>
                    <span>Total Amount:</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {invGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(15,110,92,0.35)' }}
                >
                  {creatingInvoice ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle2 size={16} /> Issue Invoice</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: FINANCIAL P&L STATEMENT */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* P&L Statement Card */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                Profit & Loss Statement (P&L)
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#0D1117' }}>Point of Sale Revenue</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>ETB {(summary?.salesRevenue || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#0D1117' }}>Invoice Payments Collected</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>ETB {(summary?.invoiceCollectedRevenue || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 800, color: '#0F6E5C' }}>Total Gross Sales Revenue</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 15, fontFamily: "'Space Mono', monospace", fontWeight: 800, color: '#0F6E5C' }}>ETB {(summary?.totalRevenue || 0).toFixed(2)}</td>
                  </tr>

                  <tr><td colSpan={2} style={{ padding: 8 }}></td></tr>

                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, color: '#64748B' }}>Cost of Goods Sold (Inventory COGS)</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontFamily: "'Space Mono', monospace", color: '#C0392B' }}>- ETB {(summary?.totalCOGS || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F0FDF4' }}>
                    <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 800, color: '#166534' }}>Gross Profit Margin</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 15, fontFamily: "'Space Mono', monospace", fontWeight: 800, color: '#166534' }}>ETB {(summary?.grossProfit || 0).toFixed(2)} ({summary?.grossProfitMargin || 0}%)</td>
                  </tr>

                  <tr><td colSpan={2} style={{ padding: 8 }}></td></tr>

                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 0', fontSize: 14, color: '#64748B' }}>Operating Expenses (Rent, Salaries, Utilities)</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontFamily: "'Space Mono', monospace", color: '#C0392B' }}>- ETB {(summary?.totalExpenses || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#E0F2FE', borderTop: '2px solid #0EA5E9' }}>
                    <td style={{ padding: '14px 8px', fontSize: 16, fontWeight: 800, color: '#0369A1' }}>Net Operating Profit</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', fontSize: 18, fontFamily: "'Space Mono', monospace", fontWeight: 800, color: '#0369A1' }}>ETB {(summary?.netOperatingIncome || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Method Distribution */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                Revenue by Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {PAYMENT_METHODS.map(method => {
                  const amount = summary?.paymentBreakdown?.[method] || 0;
                  const total = summary?.totalRevenue || 1;
                  const pct = Math.min(100, Math.round((amount / total) * 100));

                  return (
                    <div key={method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                        <span>{method.replace('_', ' ')}</span>
                        <span style={{ fontFamily: "'Space Mono', monospace" }}>ETB {amount.toFixed(2)} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#0F6E5C', borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OPERATING EXPENSES */}
        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Pharmacy Operating Overhead & Expenses
              </h3>
              <button
                onClick={() => setAddExpenseOpen(true)}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Record Expense
              </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {expensesLoading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading expenses…</div>
              ) : expenses.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>No expenses recorded yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAFBFA' }}>
                      {['Expense #', 'Date', 'Category', 'Title / Description', 'Vendor', 'Method', 'Amount', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid #F8FAFA', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                      >
                        <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#475569' }}>{exp.expenseNumber}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{format(new Date(exp.expenseDate), 'dd MMM yyyy')}</td>
                        <td style={{ padding: '14px 16px' }}><Badge variant="neutral">{exp.category}</Badge></td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{exp.title}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{exp.vendor || '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>{exp.paymentMethod}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#C0392B' }}>
                          ETB {exp.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              title="Edit expense"
                              style={{
                                padding: '5px 10px', borderRadius: 7, border: '1.5px solid #0F6E5C',
                                background: 'rgba(15,110,92,0.07)', color: '#0F6E5C',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0F6E5C'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,110,92,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#0F6E5C'; }}
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              disabled={deletingExpenseId === exp.id}
                              title="Delete expense"
                              style={{
                                padding: '5px 10px', borderRadius: 7, border: '1.5px solid #C0392B',
                                background: 'rgba(192,57,43,0.07)', color: '#C0392B',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                                opacity: deletingExpenseId === exp.id ? 0.5 : 1,
                              }}
                              onMouseEnter={e => { if (deletingExpenseId !== exp.id) { (e.currentTarget as HTMLButtonElement).style.background = '#C0392B'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; } }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#C0392B'; }}
                            >
                              {deletingExpenseId === exp.id
                                ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                : <><Trash2 size={12} /> Delete</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNTS RECEIVABLE / CREDIT */}
        {activeTab === 'ar' && (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
              Accounts Receivable & Unpaid Insurance / Customer Credit
            </h3>

            {invoices.filter(i => i.balanceDue > 0).length === 0 ? (
              <div style={{ padding: 36, textAlign: 'center', color: '#0F6E5C', fontWeight: 600 }}>
                🎉 Great news! There are currently no outstanding credit balances or overdue invoices.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFBFA' }}>
                    {['Invoice #', 'Customer / Insurance', 'Type', 'Due Date', 'Total Amount', 'Paid Amount', 'Outstanding Balance', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(i => i.balanceDue > 0).map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFA' }}>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#0F6E5C' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{inv.customer?.name || 'Walk-in Customer'}</td>
                      <td style={{ padding: '14px 16px' }}><Badge variant="neutral">{inv.type}</Badge></td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#C0392B', fontWeight: 600 }}>{format(new Date(inv.dueDate), 'dd MMM yyyy')}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace" }}>ETB {inv.totalAmount.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {inv.amountPaid.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 800, fontFamily: "'Space Mono', monospace", color: '#C17A1F' }}>
                        ETB {inv.balanceDue.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => { setSelectedInvoice(inv); setPayAmount(inv.balanceDue); setPayModalOpen(true); }}
                          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* VIEW & PRINT INVOICE MODAL */}
      {viewModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setViewModalOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F6E5C', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F6E5C', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>PharmaSys Pharmacy</h1>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Official Financial Invoice & Tax Statement</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0D1117', margin: 0, fontFamily: "'Space Mono', monospace" }}>{selectedInvoice.invoiceNumber}</h2>
                <span style={{ fontSize: 12, color: '#64748B' }}>Issued: {format(new Date(selectedInvoice.issueDate), 'dd MMM yyyy')}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, fontSize: 13, color: '#4A5568' }}>
              <div>
                <strong style={{ color: '#0D1117', display: 'block', marginBottom: 4 }}>Billed To:</strong>
                <div>{selectedInvoice.customer?.name || 'Walk-in Patient'}</div>
                {selectedInvoice.billingAddress && <div>Address: {selectedInvoice.billingAddress}</div>}
                {selectedInvoice.customer?.phone && <div>Phone: {selectedInvoice.customer.phone}</div>}
              </div>
              <div>
                <strong style={{ color: '#0D1117', display: 'block', marginBottom: 4 }}>Billing Terms & Dates:</strong>
                <div>Payment Terms: {selectedInvoice.paymentTerms || 'Due on Receipt'}</div>
                <div>Due Date: {format(new Date(selectedInvoice.dueDate), 'dd MMM yyyy')}</div>
                <div>Status: <strong>{selectedInvoice.status}</strong></div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>Qty</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>Unit Price</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#0D1117', fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontFamily: "'Space Mono', monospace" }}>{item.quantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontFamily: "'Space Mono', monospace" }}>ETB {item.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>ETB {item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ width: 260, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontFamily: "'Space Mono', monospace" }}>ETB {selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Tax Amount:</span>
                  <span style={{ fontFamily: "'Space Mono', monospace" }}>ETB {selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#C0392B' }}>
                    <span>Discount:</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>- ETB {selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 800, fontSize: 15, borderTop: '1.5px solid #0D1117', color: '#0D1117' }}>
                  <span>Total Amount:</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#166534' }}>
                  <span>Amount Paid:</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>ETB {selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#C17A1F', fontWeight: 700 }}>
                  <span>Balance Due:</span>
                  <span style={{ fontFamily: "'Space Mono', monospace" }}>ETB {selectedInvoice.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setViewModalOpen(false)} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>Close</button>
              <button onClick={() => window.print()} style={{ flex: 1, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Printer size={16} /> Print Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {payModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPayModalOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Record Invoice Payment</h2>
                <p style={{ fontSize: 12, opacity: 0.8, margin: '2px 0 0' }}>Invoice: {selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setPayModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Payment Amount (ETB) *</label>
                <input type="number" step="0.01" min="0.01" required value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} style={inputStyle} />
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 4 }}>Remaining Balance: ETB {selectedInvoice.balanceDue.toFixed(2)}</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Payment Method *</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)} style={inputStyle}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="MOBILE_MONEY">Telebirr / Mobile Money</option>
                  <option value="INSURANCE">Insurance Direct Claim</option>
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Transaction Ref / Cheque #</label>
                <input placeholder="e.g. TXN-981244" value={payRef} onChange={e => setPayRef(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Notes</label>
                <input placeholder="Optional payment notes" value={payNotes} onChange={e => setPayNotes(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setPayModalOpen(false)} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingPay} style={{ flex: 2, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {submittingPay ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {addExpenseOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setAddExpenseOpen(false); setEditingExpenseId(null); setExpenseForm({ category: 'UTILITIES', title: '', amount: 0, vendor: '', paymentMethod: 'CASH', referenceNo: '', notes: '' }); }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{editingExpenseId ? 'Edit Expense' : 'Record Operating Expense'}</h2>
              <button onClick={() => { setAddExpenseOpen(false); setEditingExpenseId(null); setExpenseForm({ category: 'UTILITIES', title: '', amount: 0, vendor: '', paymentMethod: 'CASH', referenceNo: '', notes: '' }); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddExpense} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category *</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))} style={inputStyle}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Title / Description *</label>
                <input required placeholder="e.g. Monthly Electricity Bill" value={expenseForm.title} onChange={e => setExpenseForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Amount (ETB) *</label>
                <input type="number" step="0.01" min="0.01" required value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Vendor / Payee</label>
                  <input placeholder="Payee name" value={expenseForm.vendor} onChange={e => setExpenseForm(f => ({ ...f, vendor: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Payment Method</label>
                  <select value={expenseForm.paymentMethod} onChange={e => setExpenseForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))} style={inputStyle}>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Telebirr / Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setAddExpenseOpen(false); setEditingExpenseId(null); setExpenseForm({ category: 'UTILITIES', title: '', amount: 0, vendor: '', paymentMethod: 'CASH', referenceNo: '', notes: '' }); }} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingExpense} style={{ flex: 2, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {submittingExpense ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
