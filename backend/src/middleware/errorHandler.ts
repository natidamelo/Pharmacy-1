import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);
  if (err.stack) console.error('[Stack]:', err.stack);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
};
