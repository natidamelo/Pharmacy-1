import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { initAlertEngine } from './services/alertEngine';

// Routes
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import batchesRouter from './routes/batches';
import stockMovementsRouter from './routes/stockMovements';
import salesRouter from './routes/sales';
import alertsRouter from './routes/alerts';
import customersRouter from './routes/customers';
import usersRouter from './routes/users';
import settingsRouter from './routes/settings';
import reportsRouter from './routes/reports';
import prescriptionsRouter from './routes/prescriptions';
import purchasingRouter from './routes/purchasing';
import billingRouter from './routes/billing';

const app = express();
const httpServer = createServer(app);

const corsOriginDelegate = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin || config.clientOrigin === '*' || origin.includes('localhost') || origin.endsWith('.vercel.app') || origin === config.clientOrigin) {
    callback(null, true);
  } else {
    callback(null, true);
  }
};

// Socket.io
const io = new SocketServer(httpServer, {
  cors: { origin: corsOriginDelegate, credentials: true },
});
initAlertEngine(io);

io.on('connection', socket => {
  console.log('[Socket.io] Client connected:', socket.id);
  socket.on('disconnect', () => console.log('[Socket.io] Client disconnected:', socket.id));
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsOriginDelegate, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/stock-movements', stockMovementsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/billing', billingRouter);
app.use('/api', purchasingRouter); // mounts /api/suppliers & /api/purchase-orders

// Error Handling
app.use(errorHandler);

httpServer.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
