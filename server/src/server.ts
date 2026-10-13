import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.PORT, (error) => {
  if (error) throw error;
  console.log(`HelpDeskPro API on http://localhost:${env.PORT} (docs: /api/docs)`);
});

// Finish in-flight requests, then release the database pool.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => void prisma.$disconnect().finally(() => process.exit(0)));
  });
}
