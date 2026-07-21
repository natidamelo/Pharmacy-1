import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const pagination = parsePagination(req.query);

    const where = search ? {
      OR: [
        { name: { contains: String(search), mode: 'insensitive' as const } },
        { phone: { contains: String(search) } },
      ],
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json(paginatedResponse(customers, total, pagination));
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
      include: { sales: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!customer) { res.status(404).json({ error: 'Customer not found' }); return; }
    res.json(customer);
  } catch (err) { next(err); }
});

router.post('/', validate(createCustomerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.json(customer);
  } catch (err) { next(err); }
});

router.patch('/:id', validate(updateCustomerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(customer);
  } catch (err) { next(err); }
});

export default router;
