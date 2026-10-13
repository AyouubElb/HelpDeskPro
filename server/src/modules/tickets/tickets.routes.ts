import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { commentsRouter } from '../comments/comments.routes.js';
import * as ticketsController from './tickets.controller.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', ticketsController.list);
ticketsRouter.post('/', ticketsController.create);
ticketsRouter.get('/:id', ticketsController.getById);
ticketsRouter.put('/:id', ticketsController.update);
ticketsRouter.delete('/:id', requireRole('admin'), ticketsController.remove);
ticketsRouter.patch('/:id/status', ticketsController.changeStatus);
ticketsRouter.patch('/:id/assign', requireRole('admin'), ticketsController.assign);
ticketsRouter.use('/:id/comments', commentsRouter);
