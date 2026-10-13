import type { TicketStatus } from '../../generated/prisma/client.js';

export const ACTIVE_STATUSES: TicketStatus[] = ['open', 'in_progress'];
export const FINISHED_STATUSES: TicketStatus[] = ['resolved', 'closed'];

/**
 * Statuses a ticket may come from, by target status. `open` is never a target:
 * only unassigning an in-progress ticket sends it back to open.
 */
export const ALLOWED_FROM: Record<TicketStatus, TicketStatus[]> = {
  open: [],
  in_progress: ['open', 'resolved'],
  resolved: ['open', 'in_progress'],
  closed: ['resolved'],
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

export const isActive = (status: TicketStatus) => ACTIVE_STATUSES.includes(status);
