import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { env } from './config/env.js';
import { openApiDocument } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';
import { originCheck } from './middlewares/origin-check.js';
import { apiRouter } from './routes.js';

// The UI displays API messages as is, validation messages included.
z.config(z.locales.fr());

export const app = express();

app.use(
  helmet({
    // Swagger UI is served over plain HTTP locally and in Docker.
    contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
  }),
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use(originCheck);

app.get('/api/docs.json', (_req, res) => {
  res.json(openApiDocument);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'HelpDeskPro API' }));
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
