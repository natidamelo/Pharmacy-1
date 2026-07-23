import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  recordPaymentSchema,
  createExpenseSchema,
} from '../schemas/billing.schema';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const router = Router();
router.use(authenticate);

// Helper function to generate unique Invoice number
async function generateInvoiceNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}`;
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// Helper function to generate unique Expense number
async function generateExpenseNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `EXP-${dateStr}`;
  const count = await prisma.expense.count({
    where: { expenseNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// Helper function to generate unique Payment Transaction number
async function generateTransactionNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `TXN-${dateStr}`;
  const count = await prisma.paymentTransaction.count({
    where: { transactionNo: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/billing/invoices — List Invoices
router.get('/invoices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, type, customerId, from, to } = req.query as Record<string, string>;
    const pagination = parsePagination(req.query);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { billingAddress: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (from || to) {
      const issueDateFilter: Record<string, Date> = {};
      if (from && !isNaN(Date.parse(from))) issueDateFilter.gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) issueDateFilter.lte = new Date(to);
      if (Object.keys(issueDateFilter).length > 0) where.issueDate = issueDateFilter;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          items: { select: { id: true, description: true, quantity: true, unitPrice: true, lineTotal: true } },
          payments: { select: { id: true, amount: true, paymentMethod: true, createdAt: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json(paginatedResponse(invoices, total, pagination));
  } catch (err) { next(err); }
});

// POST /api/billing/invoices — Create Invoice
router.post('/invoices', requireRole('ADMIN', 'PHARMACIST', 'CASHIER'), validate(createInvoiceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, customerId, saleId, dueDate, discountAmount = 0, paymentTerms, billingAddress, taxId, notes, items } = req.body;
    const createdBy = req.user!.userId;

    let subtotal = 0;
    let taxAmount = 0;

    const invoiceItemsData = [];
    for (const item of items) {
      const lineSub = item.unitPrice * item.quantity;
      const lineTax = lineSub * (item.taxRate || 0);
      const lineTotal = lineSub + lineTax;
      subtotal += lineSub;
      taxAmount += lineTax;

      let costPrice = item.costPrice || 0;
      if (item.productId && !costPrice) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) costPrice = prod.defaultCostPrice || 0;
      }

      invoiceItemsData.push({
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice,
        taxRate: item.taxRate || 0,
        lineTotal,
      });
    }

    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type,
        status: 'ISSUED',
        customerId: customerId || null,
        saleId: saleId || null,
        dueDate: new Date(dueDate),
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        paymentTerms,
        billingAddress,
        taxId,
        notes,
        createdBy,
        items: { create: invoiceItemsData },
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    res.status(201).json(invoice);
  } catch (err) { next(err); }
});

// GET /api/billing/invoices/:id — Fetch Invoice Detail
router.get('/invoices/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, dosageForm: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json(invoice);
  } catch (err) { next(err); }
});

// PATCH /api/billing/invoices/:id/status — Update Status
router.patch('/invoices/:id/status', requireRole('ADMIN', 'PHARMACIST'), validate(updateInvoiceStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status: req.body.status },
    });
    res.json(invoice);
  } catch (err) { next(err); }
});

// POST /api/billing/invoices/:id/payments — Record Payment against Invoice
router.post('/invoices/:id/payments', requireRole('ADMIN', 'PHARMACIST', 'CASHIER'), validate(recordPaymentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoiceId = req.params.id as string;
    const { amount, paymentMethod, transactionRef, notes } = req.body;
    const performedBy = req.user!.userId;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
    if (invoice.status === 'CANCELLED') { res.status(400).json({ error: 'Cannot pay cancelled invoice' }); return; }

    const transactionNo = await generateTransactionNumber();

    const payment = await prisma.paymentTransaction.create({
      data: {
        transactionNo,
        invoiceId,
        amount,
        paymentMethod,
        transactionRef,
        notes,
        performedBy,
      },
    });

    const newAmountPaid = invoice.amountPaid + amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
    let newStatus = invoice.status;
    if (newBalanceDue === 0) newStatus = 'PAID';
    else if (newAmountPaid > 0) newStatus = 'PARTIALLY_PAID';

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
      include: { payments: true, customer: true, items: true },
    });

    res.status(201).json({ payment, invoice: updatedInvoice });
  } catch (err) { next(err); }
});

// GET /api/billing/expenses — List Expenses
router.get('/expenses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, from, to } = req.query as Record<string, string>;
    const pagination = parsePagination(req.query);

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { expenseNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from && !isNaN(Date.parse(from))) dateFilter.gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) dateFilter.lte = new Date(to);
      if (Object.keys(dateFilter).length > 0) where.expenseDate = dateFilter;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { expenseDate: 'desc' },
      }).catch(() => []),
      prisma.expense.count({ where }).catch(() => 0),
    ]);

    res.json(paginatedResponse(expenses || [], total || 0, pagination));
  } catch (err) { next(err); }
});

// POST /api/billing/expenses — Create Expense
router.post('/expenses', requireRole('ADMIN', 'INVENTORY_CLERK'), validate(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, title, amount, vendor, paymentMethod, referenceNo, expenseDate, notes } = req.body;
    const createdBy = req.user!.userId;
    const expenseNumber = await generateExpenseNumber();

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        category,
        title,
        amount,
        vendor,
        paymentMethod,
        referenceNo,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        notes,
        createdBy,
      },
    });

    res.status(201).json(expense);
  } catch (err) { next(err); }
});

// PATCH /api/billing/expenses/:id — Update Expense
router.patch('/expenses/:id', requireRole('ADMIN', 'INVENTORY_CLERK'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { category, title, amount, vendor, paymentMethod, referenceNo, expenseDate, notes } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Expense not found' }); return; }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(title && { title }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(vendor !== undefined && { vendor }),
        ...(paymentMethod && { paymentMethod }),
        ...(referenceNo !== undefined && { referenceNo }),
        ...(expenseDate && { expenseDate: new Date(expenseDate) }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/billing/expenses/:id — Delete Expense
router.delete('/expenses/:id', requireRole('ADMIN', 'INVENTORY_CLERK'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Expense not found' }); return; }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) { next(err); }
});

// GET /api/billing/summary — Comprehensive Financial Dashboard Metrics
router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Sales Revenue & COGS
    const sales = await prisma.sale.findMany({
      where: { status: 'COMPLETED' },
      include: { items: true },
    }).catch(() => []);

    let salesRevenue = 0;
    let salesCOGS = 0;
    for (const sale of sales) {
      salesRevenue += sale.totalAmount || 0;
      if (sale.items) {
        for (const item of sale.items) {
          salesCOGS += (item.costPrice || 0) * (item.quantity || 0);
        }
      }
    }

    // 2. Paid Invoices Revenue & COGS
    const invoices = await prisma.invoice.findMany({
      where: { status: { in: ['PAID', 'PARTIALLY_PAID', 'ISSUED', 'OVERDUE'] } },
      include: { items: true },
    }).catch(() => []);

    let invoiceCollectedRevenue = 0;
    let invoiceCOGS = 0;
    let accountsReceivable = 0;

    for (const inv of invoices) {
      invoiceCollectedRevenue += inv.amountPaid || 0;
      accountsReceivable += inv.balanceDue || 0;

      if (inv.items) {
        for (const item of inv.items) {
          invoiceCOGS += (item.costPrice || 0) * (item.quantity || 0);
        }
      }
    }

    const totalRevenue = salesRevenue + invoiceCollectedRevenue;
    const totalCOGS = salesCOGS + invoiceCOGS;
    const grossProfit = totalRevenue - totalCOGS;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 3. Expenses
    let totalExpenses = 0;
    try {
      const expensesAgg = await prisma.expense.aggregate({
        _sum: { amount: true },
      });
      totalExpenses = expensesAgg?._sum?.amount ?? 0;
    } catch {
      totalExpenses = 0;
    }

    const netOperatingIncome = grossProfit - totalExpenses;

    // 4. Payment Method Breakdown (from Sales & PaymentTransactions)
    const paymentBreakdown: Record<string, number> = {
      CASH: 0,
      CARD: 0,
      MOBILE_MONEY: 0,
      INSURANCE: 0,
      BANK_TRANSFER: 0,
    };

    for (const sale of sales) {
      if (sale.paymentMethod && paymentBreakdown[sale.paymentMethod] !== undefined) {
        paymentBreakdown[sale.paymentMethod] += sale.totalAmount || 0;
      }
    }

    const txns = await prisma.paymentTransaction.findMany().catch(() => []);
    for (const txn of txns) {
      if (txn.paymentMethod && paymentBreakdown[txn.paymentMethod] !== undefined) {
        paymentBreakdown[txn.paymentMethod] += txn.amount || 0;
      }
    }

    res.json({
      totalRevenue,
      salesRevenue,
      invoiceCollectedRevenue,
      totalCOGS,
      grossProfit,
      grossProfitMargin: Number(grossProfitMargin.toFixed(2)),
      totalExpenses,
      netOperatingIncome,
      accountsReceivable,
      paymentBreakdown,
      unpaidInvoicesCount: invoices.filter(i => (i.balanceDue || 0) > 0).length,
    });
  } catch (err) { next(err); }
});

export default router;
