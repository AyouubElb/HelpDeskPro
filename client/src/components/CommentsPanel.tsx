import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Field from './Field';
import { getErrorMessage } from '../lib/api/client';
import { ROLE_LABELS, formatDateTime } from '../lib/format';
import { useAddComment, useComments } from '../lib/hooks/useTickets';
import { commentSchema, type CommentInput } from '../lib/schemas/ticket.schema';
import type { Ticket } from '../types';

export default function CommentsPanel({ ticket }: { ticket: Ticket }) {
  const comments = useComments(ticket.id);
  const add = useAddComment(ticket.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({ resolver: zodResolver(commentSchema), defaultValues: { message: '' } });

  const list = comments.data ?? [];

  return (
    <section className="card panel">
      <h2 className="cap">Commentaires{comments.data && ` (${list.length})`}</h2>

      {comments.isPending && <p className="text-pencil">Chargement des commentaires…</p>}
      {comments.isError && (
        <div role="alert" className="flex flex-wrap items-center gap-2.5">
          <span className="text-pencil">Les commentaires n’ont pas pu s’afficher.</span>
          <button type="button" className="btn" onClick={() => comments.refetch()}>
            Réessayer
          </button>
        </div>
      )}
      {comments.data && list.length === 0 && <p className="text-pencil">Aucun commentaire pour l’instant.</p>}

      {list.length > 0 && (
        <ol className="grid">
          {list.map((comment) => (
            <li key={comment.id} className="grid gap-1 border-b border-line py-3 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <b className="text-[13px]">{comment.author.name}</b>
                <span className="role-tag">{ROLE_LABELS[comment.author.role]}</span>
                <time dateTime={comment.createdAt} className="text-xs text-pencil tabular-nums">
                  {formatDateTime(comment.createdAt)}
                </time>
              </div>
              <p className="text-[13.5px] whitespace-pre-line">{comment.message}</p>
            </li>
          ))}
        </ol>
      )}

      {ticket.status === 'closed' ? (
        <p className="text-xs text-pencil">Ticket fermé : les commentaires sont figés.</p>
      ) : (
        <form
          noValidate
          className="grid gap-2 pt-1"
          onSubmit={handleSubmit((values) => add.mutate(values.message, { onSuccess: () => reset() }))}
        >
          <Field id="message" label="Nouveau commentaire" error={errors.message?.message}>
            <textarea
              id="message"
              className="input area"
              placeholder="Écrivez votre message"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              {...register('message')}
            />
          </Field>
          {add.isError && (
            <p role="alert" className="inline-err">
              {getErrorMessage(add.error)}
            </p>
          )}
          <button type="submit" className="btn justify-self-end" disabled={add.isPending}>
            {add.isPending && <span aria-hidden="true" className="spin" />}
            {add.isPending ? 'Ajout en cours' : 'Ajouter le commentaire'}
          </button>
        </form>
      )}
    </section>
  );
}
