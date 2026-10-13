import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import CommentsPanel from '../components/CommentsPanel';
import ConfirmDelete from '../components/ConfirmDelete';
import { BrokenState, EmptyState, SkeletonRows } from '../components/PageStates';
import { LateStamp, StatusStamp } from '../components/TicketBadges';
import { AssignPanel, SlaPanel, StatusPanel } from '../components/TicketPanels';
import TicketSheet from '../components/TicketSheet';
import { isNotFound } from '../lib/api/client';
import { formatDateAt } from '../lib/format';
import { useCurrentUser } from '../lib/hooks/useAuth';
import { useComments, useTicket } from '../lib/hooks/useTickets';
import { canDelete, canEdit } from '../lib/ticketRules';

export default function TicketPage() {
  const { id = '' } = useParams();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const ticketQuery = useTicket(id);
  const comments = useComments(id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (ticketQuery.isPending) return <SkeletonRows rows={6} />;
  if (ticketQuery.isError) {
    if (isNotFound(ticketQuery.error)) {
      return (
        <EmptyState
          title="Ce ticket n’existe pas"
          text="Il a peut-être été supprimé."
          action={
            <Link to="/tickets" className="btn">
              Voir les tickets
            </Link>
          }
        />
      );
    }
    return <BrokenState onRetry={() => ticketQuery.refetch()} />;
  }

  const ticket = ticketQuery.data;
  const editable = canEdit(user, ticket);
  const deletable = canDelete(user, ticket);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="crumb">
            <Link to="/tickets" className="underline">
              Tickets
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="h-title">{ticket.title}</h1>
            <StatusStamp status={ticket.status} />
            {ticket.slaStatus === 'overdue' && <LateStamp />}
          </div>
          <p className="mt-1 text-[13px] text-pencil">
            Créé par {ticket.createdBy.name} le {formatDateAt(ticket.createdAt)}
          </p>
        </div>
        {(editable || deletable) && (
          <div className="flex flex-wrap items-center gap-2">
            {editable && (
              <button type="button" className="btn" onClick={() => setEditing(true)}>
                Modifier
              </button>
            )}
            {deletable && (
              <button type="button" className="btn btn-danger" onClick={() => setDeleting(true)}>
                Supprimer le ticket
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 gap-3">
          <section className="card panel">
            <h2 className="cap">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">{ticket.description}</p>
          </section>
          <CommentsPanel ticket={ticket} />
        </div>
        <div className="grid min-w-0 gap-3">
          <StatusPanel ticket={ticket} />
          <AssignPanel ticket={ticket} />
          <SlaPanel ticket={ticket} />
        </div>
      </div>

      {editing && <TicketSheet ticket={ticket} onClose={() => setEditing(false)} />}
      {deleting && (
        <ConfirmDelete
          ticket={ticket}
          commentCount={comments.data?.length ?? 0}
          onClose={() => setDeleting(false)}
          onDeleted={() => navigate('/tickets', { replace: true })}
        />
      )}
    </div>
  );
}
