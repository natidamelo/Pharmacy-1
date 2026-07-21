import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
    });
    res.json(categories);
  } catch (err) { next(err); }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.json(category);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id as string }, data });
    res.json(category);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
});

export default router;
