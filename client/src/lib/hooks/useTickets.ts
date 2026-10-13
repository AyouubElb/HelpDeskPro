import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ticketsApi } from '../api/tickets.api';
import { dashboardKeys } from './useStaff';
import type { Ticket, TicketParams, TicketStatus } from '../../types';
import type { TicketInput } from '../schemas/ticket.schema';

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: TicketParams) => [...ticketKeys.lists(), params] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
  comments: (id: string) => [...ticketKeys.all, 'comments', id] as const,
};

export function useTickets(params: TicketParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketsApi.list(params),
    // The old page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useTicket(id: string) {
  return useQuery({ queryKey: ticketKeys.detail(id), queryFn: () => ticketsApi.get(id) });
}

export function useComments(id: string) {
  return useQuery({ queryKey: ticketKeys.comments(id), queryFn: () => ticketsApi.comments(id) });
}

// A changed ticket is put in the cache as is; lists and indicators are refetched.
function useTicketChanged() {
  const queryClient = useQueryClient();
  return (ticket: Ticket) => {
    queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
    queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
  };
}

export function useCreateTicket() {
  const onChanged = useTicketChanged();
  return useMutation({
    mutationFn: ticketsApi.create,
    meta: { inlineError: true },
    onSuccess: (ticket) => {
      onChanged(ticket);
      toast.success('Ticket créé.');
    },
  });
}

export function useUpdateTicket(id: string) {
  const onChanged = useTicketChanged();
  return useMutation({
    mutationFn: (body: TicketInput) => ticketsApi.update(id, body),
    meta: { inlineError: true },
    onSuccess: (ticket) => {
      onChanged(ticket);
      toast.success('Ticket modifié.');
    },
  });
}

const STATUS_DONE: Record<TicketStatus, string> = {
  open: 'Ticket ouvert.',
  in_progress: 'Ticket passé en cours.',
  resolved: 'Ticket marqué résolu.',
  closed: 'Ticket fermé.',
};

export function useChangeStatus(id: string) {
  const onChanged = useTicketChanged();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => ticketsApi.changeStatus(id, status),
    meta: { inlineError: true },
    onSuccess: (ticket) => {
      onChanged(ticket);
      toast.success(STATUS_DONE[ticket.status]);
    },
    // e.g. 409: someone changed the ticket meanwhile, so show its real state.
    onError: () => queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
  });
}

export function useAssignTicket(id: string) {
  const onChanged = useTicketChanged();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string | null) => ticketsApi.assign(id, assignedTo),
    meta: { inlineError: true },
    onSuccess: (ticket) => {
      onChanged(ticket);
      toast.success(ticket.assignedTo ? `Ticket assigné à ${ticket.assignedTo.name}.` : 'Agent retiré du ticket.');
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticket: Ticket) => ticketsApi.remove(ticket.id),
    meta: { inlineError: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      toast.success('Ticket supprimé.');
    },
  });
}

export function useAddComment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => ticketsApi.addComment(id, message),
    meta: { inlineError: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.comments(id) });
      toast.success('Commentaire ajouté.');
    },
  });
}
