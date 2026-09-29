import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors (checking both instanceof and name/issues for monorepo safety)
  if (err instanceof ZodError || err?.name === 'ZodError' || Array.isArray(err?.issues)) {
    const issues = err.issues || err.errors || [];
    const messages = issues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: messages || err.message,
      issues,
    });
    return;
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle generic / unexpected errors without exposing stack trace to users
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred. Please try again later.',
  });
}
