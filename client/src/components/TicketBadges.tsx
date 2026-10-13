import { PRIORITY_LABELS, SLA_LABELS, STATUS_LABELS, formatDateTime } from '../lib/format';
import type { SlaStatus, Ticket, TicketPriority, TicketStatus } from '../types';

export function StatusStamp({ status }: { status: TicketStatus }) {
  return <span className={`stamp stamp-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function LateStamp() {
  return <span className="stamp stamp-late">{SLA_LABELS.overdue}</span>;
}

const BAR_HEIGHTS = ['h-[5px]', 'h-2', 'h-3'];
const PRIORITY_LEVEL: Record<TicketPriority, number> = { low: 1, medium: 2, high: 3 };

export function SignalBars({ priority }: { priority: TicketPriority }) {
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-0.5">
      {BAR_HEIGHTS.map((height, index) => (
        <i
          key={height}
          className={`block w-[3px] rounded-[1px] ${height} ${index < PRIORITY_LEVEL[priority] ? 'bg-current' : 'bg-line'}`}
        />
      ))}
    </span>
  );
}

// Priority has no colour: a late ticket stays the only red thing in a list.
export function PriorityLabel({ priority }: { priority: TicketPriority }) {
  return (
    <span className="inline-flex items-center gap-[7px]">
      <SignalBars priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

/** The SLA state in words: red only when someone has to act. */
export function SlaState({ status }: { status: SlaStatus }) {
  if (status === 'overdue') return <LateStamp />;
  if (status === 'met') return <span className="font-semibold text-green">{SLA_LABELS.met}</span>;
  if (status === 'breached') return <span className="text-pencil">{SLA_LABELS.breached}</span>;
  return <span>{SLA_LABELS.on_track}</span>;
}

/** The list's SLA cell: the due date while the ticket is active, the outcome once it is done. */
export function SlaDue({ ticket }: { ticket: Ticket }) {
  if (ticket.slaStatus === 'on_track') return <>{formatDateTime(ticket.dueAt)}</>;
  if (ticket.slaStatus === 'overdue') {
    return (
      <span className="inline-flex items-center gap-2">
        {formatDateTime(ticket.dueAt)}
        <LateStamp />
      </span>
    );
  }
  return <SlaState status={ticket.slaStatus} />;
}
