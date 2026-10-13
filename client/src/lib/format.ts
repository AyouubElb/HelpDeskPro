import type { Role, SlaStatus, TicketPriority, TicketStatus } from '../types';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const SLA_LABELS: Record<SlaStatus, string> = {
  on_track: 'Dans les délais',
  overdue: 'En retard',
  met: 'Respecté',
  breached: 'Dépassé',
};

export const ROLE_LABELS: Record<Role, string> = { admin: 'Admin', agent: 'Agent' };

// Shown as a hint in the ticket form; the API reads the real values from sla_policies.
export const SLA_HOURS: Record<TicketPriority, number> = { high: 4, medium: 24, low: 72 };

// Dates in the browser's time zone: 13/10/2026 and 16:30.
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const longDateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => `${formatDate(iso)} ${timeFormat.format(new Date(iso))}`;
export const formatDateAt = (iso: string) => `${formatDate(iso)} à ${timeFormat.format(new Date(iso))}`;

export function formatToday(): string {
  const today = longDateFormat.format(new Date());
  return today.charAt(0).toUpperCase() + today.slice(1);
}

export const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
