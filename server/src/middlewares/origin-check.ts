import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { forbidden } from '../lib/errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const clientOrigin = new URL(env.CLIENT_URL).origin;

/**
 * CSRF protection for the cookie session: rejects state-changing requests that a browser
 * sends from another site. Modern browsers send Sec-Fetch-Site; older ones only send Origin.
 * Requests with neither header come from non-browser clients (curl, tests), which CSRF cannot abuse.
 */
export const originCheck: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const fetchSite = req.get('sec-fetch-site');
  const origin = req.get('origin');

  if (fetchSite === 'same-origin' || fetchSite === 'none') return next();
  if (origin === clientOrigin) return next();
  if (fetchSite === undefined && (origin === undefined || isSameHost(origin, req.get('host')))) return next();

  throw forbidden('Origine de la requête non autorisée.');
};

function isSameHost(origin: string, host: string | undefined): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false; // "null" or malformed Origin
  }
}
