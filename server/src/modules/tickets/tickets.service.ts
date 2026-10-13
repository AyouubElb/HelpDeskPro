import type { Prisma, TicketPriority, TicketStatus } from '../../generated/prisma/client.js';
import { badRequest, conflict, forbidden, notFound } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../auth/auth.tokens.js';
import { computeDueAt, getSlaStatus } from './sla.js';
import type { CreateTicketInput, ListTicketsQuery, UpdateTicketInput } from './tickets.schemas.js';
import { ALLOWED_FROM, FINISHED_STATUSES, STATUS_LABELS, isActive } from './transitions.js';

const ticketSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueAt: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, name: true } },
} satisfies Prisma.TicketSelect;

type TicketRow = Prisma.TicketGetPayload<{ select: typeof ticketSelect }>;

const toTicketDto = (ticket: TicketRow, now = new Date()) => ({ ...ticket, slaStatus: getSlaStatus(ticket, now) });

/** The columns the business rules depend on. */
const ticketStateSelect = {
  status: true,
  priority: true,
  createdById: true,
  assignedToId: true,
  createdAt: true,
} satisfies Prisma.TicketSelect;

type TicketState = Prisma.TicketGetPayload<{ select: typeof ticketStateSelect }>;

async function findTicketState(id: string): Promise<TicketState> {
  const ticket = await prisma.ticket.findUnique({ where: { id }, select: ticketStateSelect });
  if (!ticket) throw notFound('Ticket introuvable.');
  return ticket;
}

/**
 * Check-then-write without a race: `write` runs an updateMany/deleteMany whose WHERE clause
 * repeats the rules enforced by `check`, so it only applies to the state that was checked.
 * If no row matches, the ticket changed in between: the rules run again on fresh data to
 * report the precise reason.
 */
async function guardedWrite(
  id: string,
  check: (ticket: TicketState) => void,
  write: (ticket: TicketState) => Promise<{ count: number }>,
) {
  const ticket = await findTicketState(id);
  check(ticket);
  if ((await write(ticket)).count > 0) return;

  check(await findTicketState(id));
  throw conflict('TICKET_MODIFIED', 'Le ticket a été modifié entre-temps. Rechargez la page et réessayez.');
}

async function getResolutionHours(priority: TicketPriority) {
  const policy = await prisma.slaPolicy.findUniqueOrThrow({ where: { priority } });
  return policy.resolutionHours;
}

export async function listTickets({ status, priority, assignedTo, search, page, pageSize }: ListTicketsQuery) {
  const where: Prisma.TicketWhereInput = {
    status,
    priority,
    assignedToId: assignedTo,
    // Served by the trigram GIN indexes on title and description.
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: ticketSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  const now = new Date();
  return {
    data: tickets.map((ticket) => toTicketDto(ticket, now)),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getTicket(id: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, select: ticketSelect });
  if (!ticket) throw notFound('Ticket introuvable.');
  return toTicketDto(ticket);
}

export async function createTicket(input: CreateTicketInput, user: AuthUser) {
  const createdAt = new Date();
  const ticket = await prisma.ticket.create({
    data: {
      ...input,
      createdById: user.id,
      createdAt,
      dueAt: computeDueAt(createdAt, await getResolutionHours(input.priority)),
    },
    select: ticketSelect,
  });
  return toTicketDto(ticket);
}

export async function updateTicket(id: string, input: UpdateTicketInput, user: AuthUser) {
  await guardedWrite(
    id,
    (ticket) => {
      const isOwner = ticket.createdById === user.id || ticket.assignedToId === user.id;
      if (user.role !== 'admin' && !isOwner) {
        throw forbidden('Vous ne pouvez modifier que les tickets que vous avez créés ou qui vous sont assignés.');
      }
      if (ticket.status === 'closed') throw conflict('TICKET_CLOSED', 'Un ticket fermé ne peut plus être modifié.');
    },
    async (ticket) => {
      // A new priority moves the deadline only while the ticket is still being worked on.
      const dueAt =
        isActive(ticket.status) && input.priority !== ticket.priority
          ? computeDueAt(ticket.createdAt, await getResolutionHours(input.priority))
          : undefined;
      return prisma.ticket.updateMany({
        where: { id, status: ticket.status, assignedToId: ticket.assignedToId },
        data: { ...input, dueAt },
      });
    },
  );
  return getTicket(id);
}

function checkStatusChange(ticket: TicketState, target: TicketStatus, user: AuthUser) {
  if (user.role === 'agent' && ticket.assignedToId !== user.id) {
    throw forbidden("Seul l'agent assigné peut changer le statut de ce ticket.");
  }
  if (ticket.status === 'closed') {
    throw conflict('TICKET_CLOSED', 'Un ticket fermé ne peut plus changer de statut.');
  }
  if (!ALLOWED_FROM[target].includes(ticket.status)) {
    throw conflict(
      'INVALID_STATUS_TRANSITION',
      `Transition impossible : ${STATUS_LABELS[ticket.status]} → ${STATUS_LABELS[target]}.`,
    );
  }
  if (ticket.assignedToId === null) {
    throw conflict('TICKET_NOT_ASSIGNED', 'Assignez un agent avant de démarrer ou de résoudre ce ticket.');
  }
}

export async function changeStatus(id: string, target: TicketStatus, user: AuthUser) {
  await guardedWrite(
    id,
    (ticket) => checkStatusChange(ticket, target, user),
    () =>
      prisma.ticket.updateMany({
        where: {
          id,
          status: { in: ALLOWED_FROM[target] },
          assignedToId: user.role === 'agent' ? user.id : { not: null },
        },
        data: {
          status: target,
          ...(target === 'resolved' && { resolvedAt: new Date() }),
          ...(target === 'in_progress' && { resolvedAt: null }),
        },
      }),
  );
  return getTicket(id);
}

async function checkAssignee(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw notFound('Utilisateur introuvable.');
  if (user.role !== 'agent') throw badRequest('INVALID_ASSIGNEE', 'Seul un agent peut être assigné à un ticket.');
}

export async function assignTicket(id: string, assigneeId: string | null) {
  if (assigneeId) await checkAssignee(assigneeId);

  await guardedWrite(
    id,
    (ticket) => {
      if (FINISHED_STATUSES.includes(ticket.status)) {
        throw conflict('TICKET_FINISHED', "Un ticket résolu ou fermé ne peut pas être réassigné : rouvrez-le d'abord.");
      }
    },
    (ticket) =>
      prisma.ticket.updateMany({
        where: { id, status: ticket.status },
        // Nobody works on an unassigned ticket anymore, so it goes back to open.
        data: assigneeId ? { assignedToId: assigneeId } : { assignedToId: null, status: 'open' },
      }),
  );
  return getTicket(id);
}

export async function deleteTicket(id: string) {
  await guardedWrite(
    id,
    (ticket) => {
      if (ticket.status !== 'open') {
        throw conflict(
          'TICKET_NOT_DELETABLE',
          "Seul un ticket ouvert peut être supprimé : un ticket traité fait partie de l'historique.",
        );
      }
    },
    () => prisma.ticket.deleteMany({ where: { id, status: 'open' } }),
  );
}
