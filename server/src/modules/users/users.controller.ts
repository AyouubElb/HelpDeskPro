import type { Request, Response } from 'express';
import { listUsersQuery } from './users.schemas.js';
import * as usersService from './users.service.js';

export async function list(req: Request, res: Response) {
  const { role } = listUsersQuery.parse(req.query);
  res.json({ data: await usersService.listUsers(role) });
}
