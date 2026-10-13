import axios from 'axios';
import type { ApiErrorBody } from '../../types';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) throw new Error('VITE_API_URL is missing from client/.env');

// The session is an httpOnly cookie: the browser sends it, the code never sees it.
export const api = axios.create({ baseURL, withCredentials: true, timeout: 10_000 });

// The API's messages are already in French and meant to be shown as is.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.error?.message;
    if (message) return message;
    if (!error.response) return 'Connexion impossible. Vérifiez votre réseau, puis réessayez.';
  }
  return 'Une erreur est survenue. Réessayez.';
}

// 400 here means a malformed id in the URL: for the reader, the ticket doesn't exist either.
export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400);
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {};
  const details = error.response?.data?.error?.details ?? [];
  return Object.fromEntries(details.map((detail) => [detail.field, detail.message]));
}
