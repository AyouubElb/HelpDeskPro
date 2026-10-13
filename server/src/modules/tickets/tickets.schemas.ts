import { z } from 'zod';
import { TicketPriority, TicketStatus } from '../../generated/prisma/client.js';

export const ticketIdParams = z.object({
  id: z.uuid({ error: 'Identifiant de ticket invalide.' }),
});

const title = z
  .string()
  .trim()
  .min(3, { error: 'Le titre doit contenir au moins 3 caractères.' })
  .max(150, { error: 'Le titre ne doit pas dépasser 150 caractères.' });

const description = z
  .string()
  .trim()
  .min(10, { error: 'La description doit contenir au moins 10 caractères.' })
  .max(5000, { error: 'La description ne doit pas dépasser 5000 caractères.' });

const priority = z.enum(TicketPriority);

export const createTicketSchema = z.object({ title, description, priority: priority.default('medium') });

export const updateTicketSchema = z.object({ title, description, priority });

export const changeStatusSchema = z.object({ status: z.enum(TicketStatus) });

export const assignTicketSchema = z.object({ assignedTo: z.uuid().nullable() });

export const listTicketsQuery = z.object({
  status: z.enum(TicketStatus).optional(),
  priority: z.enum(TicketPriority).optional(),
  assignedTo: z.uuid().optional(),
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuery>;
