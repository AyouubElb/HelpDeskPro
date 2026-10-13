import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth.js';
import {
  assignTicketSchema,
  changeStatusSchema,
  createTicketSchema,
  listTicketsQuery,
  ticketIdParams,
  updateTicketSchema,
} from './tickets.schemas.js';
import * as ticketsService from './tickets.service.js';

export async function list(req: Request, res: Response) {
  res.json(await ticketsService.listTickets(listTicketsQuery.parse(req.query)));
}

export async function getById(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  res.json(await ticketsService.getTicket(id));
}

export async function create(req: Request, res: Response) {
  const ticket = await ticketsService.createTicket(createTicketSchema.parse(req.body), currentUser(req));
  res.status(201).json(ticket);
}

export async function update(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  res.json(await ticketsService.updateTicket(id, updateTicketSchema.parse(req.body), currentUser(req)));
}

export async function changeStatus(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  const { status } = changeStatusSchema.parse(req.body);
  res.json(await ticketsService.changeStatus(id, status, currentUser(req)));
}

export async function assign(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  const { assignedTo } = assignTicketSchema.parse(req.body);
  res.json(await ticketsService.assignTicket(id, assignedTo));
}

export async function remove(req: Request, res: Response) {
  const { id } = ticketIdParams.parse(req.params);
  await ticketsService.deleteTicket(id);
  res.status(204).end();
}
