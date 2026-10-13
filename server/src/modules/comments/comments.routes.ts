import { Router } from 'express';
import * as commentsController from './comments.controller.js';

// Mounted under /tickets/:id/comments: mergeParams exposes the ticket id.
export const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', commentsController.list);
commentsRouter.post('/', commentsController.create);
