import { z } from 'zod';
import { Role, TicketPriority, TicketStatus } from '../generated/prisma/client.js';
import { loginSchema } from '../modules/auth/auth.schemas.js';
import { ACCESS_TOKEN_COOKIE } from '../modules/auth/auth.tokens.js';
import { createCommentSchema } from '../modules/comments/comments.schemas.js';
import {
  assignTicketSchema,
  changeStatusSchema,
  createTicketSchema,
  updateTicketSchema,
} from '../modules/tickets/tickets.schemas.js';

/** Request bodies are generated from the Zod schemas the API validates with, so docs and validation cannot drift. */
function fromZod(schema: z.ZodType) {
  const { $schema: _dialect, ...jsonSchema } = z.toJSONSchema(schema, { io: 'input' });
  return jsonSchema;
}

const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const jsonContent = (schema: object) => ({ content: { 'application/json': { schema } } });
const requestBody = (schemaName: string) => ({ required: true, ...jsonContent(schemaRef(schemaName)) });
const response = (description: string, schemaName?: string) =>
  schemaName ? { description, ...jsonContent(schemaRef(schemaName)) } : { description };
const listResponse = (description: string, itemSchemaName: string) => ({
  description,
  ...jsonContent({
    type: 'object',
    properties: { data: { type: 'array', items: schemaRef(itemSchemaName) } },
    required: ['data'],
  }),
});
const errors = (...statuses: number[]) =>
  Object.fromEntries(statuses.map((status) => [status, { $ref: `#/components/responses/Error${status}` }]));
const errorResponse = (description: string) => ({ description, ...jsonContent(schemaRef('Error')) });

