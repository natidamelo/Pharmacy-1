import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.settings.findMany();
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
    res.json(map);
  } catch (err) { next(err); }
});

router.patch('/', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = Object.entries(req.body as Record<string, string>);
    await Promise.all(
      entries.map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    res.json({ message: 'Settings updated' });
  } catch (err) { next(err); }
});

export default router;
