import { z } from 'zod';

// Same limits as the API, so most mistakes show before the request.
export const ticketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Le titre doit contenir au moins 3 caractères.')
    .max(150, 'Le titre ne doit pas dépasser 150 caractères.'),
  description: z
    .string()
    .trim()
    .min(10, 'La description doit contenir au moins 10 caractères.')
    .max(5000, 'La description ne doit pas dépasser 5000 caractères.'),
  priority: z.enum(['low', 'medium', 'high']),
});

export type TicketInput = z.infer<typeof ticketSchema>;

export const commentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Écrivez un message.')
    .max(2000, 'Le commentaire ne doit pas dépasser 2000 caractères.'),
});

export type CommentInput = z.infer<typeof commentSchema>;