const uuid = { type: 'string', format: 'uuid' };
const dateTime = { type: 'string', format: 'date-time' };
const integer = { type: 'integer' };
const text = { type: 'string' };
const userRef = { type: 'object', properties: { id: uuid, name: text }, required: ['id', 'name'] };
const ticketIdParam = { name: 'id', in: 'path', required: true, schema: uuid, description: 'Identifiant du ticket' };

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'HelpDeskPro API',
    version: '1.0.0',
    description: [
      'API REST de gestion de tickets support avec suivi des délais de résolution (SLA).',
      '',
      '**Authentification** : appelez `POST /auth/login`. Le JWT est posé dans un cookie httpOnly',
      'et envoyé automatiquement avec chaque requête, y compris depuis cette page.',
      '',
      'Toutes les erreurs ont le format `{ "error": { "code", "message", "details?" } }`.',
    ].join('\n'),
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth', description: 'Connexion et session' },
    { name: 'Users', description: 'Personnel support' },
    { name: 'Dashboard', description: 'Indicateurs' },
    { name: 'Tickets', description: 'Cycle de vie des tickets' },
    { name: 'Comments', description: 'Historique des échanges' },
  ],
  security: [{ cookieAuth: [] }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: ACCESS_TOKEN_COOKIE,
        description: 'JWT posé par `POST /auth/login` dans un cookie httpOnly.',
      },
    },
    schemas: {
      LoginInput: fromZod(loginSchema),
      CreateTicketInput: fromZod(createTicketSchema),
      UpdateTicketInput: fromZod(updateTicketSchema),
      ChangeStatusInput: fromZod(changeStatusSchema),
      AssignTicketInput: fromZod(assignTicketSchema),
      CreateCommentInput: fromZod(createCommentSchema),
      User: {
        type: 'object',
        properties: {
          id: uuid,
          name: text,
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: Object.values(Role) },
        },
        required: ['id', 'name', 'email', 'role'],
      },
      Ticket: {
        type: 'object',
        properties: {
          id: uuid,
          title: text,
          description: text,
          status: { type: 'string', enum: Object.values(TicketStatus) },
          priority: { type: 'string', enum: Object.values(TicketPriority) },
          dueAt: { ...dateTime, description: 'Échéance SLA' },
          resolvedAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: dateTime,
          updatedAt: dateTime,
          createdBy: userRef,
          assignedTo: { oneOf: [userRef, { type: 'null' }] },
          slaStatus: {
            type: 'string',
            enum: ['on_track', 'overdue', 'met', 'breached'],
            description: 'État SLA calculé : dans les délais, en retard, respecté, dépassé',
          },
        },
        required: [
          'id',
          'title',
          'description',
          'status',
          'priority',
          'dueAt',
          'resolvedAt',
          'createdAt',
          'updatedAt',
          'createdBy',
          'assignedTo',
          'slaStatus',
        ],
      },
      TicketPage: {
        type: 'object',
        properties: {
          data: { type: 'array', items: schemaRef('Ticket') },
          meta: {
            type: 'object',
            properties: { page: integer, pageSize: integer, total: integer, totalPages: integer },
            required: ['page', 'pageSize', 'total', 'totalPages'],
          },
        },
        required: ['data', 'meta'],
      },
      Comment: {
        type: 'object',
        properties: {
          id: uuid,
          message: text,
          createdAt: dateTime,
          author: {
            type: 'object',
            properties: { id: uuid, name: text, role: { type: 'string', enum: Object.values(Role) } },
            required: ['id', 'name', 'role'],
          },
        },
        required: ['id', 'message', 'createdAt', 'author'],
      },
      DashboardStats: {
        type: 'object',
        properties: {
          total: integer,
          open: integer,
          inProgress: integer,
          overdue: { ...integer, description: 'Tickets open ou in_progress dont l’échéance est dépassée' },
          topAgents: {
            type: 'array',
            maxItems: 5,
            items: {
              type: 'object',
              properties: { id: uuid, name: text, resolvedCount: integer },
              required: ['id', 'name', 'resolvedCount'],
            },
          },
        },
        required: ['total', 'open', 'inProgress', 'overdue', 'topAgents'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', examples: ['TICKET_CLOSED'] },
              message: { type: 'string', examples: ['Impossible de commenter un ticket fermé.'] },
              details: {
                type: 'array',
                items: { type: 'object', properties: { field: text, message: text }, required: ['field', 'message'] },
              },
            },
            required: ['code', 'message'],
          },
        },
        required: ['error'],
      },
    },
    responses: {
      Error400: errorResponse('Données invalides (`VALIDATION_ERROR`) ou assignation à un non-agent (`INVALID_ASSIGNEE`)'),
      Error401: errorResponse('Session absente ou expirée (`UNAUTHORIZED`), identifiants incorrects (`INVALID_CREDENTIALS`)'),
      Error403: errorResponse('Action non autorisée pour ce rôle, ou origine refusée (`FORBIDDEN`)'),
      Error404: errorResponse('Ticket ou utilisateur introuvable (`NOT_FOUND`)'),
      Error409: errorResponse(
        "L'état du ticket interdit l'action (`INVALID_STATUS_TRANSITION`, `TICKET_CLOSED`, `TICKET_NOT_ASSIGNED`, `TICKET_FINISHED`, `TICKET_NOT_DELETABLE`, `TICKET_MODIFIED`)",
      ),
      Error429: errorResponse('Trop de tentatives de connexion (`TOO_MANY_REQUESTS`)'),
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Se connecter',
        description: 'Pose le JWT (8 h) dans un cookie httpOnly. Limité à 10 échecs par 15 minutes.',
        security: [],
        requestBody: requestBody('LoginInput'),
        responses: { 200: response('Utilisateur connecté', 'User'), ...errors(400, 401, 429) },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Utilisateur connecté',
        responses: { 200: response('Utilisateur courant', 'User'), ...errors(401) },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Se déconnecter',
        description: 'Supprime le cookie de session.',
        security: [],
        responses: { 204: response('Déconnecté') },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Lister le personnel',
        parameters: [{ name: 'role', in: 'query', schema: { type: 'string', enum: Object.values(Role) } }],
        responses: { 200: listResponse('Utilisateurs, sans mot de passe', 'User'), ...errors(400, 401) },
      },
    },
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Indicateurs du tableau de bord',
        responses: { 200: response('Indicateurs', 'DashboardStats'), ...errors(401) },
      },
    },
    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Lister les tickets',
        description: 'Filtres combinables et recherche dans le titre ou la description. Tri : plus récents d’abord.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: Object.values(TicketStatus) } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: Object.values(TicketPriority) } },
          { name: 'assignedTo', in: 'query', schema: uuid, description: "Identifiant de l'agent assigné" },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: { 200: response('Page de tickets', 'TicketPage'), ...errors(400, 401) },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Créer un ticket',
        description: 'Le ticket est créé `open` et non assigné ; son échéance SLA dépend de la priorité.',
        requestBody: requestBody('CreateTicketInput'),
        responses: { 201: response('Ticket créé', 'Ticket'), ...errors(400, 401) },
      },
    },
    '/tickets/{id}': {
      parameters: [ticketIdParam],
      get: {
        tags: ['Tickets'],
        summary: 'Détail d’un ticket',
        responses: { 200: response('Ticket', 'Ticket'), ...errors(400, 401, 404) },
      },
      put: {
        tags: ['Tickets'],
        summary: 'Modifier le contenu',
        description:
          'Admin, ou agent créateur ou assigné. Une nouvelle priorité recalcule l’échéance tant que le ticket est `open` ou `in_progress`.',
        requestBody: requestBody('UpdateTicketInput'),
        responses: { 200: response('Ticket modifié', 'Ticket'), ...errors(400, 401, 403, 404, 409) },
      },
      delete: {
        tags: ['Tickets'],
        summary: 'Supprimer un ticket',
        description: 'Admin uniquement, ticket `open` uniquement. Ses commentaires sont supprimés avec lui.',
        responses: { 204: response('Ticket supprimé'), ...errors(400, 401, 403, 404, 409) },
      },
    },
    '/tickets/{id}/status': {
      parameters: [ticketIdParam],
      patch: {
        tags: ['Tickets'],
        summary: 'Changer le statut',
        description:
          'Admin, ou agent assigné. Transitions : `open` → `in_progress` | `resolved`, `in_progress` → `resolved`, `resolved` → `in_progress` | `closed`. Quitter `open` exige un agent assigné.',
        requestBody: requestBody('ChangeStatusInput'),
        responses: { 200: response('Ticket mis à jour', 'Ticket'), ...errors(400, 401, 403, 404, 409) },
      },
    },
    '/tickets/{id}/assign': {
      parameters: [ticketIdParam],
      patch: {
        tags: ['Tickets'],
        summary: 'Assigner ou désassigner',
        description:
          'Admin uniquement. `assignedTo: null` désassigne : un ticket `in_progress` repasse alors `open`.',
        requestBody: requestBody('AssignTicketInput'),
        responses: { 200: response('Ticket mis à jour', 'Ticket'), ...errors(400, 401, 403, 404, 409) },
      },
    },
    '/tickets/{id}/comments': {
      parameters: [ticketIdParam],
      get: {
        tags: ['Comments'],
        summary: 'Historique des commentaires',
        description: 'Ordre chronologique.',
        responses: { 200: listResponse('Commentaires', 'Comment'), ...errors(400, 401, 404) },
      },
      post: {
        tags: ['Comments'],
        summary: 'Ajouter un commentaire',
        description: 'Refusé si le ticket est fermé.',
        requestBody: requestBody('CreateCommentInput'),
        responses: { 201: response('Commentaire ajouté', 'Comment'), ...errors(400, 401, 404, 409) },
      },
    },
  },
};
