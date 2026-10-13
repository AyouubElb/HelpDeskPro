import { z } from 'zod';

export const createCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { error: 'Le commentaire ne peut pas être vide.' })
    .max(2000, { error: 'Le commentaire ne doit pas dépasser 2000 caractères.' }),
});
