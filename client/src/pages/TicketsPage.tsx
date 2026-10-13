import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PlusIcon, SearchIcon } from '../components/Icons';
import { BrokenState, EmptyState, PageHead, SkeletonRows } from '../components/PageStates';
import Pagination from '../components/Pagination';
import { PriorityLabel, SlaDue, StatusStamp } from '../components/TicketBadges';
import TicketSheet from '../components/TicketSheet';
import { PRIORITY_LABELS, formatDate } from '../lib/format';
import { useDebounce } from '../lib/hooks/useDebounce';
import { useAgents } from '../lib/hooks/useStaff';
import { useTickets } from '../lib/hooks/useTickets';
import type { TicketParams, TicketPriority, TicketStatus } from '../types';

const PAGE_SIZE = 8;
const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES: TicketPriority[] = ['high', 'medium', 'low'];
const TABS: { status?: TicketStatus; label: string }[] = [
  { label: 'Tous' },
  { status: 'open', label: 'Ouverts' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'resolved', label: 'Résolus' },
  { status: 'closed', label: 'Fermés' },
];

// A hand-edited URL with an unknown value is treated as no filter.
function pick<T extends string>(value: string | null, allowed: T[]): T | undefined {
  return allowed.find((item) => item === value);
}

export default function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = pick(searchParams.get('status'), STATUSES);
  const priority = pick(searchParams.get('priority'), PRIORITIES);
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const urlSearch = searchParams.get('search') ?? '';
  const page = Math.max(1, Math.trunc(Number(searchParams.get('page'))) || 1);

  // The box updates at each key; the URL (and the request) only once typing pauses.
  const [search, setSearch] = useState(urlSearch);
  const [shownSearch, setShownSearch] = useState(urlSearch);
  if (urlSearch !== shownSearch) {
    // The URL changed from outside the box (back button, "Effacer les filtres").
    setShownSearch(urlSearch);
    setSearch(urlSearch);
  }
  const debouncedSearch = useDebounce(search, 300);
  const [creating, setCreating] = useState(false);

  // Empty values leave the URL; any filter change goes back to page 1.
  const updateParams = (changes: Record<string, string | undefined>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!('page' in changes)) next.delete('page');
      return next;
    });
  };

  useEffect(() => {
    const value = debouncedSearch.trim();
    if (value !== urlSearch) updateParams({ search: value || undefined });
    // Only a new debounced value writes to the URL; other URL changes must not trigger it.
  }, [debouncedSearch]);

  const params: TicketParams = { status, priority, assignedTo, search: urlSearch || undefined, page, pageSize: PAGE_SIZE };
  const tickets = useTickets(params);
  const agents = useAgents();
  const data = tickets.data;
  const filtered = Boolean(status || priority || assignedTo || urlSearch);

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        crumb="Support"
        title="Tickets"
        action={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <PlusIcon />
            Nouveau ticket
          </button>
        }
      />

      <div role="tablist" aria-label="Statut" className="flex flex-wrap gap-0.5 border-b-[1.5px] border-line">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={status === tab.status}
            className="tab"
            onClick={() => updateParams({ status: tab.status })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-[1_1_300px]">
          <SearchIcon size={14} className="pointer-events-none absolute top-1/2 left-[11px] -translate-y-1/2 text-pencil" />
          <label htmlFor="search" className="sr-only">
            Rechercher
          </label>
          <input
            id="search"
            type="search"
            maxLength={100}
            className="input pl-[33px]"
            placeholder="Rechercher dans le titre ou la description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          aria-label="Priorité"
          className="input select w-auto flex-[0_1_210px]"
          value={priority ?? ''}
          onChange={(event) => updateParams({ priority: event.target.value || undefined })}
        >
          <option value="">Toutes les priorités</option>
          {PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          aria-label="Agent assigné"
          className="input select w-auto flex-[0_1_210px]"
          value={assignedTo ?? ''}
          onChange={(event) => updateParams({ assignedTo: event.target.value || undefined })}
        >
          <option value="">Tous les agents</option>
          {agents.data?.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {!data && tickets.isPending && <SkeletonRows />}
      {!data && tickets.isError && <BrokenState onRetry={() => tickets.refetch()} />}
      {data && data.data.length === 0 && (
        filtered ? (
          <EmptyState
            title="Aucun ticket ne correspond"
            text="Changez les filtres ou la recherche."
            action={
              <button type="button" className="btn" onClick={() => setSearchParams({})}>
                Effacer les filtres
              </button>
            }
          />
        ) : (
          <EmptyState title="Aucun ticket pour l’instant" text="Les tickets créés apparaîtront ici." />
        )
      )}
      {data && data.data.length > 0 && (
        <>
          <div className={`card overflow-x-auto transition-opacity ${tickets.isPlaceholderData ? 'opacity-60' : ''}`}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Assigné à</th>
                  <th>Échéance SLA</th>
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="min-w-[260px] whitespace-normal">
                      <Link to={`/tickets/${ticket.id}`} className="ticket-link">
                        {ticket.title}
                      </Link>
                    </td>
                    <td>
                      <StatusStamp status={ticket.status} />
                    </td>
                    <td>
                      <PriorityLabel priority={ticket.priority} />
                    </td>
                    <td className={ticket.assignedTo ? '' : 'text-pencil'}>{ticket.assignedTo?.name ?? 'Non assigné'}</td>
                    <td>
                      <SlaDue ticket={ticket} />
                    </td>
                    <td>{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            meta={data.meta}
            shown={data.data.length}
            page={page}
            onPageChange={(n) => updateParams({ page: n > 1 ? String(n) : undefined })}
          />
        </>
      )}

      {creating && <TicketSheet onClose={() => setCreating(false)} />}
    </div>
  );
}
