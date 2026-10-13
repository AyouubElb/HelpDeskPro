import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', dashboardController.stats);
