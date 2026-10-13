import type { TicketPriority, TicketStatus } from '../src/generated/prisma/client.js';
import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/modules/auth/password.js';
import { computeDueAt } from '../src/modules/tickets/sla.js';

const SLA_HOURS: Record<TicketPriority, number> = { high: 4, medium: 24, low: 72 };

// Dates are relative to now, so SLA states (overdue, met, breached) stay meaningful whenever the seed runs.
const HOUR_MS = 60 * 60 * 1000;
const seededAt = Date.now();
const hoursAgo = (hours: number) => new Date(seededAt - hours * HOUR_MS);

type Staff = 'admin' | 'youssef' | 'sara';

interface SeedTicket {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: Staff;
  assignedTo?: Exclude<Staff, 'admin'>;
  createdHoursAgo: number;
  resolvedHoursAgo?: number;
  closedHoursAgo?: number;
  comments: [author: Staff, hoursAgo: number, message: string][];
}

const tickets: SeedTicket[] = [
  {
    title: 'Erreur 504 sur la page de paiement',
    description:
      'Le client Atlas Logistique signale que la page de paiement renvoie « ERR504 Gateway Timeout » depuis ce matin. Plusieurs commandes sont bloquées.',
    priority: 'high',
    status: 'open',
    createdBy: 'admin',
    createdHoursAgo: 2,
    comments: [['admin', 1.5, 'Le client confirme que tous ses utilisateurs sont touchés.']],
  },
  {
    title: "Factures de septembre introuvables dans l'espace client",
    description:
      "Le client Riad Immobilier ne voit plus ses factures de septembre dans l'onglet Facturation. Les factures d'août s'affichent correctement.",
    priority: 'medium',
    status: 'open',
    createdBy: 'sara',
    createdHoursAgo: 30,
    comments: [
      ['sara', 29, "Le client a envoyé une capture d'écran de l'onglet Facturation vide."],
      ['admin', 20, 'À répartir en priorité demain matin.'],
    ],
  },
  {
    title: "Changement d'adresse de livraison",
    description:
      'Le client Café Zitoun souhaite modifier l’adresse de livraison par défaut de son compte : nouveau local à Rabat, quartier Agdal.',
    priority: 'low',
    status: 'open',
    createdBy: 'admin',
    assignedTo: 'youssef',
    createdHoursAgo: 10,
    comments: [['admin', 9, 'La nouvelle adresse a été transmise par e-mail par le client.']],
  },
  {
    title: 'Impossible de se connecter au portail client',
    description:
      'Depuis la mise à jour d’hier soir, les utilisateurs de Maroc Textiles reçoivent « Identifiants invalides » alors que leurs mots de passe sont corrects.',
    priority: 'high',
    status: 'in_progress',
    createdBy: 'youssef',
    assignedTo: 'youssef',
    createdHoursAgo: 6,
    comments: [
      ['youssef', 5, 'Reproduit en préproduction : les e-mails saisis en majuscules ne sont plus reconnus.'],
      ['admin', 3, 'Le client relance : 40 utilisateurs sont bloqués.'],
      ['youssef', 1, 'Correctif en cours de validation.'],
    ],
  },
  {
    title: 'Imprimante réseau hors ligne chez le client',
    description:
      "L'imprimante réseau du service comptabilité d'Atlas Logistique n'apparaît plus sur le réseau depuis une coupure de courant.",
    priority: 'medium',
    status: 'in_progress',
    createdBy: 'admin',
    assignedTo: 'sara',
    createdHoursAgo: 5,
    comments: [
      ['sara', 4, 'Prise en main à distance planifiée avec le responsable informatique du client.'],
      ['sara', 2, "L'adresse IP de l'imprimante a changé après la coupure : reconfiguration en cours."],
    ],
  },
  {
    title: "L'application mobile se ferme au démarrage",
    description:
      "L'application mobile se ferme dès son lancement sur Android 15 pour les utilisateurs de Pharmacie Al Amal.",
    priority: 'high',
    status: 'resolved',
    createdBy: 'sara',
    assignedTo: 'youssef',
    createdHoursAgo: 50,
    resolvedHoursAgo: 47,
    comments: [
      ['youssef', 49, 'Plantage identifié : permission de notifications manquante sur Android 15.'],
      ['youssef', 47, 'Version 3.2.1 publiée, le client confirme que l’application démarre.'],
    ],
  },
  {
    title: 'Export CSV des commandes vide',
    description:
      "L'export CSV des commandes du mois génère un fichier vide pour le client Souk Digital, alors que 230 commandes s'affichent à l'écran.",
    priority: 'medium',
    status: 'resolved',
    createdBy: 'admin',
    assignedTo: 'sara',
    createdHoursAgo: 80,
    resolvedHoursAgo: 40,
    comments: [
      ['sara', 70, "Le filtre de dates de l'export ignore le fuseau horaire : correctif à prévoir."],
      ['sara', 40, 'Correctif déployé, export vérifié avec le client.'],
    ],
  },
  {
    title: "Ajout d'un utilisateur au compte entreprise",
    description: "Le client Atlas Logistique demande un accès pour sa nouvelle assistante de direction.",
    priority: 'low',
    status: 'closed',
    createdBy: 'youssef',
    assignedTo: 'youssef',
    createdHoursAgo: 200,
    resolvedHoursAgo: 150,
    closedHoursAgo: 140,
    comments: [
      ['youssef', 150, 'Accès créé, identifiants envoyés au responsable du compte.'],
      ['admin', 145, "Le client confirme que l'accès fonctionne."],
    ],
  },
  {
    title: 'Site vitrine inaccessible',
    description:
      'Le site vitrine de Riad Immobilier affiche une erreur de certificat SSL : les visiteurs ne peuvent plus y accéder.',
    priority: 'high',
    status: 'closed',
    createdBy: 'admin',
    assignedTo: 'sara',
    createdHoursAgo: 100,
    resolvedHoursAgo: 90,
    closedHoursAgo: 80,
    comments: [
      ['sara', 98, 'Certificat expiré : le renouvellement automatique a échoué.'],
      ['admin', 95, 'Le client demande une estimation du délai.'],
      ['sara', 90, 'Certificat renouvelé et renouvellement automatique réparé.'],
    ],
  },
  {
    title: 'Notifications SMS non reçues',
    description: 'Les clients de Pharmacie Al Amal ne reçoivent plus les SMS de confirmation de commande.',
    priority: 'medium',
    status: 'closed',
    createdBy: 'sara',
    assignedTo: 'youssef',
    createdHoursAgo: 150,
    resolvedHoursAgo: 130,
    closedHoursAgo: 120,
    comments: [
      ['youssef', 140, 'Le quota mensuel du fournisseur SMS était atteint.'],
      ['youssef', 130, 'Quota augmenté, les SMS sont de nouveau envoyés.'],
    ],
  },
];

