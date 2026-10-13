import type { Prisma, Role } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';

/** Public user fields: the password hash is never selected. */
export const publicUserSelect = { id: true, name: true, email: true, role: true } satisfies Prisma.UserSelect;

export function listUsers(role?: Role) {
  return prisma.user.findMany({ where: { role }, select: publicUserSelect, orderBy: { name: 'asc' } });
}
