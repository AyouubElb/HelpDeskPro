import { Router } from 'express';
import { authenticate } from './middlewares/auth.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { ticketsRouter } from './modules/tickets/tickets.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authenticate, usersRouter);
apiRouter.use('/dashboard', authenticate, dashboardRouter);
apiRouter.use('/tickets', authenticate, ticketsRouter);