async function main() {
  // Start from an empty database so the seed can be re-run at any time.
  await prisma.$transaction([
    prisma.ticketComment.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.user.deleteMany(),
    prisma.slaPolicy.deleteMany(),
  ]);

  await prisma.slaPolicy.createMany({
    data: Object.entries(SLA_HOURS).map(([priority, resolutionHours]) => ({
      priority: priority as TicketPriority,
      resolutionHours,
    })),
  });

  const [adminHash, agentHash] = await Promise.all([hashPassword('Admin123!'), hashPassword('Agent123!')]);
  const [admin, youssef, sara] = await prisma.$transaction([
    prisma.user.create({
      data: { name: 'Nadia Benali', email: 'admin@helpdeskpro.ma', passwordHash: adminHash, role: 'admin' },
    }),
    prisma.user.create({
      data: { name: 'Youssef Amrani', email: 'youssef@helpdeskpro.ma', passwordHash: agentHash, role: 'agent' },
    }),
    prisma.user.create({
      data: { name: 'Sara El Idrissi', email: 'sara@helpdeskpro.ma', passwordHash: agentHash, role: 'agent' },
    }),
  ]);
  const staff: Record<Staff, string> = { admin: admin.id, youssef: youssef.id, sara: sara.id };

  for (const ticket of tickets) {
    const createdAt = hoursAgo(ticket.createdHoursAgo);
    // A closed ticket never changes again: its last update is its closing date.
    const lastActivityHoursAgo = Math.min(
      ticket.createdHoursAgo,
      ticket.resolvedHoursAgo ?? Infinity,
      ticket.closedHoursAgo ?? Infinity,
      ...ticket.comments.map(([, hours]) => hours),
    );

    await prisma.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        createdById: staff[ticket.createdBy],
        assignedToId: ticket.assignedTo ? staff[ticket.assignedTo] : null,
        createdAt,
        dueAt: computeDueAt(createdAt, SLA_HOURS[ticket.priority]),
        resolvedAt: ticket.resolvedHoursAgo === undefined ? null : hoursAgo(ticket.resolvedHoursAgo),
        updatedAt: hoursAgo(lastActivityHoursAgo),
        comments: {
          create: ticket.comments.map(([author, hours, message]) => ({
            authorId: staff[author],
            message,
            createdAt: hoursAgo(hours),
          })),
        },
      },
    });
  }

  const commentCount = tickets.reduce((sum, ticket) => sum + ticket.comments.length, 0);
  console.log(`Seed done: 3 SLA policies, 3 users, ${tickets.length} tickets, ${commentCount} comments.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
