import { useState, type ReactNode } from 'react';
import { PriorityLabel, SlaState, StatusStamp } from './TicketBadges';
import { getErrorMessage } from '../lib/api/client';
import { formatDateTime } from '../lib/format';
import { useCurrentUser } from '../lib/hooks/useAuth';
import { useAgents } from '../lib/hooks/useStaff';
import { useAssignTicket, useChangeStatus } from '../lib/hooks/useTickets';
import { isActive, nextStatuses, statusBlockedReason } from '../lib/ticketRules';
import type { Ticket, TicketStatus } from '../types';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <span className="text-pencil">{label}</span>
      {children}
    </div>
  );
}

function actionLabel(from: TicketStatus, to: TicketStatus): string {
  if (to === 'in_progress') return from === 'resolved' ? 'Rouvrir' : 'Passer en cours';
  if (to === 'resolved') return 'Marquer résolu';
  return 'Fermer le ticket';
}

export function StatusPanel({ ticket }: { ticket: Ticket }) {
  const user = useCurrentUser();
  const change = useChangeStatus(ticket.id);
  const targets = nextStatuses(ticket);
  const blocked = statusBlockedReason(user, ticket);

  return (
    <section className="card panel">
      <h2 className="cap">Statut</h2>
      <Row label="Actuel">
        <StatusStamp status={ticket.status} />
      </Row>
      {targets.map((to) => (
        <button
          key={to}
          type="button"
          className="btn w-full"
          disabled={!!blocked || change.isPending}
          onClick={() => change.mutate(to)}
        >
          {change.isPending && change.variables === to && <span aria-hidden="true" className="spin" />}
          {actionLabel(ticket.status, to)}
        </button>
      ))}
      {targets.length === 0 && <p className="text-xs text-pencil">Ticket fermé : plus aucune modification.</p>}
      {targets.length > 0 && blocked && <p className="text-xs text-pencil">{blocked}</p>}
      {change.isError && (
        <p role="alert" className="inline-err">
          {getErrorMessage(change.error)}
        </p>
      )}
    </section>
  );
}

export function AssignPanel({ ticket }: { ticket: Ticket }) {
  const user = useCurrentUser();

  if (user.role === 'admin' && isActive(ticket)) {
    // A new assignee resets the form to show them.
    return <AssignForm key={ticket.assignedTo?.id ?? 'none'} ticket={ticket} />;
  }

  return (
    <section className="card panel">
      <h2 className="cap">Assignation</h2>
      <Row label="Agent">
        {ticket.assignedTo ? <b>{ticket.assignedTo.name}</b> : <span className="text-pencil">Non assigné</span>}
      </Row>
      {user.role === 'admin' && (
        <p className="text-xs text-pencil">
          {ticket.status === 'closed' ? 'Ticket fermé : l’agent ne change plus.' : 'Rouvrez le ticket pour changer d’agent.'}
        </p>
      )}
    </section>
  );
}

function AssignForm({ ticket }: { ticket: Ticket }) {
  const agents = useAgents();
  const assign = useAssignTicket(ticket.id);
  const [agentId, setAgentId] = useState(ticket.assignedTo?.id ?? '');

  return (
    <section className="card panel">
      <h2 className="cap">Assignation</h2>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="agent" className="label">
          Agent
        </label>
        <select id="agent" className="input select" value={agentId} onChange={(event) => setAgentId(event.target.value)}>
          <option value="">Choisir un agent</option>
          {agents.data?.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={!agentId || agentId === ticket.assignedTo?.id || assign.isPending}
        onClick={() => assign.mutate(agentId)}
      >
        {assign.isPending && assign.variables !== null && <span aria-hidden="true" className="spin" />}
        Assigner
      </button>
      {ticket.assignedTo && (
        <>
          <button type="button" className="btn w-full" disabled={assign.isPending} onClick={() => assign.mutate(null)}>
            {assign.isPending && assign.variables === null && <span aria-hidden="true" className="spin" />}
            Retirer l’agent
          </button>
          {ticket.status === 'in_progress' && (
            <p className="text-xs text-pencil">Sans agent, le ticket repasse « Ouvert ».</p>
          )}
        </>
      )}
      {assign.isError && (
        <p role="alert" className="inline-err">
          {getErrorMessage(assign.error)}
        </p>
      )}
    </section>
  );
}

export function SlaPanel({ ticket }: { ticket: Ticket }) {
  // The due date is the creation date plus the priority's delay.
  const hours = Math.round((Date.parse(ticket.dueAt) - Date.parse(ticket.createdAt)) / 3_600_000);

  return (
    <section className="card panel tabular-nums">
      <h2 className="cap">Suivi SLA</h2>
      <Row label="Priorité">
        <PriorityLabel priority={ticket.priority} />
      </Row>
      <Row label="Délai">
        <b>{hours} h</b>
      </Row>
      <Row label="Échéance">
        <b>{formatDateTime(ticket.dueAt)}</b>
      </Row>
      <Row label="État">
        <SlaState status={ticket.slaStatus} />
      </Row>
      {ticket.resolvedAt && (
        <Row label="Résolu le">
          <span>{formatDateTime(ticket.resolvedAt)}</span>
        </Row>
      )}
      <Row label="Modifié le">
        <span>{formatDateTime(ticket.updatedAt)}</span>
      </Row>
    </section>
  );
}
