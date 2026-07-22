import { z } from 'zod';

const InvoiceTypeEnum = z.enum(['PATIENT_SALE', 'INSURANCE_CLAIM', 'WHOLESALE_CREDIT', 'SUPPLIER_BILL']);
const InvoiceStatusEnum = z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']);
const PaymentMethodEnum = z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'BANK_TRANSFER']);
const ExpenseCategoryEnum = z.enum(['UTILITIES', 'RENT', 'SALARIES', 'SUPPLIES', 'MAINTENANCE', 'OTHER']);

export const createInvoiceSchema = z.object({
  body: z.object({
    type: InvoiceTypeEnum.default('PATIENT_SALE'),
    customerId: z.string().optional(),
    saleId: z.string().optional(),
    dueDate: z.string().or(z.date()),
    discountAmount: z.number().min(0).default(0),
    paymentTerms: z.string().optional().default('Due on Receipt'),
    billingAddress: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().optional(),
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().min(0),
      costPrice: z.number().min(0).default(0),
      taxRate: z.number().min(0).max(1).default(0),
    })).min(1),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: InvoiceStatusEnum,
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().optional(),
    saleId: z.string().optional(),
    amount: z.number().positive(),
    paymentMethod: PaymentMethodEnum,
    transactionRef: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    category: ExpenseCategoryEnum,
    title: z.string().min(1),
    amount: z.number().positive(),
    vendor: z.string().optional(),
    paymentMethod: PaymentMethodEnum.default('CASH'),
    referenceNo: z.string().optional(),
    expenseDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});
