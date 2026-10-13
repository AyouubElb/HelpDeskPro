import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { PlusIcon } from '../components/Icons';
import { BrokenState, PageHead, SkeletonRows } from '../components/PageStates';
import { LateStamp, StatusStamp } from '../components/TicketBadges';
import TicketSheet from '../components/TicketSheet';
import { formatToday, plural } from '../lib/format';
import { useDashboardStats } from '../lib/hooks/useStaff';
import { useTickets } from '../lib/hooks/useTickets';

function Tile({ label, value, sub, late = false }: { label: string; value: number; sub: ReactNode; late?: boolean }) {
  return (
    <div className={`card grid gap-[5px] p-3.5 ${late ? 'border-red' : ''}`}>
      <span className="text-[12.5px] text-pencil">{label}</span>
      <b className={`text-2xl leading-tight font-bold tracking-[-0.01em] tabular-nums ${late ? 'text-red' : ''}`}>{value}</b>
      <span className="text-[12.5px] text-pencil">{sub}</span>
    </div>
  );
}

const tileLink = 'font-semibold underline decoration-[1.5px] underline-offset-3';

export default function DashboardPage() {
  const stats = useDashboardStats();
  const recent = useTickets({ pageSize: 5 });
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        crumb={formatToday()}
        title="Tableau de bord"
        action={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <PlusIcon />
            Nouveau ticket
          </button>
        }
      />

      {stats.isPending && <SkeletonRows rows={3} />}
      {stats.isError && <BrokenState onRetry={() => stats.refetch()} />}
      {stats.data && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
            <Tile label="Tickets au total" value={stats.data.total} sub="Tous statuts confondus" />
            <Tile
              label="Ouverts"
              value={stats.data.open}
              sub={<Link to="/tickets?status=open" className={tileLink}>Voir les tickets ouverts</Link>}
            />
            <Tile
              label="En cours"
              value={stats.data.inProgress}
              sub={<Link to="/tickets?status=in_progress" className={tileLink}>Voir les tickets en cours</Link>}
            />
            <Tile
              label="En retard"
              value={stats.data.overdue}
              sub="Échéance SLA dépassée, pas encore résolus"
              late={stats.data.overdue > 0}
            />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-4">
            <section className="card panel">
              <h2 className="cap">Top 5 des agents</h2>
              <p className="hint">Tickets résolus ou fermés, par agent assigné.</p>
              {stats.data.topAgents.length === 0 ? (
                <p className="text-pencil">Aucun ticket résolu pour l’instant.</p>
              ) : (
                <ol className="grid">
                  {stats.data.topAgents.map((agent, index) => (
                    <li
                      key={agent.id}
                      className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-[9px] tabular-nums last:border-b-0"
                    >
                      <span className="font-mono text-xs text-pencil">{String(index + 1).padStart(2, '0')}</span>
                      <span>{agent.name}</span>
                      <span className="font-semibold">{plural(agent.resolvedCount, 'ticket')}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="card panel">
              <h2 className="cap">Tickets récents</h2>
              <p className="hint">Les 5 derniers tickets créés.</p>
              {recent.isError && <p className="text-pencil">Les tickets récents n’ont pas pu s’afficher.</p>}
              {recent.data?.data.length === 0 && <p className="text-pencil">Aucun ticket pour l’instant.</p>}
              {recent.data && recent.data.data.length > 0 && (
                <ul className="grid">
                  {recent.data.data.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-[9px] last:border-b-0"
                    >
                      <Link to={`/tickets/${ticket.id}`} className="ticket-link">
                        {ticket.title}
                      </Link>
                      <span className="flex flex-wrap items-center gap-2">
                        <StatusStamp status={ticket.status} />
                        {ticket.slaStatus === 'overdue' && <LateStamp />}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {creating && <TicketSheet onClose={() => setCreating(false)} />}
    </div>
  );
}
