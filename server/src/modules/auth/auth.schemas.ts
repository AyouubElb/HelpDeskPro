import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'Adresse e-mail invalide.' })),
  password: z.string().min(1, { error: 'Le mot de passe est requis.' }).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
