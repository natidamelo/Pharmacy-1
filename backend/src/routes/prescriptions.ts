import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const router = Router();
router.use(authenticate);

// GET /api/prescriptions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    const { search, status } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { prescriberName: { contains: search, mode: 'insensitive' } },
        { prescriberLicenseNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.count({ where }),
    ]);

    res.json(paginatedResponse(prescriptions, total, pagination));
  } catch (err) { next(err); }
});

// POST /api/prescriptions
router.post('/', requireRole('PHARMACIST', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, prescriberName, prescriberLicenseNo, dateIssued, notes, items } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        customerId,
        prescriberName,
        prescriberLicenseNo,
        dateIssued: new Date(dateIssued || Date.now()),
        notes,
        createdBy: req.user!.userId,
        items: {
          create: (items || []).map((i: { productId: string; dosageInstructions: string; quantityPrescribed: number }) => ({
            productId: i.productId,
            dosageInstructions: i.dosageInstructions,
            quantityPrescribed: i.quantityPrescribed,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    res.status(201).json(prescription);
  } catch (err) { next(err); }
});

// GET /api/prescriptions/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!prescription) { res.status(404).json({ error: 'Prescription not found' }); return; }
    res.json(prescription);
  } catch (err) { next(err); }
});

export default router;
