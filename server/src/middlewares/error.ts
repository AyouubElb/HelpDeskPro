import type { ErrorRequestHandler, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, notFound, type ErrorCode } from '../lib/errors.js';

function sendError(res: Response, status: number, code: ErrorCode, message: string, details?: unknown) {
  res.status(status).json({ error: { code, message, ...(details !== undefined && { details }) } });
}

export const notFoundHandler: RequestHandler = (req) => {
  throw notFound(`Route introuvable : ${req.method} ${req.path}`);
};

/** Single place where errors become HTTP responses. Never leaks stack traces or SQL details. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    return sendError(res, 400, 'VALIDATION_ERROR', 'Données invalides.', details);
  }

  // Body parser errors (malformed JSON, body too large) carry their own 4xx status.
  if (isClientError(err)) {
    const message = err.type === 'entity.too.large' ? 'Requête trop volumineuse.' : 'Corps de requête JSON invalide.';
    return sendError(res, err.status, 'VALIDATION_ERROR', message);
  }

  console.error(err);
  sendError(res, 500, 'INTERNAL_ERROR', 'Erreur interne du serveur.');
};

function isClientError(err: unknown): err is { status: number; type?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}
