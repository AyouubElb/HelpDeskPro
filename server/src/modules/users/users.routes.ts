import { Router } from 'express';
import * as usersController from './users.controller.js';

export const usersRouter = Router();

usersRouter.get('/', usersController.list);
