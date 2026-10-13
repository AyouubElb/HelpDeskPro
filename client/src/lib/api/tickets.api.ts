import { api } from './client';
import type { Comment, Ticket, TicketPage, TicketParams, TicketStatus } from '../../types';
import type { TicketInput } from '../schemas/ticket.schema';

export const ticketsApi = {
  // axios leaves undefined params out of the URL.
  list: async (params: TicketParams): Promise<TicketPage> => {
    const { data } = await api.get<TicketPage>('/tickets', { params });
    return data;
  },

  get: async (id: string): Promise<Ticket> => {
    const { data } = await api.get<Ticket>(`/tickets/${id}`);
    return data;
  },

  create: async (body: TicketInput): Promise<Ticket> => {
    const { data } = await api.post<Ticket>('/tickets', body);
    return data;
  },

  update: async (id: string, body: TicketInput): Promise<Ticket> => {
    const { data } = await api.put<Ticket>(`/tickets/${id}`, body);
    return data;
  },

  changeStatus: async (id: string, status: TicketStatus): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/tickets/${id}/status`, { status });
    return data;
  },

  assign: async (id: string, assignedTo: string | null): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/tickets/${id}/assign`, { assignedTo });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },

  comments: async (id: string): Promise<Comment[]> => {
    const { data } = await api.get<{ data: Comment[] }>(`/tickets/${id}/comments`);
    return data.data;
  },

  addComment: async (id: string, message: string): Promise<Comment> => {
    const { data } = await api.post<Comment>(`/tickets/${id}/comments`, { message });
    return data;
  },
};
