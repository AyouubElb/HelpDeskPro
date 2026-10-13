import type { Prisma } from '../../generated/prisma/client.js';
import { conflict, notFound } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../auth/auth.tokens.js';

const commentSelect = {
  id: true,
  message: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
} satisfies Prisma.TicketCommentSelect;

async function findTicketStatus(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { status: true } });
  if (!ticket) throw notFound('Ticket introuvable.');
  return ticket.status;
}

export async function listComments(ticketId: string) {
  await findTicketStatus(ticketId);
  return prisma.ticketComment.findMany({
    where: { ticketId },
    select: commentSelect,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
}

export async function addComment(ticketId: string, message: string, user: AuthUser) {
  if ((await findTicketStatus(ticketId)) === 'closed') {
    throw conflict('TICKET_CLOSED', 'Impossible de commenter un ticket fermé.');
  }
  return prisma.ticketComment.create({
    data: { ticketId, authorId: user.id, message },
    select: commentSelect,
  });
}
