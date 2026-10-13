export type Role = 'admin' | 'agent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type SlaStatus = 'on_track' | 'overdue' | 'met' | 'breached';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface UserRef {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  dueAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserRef;
  assignedTo: UserRef | null;
  slaStatus: SlaStatus;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TicketPage {
  data: Ticket[];
  meta: PageMeta;
}

export interface TicketParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface Comment {
  id: string;
  message: string;
  createdAt: string;
  author: UserRef & { role: Role };
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
  topAgents: { id: string; name: string; resolvedCount: number }[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
