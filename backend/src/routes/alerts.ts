import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { getLowStockProducts, getExpiringBatches } from '../services/alertEngine';

const router = Router();
router.use(authenticate);

router.get('/low-stock', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await getLowStockProducts();
    res.json(alerts);
  } catch (err) { next(err); }
});

router.get('/expiring', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(String(req.query.days || '30'), 10);
    const alerts = await getExpiringBatches(days);
    res.json(alerts);
  } catch (err) { next(err); }
});

export default router;
