import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth.js';
import { ticketIdParams } from '../tickets/tickets.schemas.js';
import { createCommentSchema } from './comments.schemas.js';
import * as commentsService from './comments.service.js';

export async function list(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  res.json({ data: await commentsService.listComments(id) });
}

export async function create(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  const { message } = createCommentSchema.parse(req.body);
  res.status(201).json(await commentsService.addComment(id, message, currentUser(req)));
}
