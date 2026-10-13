import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Indiquez une adresse e-mail valide.'),
  password: z.string().min(1, 'Indiquez votre mot de passe.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
