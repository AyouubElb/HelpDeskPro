import { z } from 'zod';
import { Role } from '../../generated/prisma/client.js';

export const listUsersQuery = z.object({
  role: z.enum(Role).optional(),
});
