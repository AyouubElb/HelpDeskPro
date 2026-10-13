import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import Field from './Field';
import { CloseIcon } from './Icons';
import { SignalBars } from './TicketBadges';
import { getErrorMessage, getFieldErrors } from '../lib/api/client';
import { PRIORITY_LABELS, SLA_HOURS } from '../lib/format';
import { useCreateTicket, useUpdateTicket } from '../lib/hooks/useTickets';
import { ticketSchema, type TicketInput } from '../lib/schemas/ticket.schema';
import type { Ticket, TicketPriority } from '../types';

const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];

interface TicketSheetProps {
  ticket?: Ticket;
  onClose: () => void;
}

// No ticket: create one. A ticket: edit its title, description and priority.
export default function TicketSheet({ ticket, onClose }: TicketSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const create = useCreateTicket();
  const update = useUpdateTicket(ticket?.id ?? '');
  const mutation = ticket ? update : create;
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket
      ? { title: ticket.title, description: ticket.description, priority: ticket.priority }
      : { title: '', description: '', priority: 'medium' },
  });
  const priority = watch('priority');
  const otherDelays = PRIORITIES.filter((p) => p !== priority)
    .reverse()
    .map((p, i) => `${i === 0 ? PRIORITY_LABELS[p] : PRIORITY_LABELS[p].toLowerCase()} : ${SLA_HOURS[p]} h`)
    .join(', ');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  const onSubmit = (values: TicketInput) => {
    // The API's field errors go under the inputs, like Zod's.
    const onError = (error: unknown) => {
      for (const [field, message] of Object.entries(getFieldErrors(error))) {
        setError(field as keyof TicketInput, { message });
      }
    };
    if (ticket) {
      update.mutate(values, { onSuccess: close, onError });
    } else {
      create.mutate(values, {
        onSuccess: (created) => {
          close();
          navigate(`/tickets/${created.id}`);
        },
        onError,
      });
    }
  };

  const describedBy = (field: keyof TicketInput) => (errors[field] ? `${field}-error` : undefined);
  const formError =
    mutation.isError && Object.keys(getFieldErrors(mutation.error)).length === 0 ? getErrorMessage(mutation.error) : null;
  const saving = mutation.isPending;

  return (
    <dialog ref={dialogRef} onClose={onClose} aria-labelledby="ticket-sheet-title" className="sheet">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center justify-between gap-2.5 border-b border-line px-5 py-4">
          <h2 id="ticket-sheet-title" className="font-mono text-base font-semibold">
            {ticket ? 'Modifier le ticket' : 'Nouveau ticket'}
          </h2>
          <button type="button" className="btn p-2" aria-label="Fermer le panneau" onClick={close}>
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-[18px]">
          <Field id="title" label="Titre" error={errors.title?.message}>
            <input
              id="title"
              className="input"
              autoComplete="off"
              aria-invalid={!!errors.title}
              aria-describedby={describedBy('title')}
              {...register('title')}
            />
          </Field>

          <Field
            id="description"
            label="Description"
            error={errors.description?.message}
            help="Ce que le client signale, depuis quand, qui est touché."
          >
            <textarea
              id="description"
              rows={7}
              className="input area"
              aria-invalid={!!errors.description}
              aria-describedby={describedBy('description')}
              {...register('description')}
            />
          </Field>

          <fieldset className="flex min-w-0 flex-col gap-1.5">
            <legend className="label mb-1.5">Priorité</legend>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((value) => (
                <label
                  key={value}
                  className="inline-flex cursor-pointer items-center gap-2 rounded border-[1.5px] border-field bg-card px-3 py-[7px] text-[13px] font-semibold has-checked:border-main has-checked:bg-tint has-checked:text-main-text has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-main"
                >
                  <input type="radio" value={value} className="sr-only" {...register('priority')} />
                  <SignalBars priority={value} />
                  {PRIORITY_LABELS[value]}
                </label>
              ))}
            </div>
            <p className="text-xs text-pencil">
              À résoudre en {SLA_HOURS[priority]} h. {otherDelays}.
            </p>
          </fieldset>

          {formError && (
            <p role="alert" className="inline-err">
              {formError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" className="btn" onClick={close}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <span aria-hidden="true" className="spin" />}
            {ticket ? (saving ? 'Enregistrement en cours' : 'Enregistrer') : saving ? 'Création en cours' : 'Créer le ticket'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
