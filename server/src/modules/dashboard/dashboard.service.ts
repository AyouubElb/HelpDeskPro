import { prisma } from '../../lib/prisma.js';
import { ACTIVE_STATUSES, FINISHED_STATUSES } from '../tickets/transitions.js';

const TOP_AGENTS_LIMIT = 5;

export async function getStats() {
  const [total, open, inProgress, overdue, ranking] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'open' } }),
    prisma.ticket.count({ where: { status: 'in_progress' } }),
    prisma.ticket.count({ where: { status: { in: ACTIVE_STATUSES }, dueAt: { lt: new Date() } } }),
    // Closed tickets still count: closing a resolved ticket never lowers the agent's score.
    prisma.ticket.groupBy({
      by: ['assignedToId'],
      where: { status: { in: FINISHED_STATUSES }, assignedToId: { not: null } },
      _count: { _all: true },
      orderBy: [{ _count: { assignedToId: 'desc' } }, { assignedToId: 'asc' }],
      take: TOP_AGENTS_LIMIT,
    }),
  ]);

  const agentIds = ranking.flatMap((row) => (row.assignedToId ? [row.assignedToId] : []));
  const agents = await prisma.user.findMany({ where: { id: { in: agentIds } }, select: { id: true, name: true } });
  const nameById = new Map(agents.map((agent) => [agent.id, agent.name]));

  const topAgents = ranking.flatMap((row) =>
    row.assignedToId
      ? [{ id: row.assignedToId, name: nameById.get(row.assignedToId) ?? '', resolvedCount: row._count._all }]
      : [],
  );

  return { total, open, inProgress, overdue, topAgents };
}
