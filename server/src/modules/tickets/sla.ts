import type { TicketStatus } from '../../generated/prisma/client.js';
import { isActive } from './transitions.js';

export type SlaStatus = 'on_track' | 'overdue' | 'met' | 'breached';

const HOUR_MS = 60 * 60 * 1000;

/** Deadline in calendar hours from the creation date. */
export const computeDueAt = (createdAt: Date, resolutionHours: number) =>
  new Date(createdAt.getTime() + resolutionHours * HOUR_MS);

/** Computed on read, never stored: it depends on the current time. */
export function getSlaStatus(
  ticket: { status: TicketStatus; dueAt: Date; resolvedAt: Date | null },
  now = new Date(),
): SlaStatus {
  if (isActive(ticket.status)) return ticket.dueAt < now ? 'overdue' : 'on_track';
  return ticket.resolvedAt !== null && ticket.resolvedAt > ticket.dueAt ? 'breached' : 'met';
}
