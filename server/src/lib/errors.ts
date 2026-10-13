/** Stable error codes for the client. */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_ASSIGNEE'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_STATUS_TRANSITION'
  | 'TICKET_CLOSED'
  | 'TICKET_NOT_ASSIGNED'
  | 'TICKET_FINISHED'
  | 'TICKET_NOT_DELETABLE'
  | 'TICKET_MODIFIED'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR';

/** Expected error: HTTP status, stable code, and a French message the UI shows as is. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (code: ErrorCode, message: string) => new AppError(400, code, message);

export const unauthorized = (message = 'Session absente ou expirée. Veuillez vous reconnecter.') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = "Vous n'avez pas les droits nécessaires pour cette action.") =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (message: string) => new AppError(404, 'NOT_FOUND', message);

export const conflict = (code: ErrorCode, message: string) => new AppError(409, code, message);
