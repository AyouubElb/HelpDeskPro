import type { Ticket, TicketStatus, User } from '../types';

// The API's rules, mirrored so the screen only offers what will be accepted. The API stays the authority.

const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  resolved: ['in_progress', 'closed'],
  closed: [],
};

export function nextStatuses(ticket: Ticket): TicketStatus[] {
  return TRANSITIONS[ticket.status];
}

export const isActive = (ticket: Ticket) => ticket.status === 'open' || ticket.status === 'in_progress';

export function canEdit(user: User, ticket: Ticket): boolean {
  if (ticket.status === 'closed') return false;
  return user.role === 'admin' || ticket.createdBy.id === user.id || ticket.assignedTo?.id === user.id;
}

export function canDelete(user: User, ticket: Ticket): boolean {
  return user.role === 'admin' && ticket.status === 'open';
}

/** Why the status buttons are disabled, or null when they can be used. */
export function statusBlockedReason(user: User, ticket: Ticket): string | null {
  if (!ticket.assignedTo) {
    return user.role === 'admin'
      ? 'Assignez un agent pour changer le statut.'
      : 'Un admin doit d’abord assigner ce ticket à un agent.';
  }
  if (user.role === 'agent' && ticket.assignedTo.id !== user.id) {
    return 'Seul l’agent assigné peut changer le statut.';
  }
  return null;
}
