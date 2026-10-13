import { useEffect, useRef } from 'react';
import { getErrorMessage } from '../lib/api/client';
import { useDeleteTicket } from '../lib/hooks/useTickets';
import type { Ticket } from '../types';

interface ConfirmDeleteProps {
  ticket: Ticket;
  commentCount: number;
  onClose: () => void;
  onDeleted: () => void;
}

export default function ConfirmDelete({ ticket, commentCount, onClose, onDeleted }: ConfirmDeleteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const remove = useDeleteTicket();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const consequence =
    commentCount === 0
      ? ''
      : commentCount === 1
        ? 'Son commentaire sera supprimé avec lui. '
        : `Ses ${commentCount} commentaires seront supprimés avec lui. `;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
      className="dialog"
    >
      <h2 id="confirm-title" className="px-5 pt-[18px] font-mono text-base leading-snug font-semibold">
        Supprimer le ticket « {ticket.title} » ?
      </h2>
      <p id="confirm-text" className="px-5 pt-3 text-[13.5px]">
        {consequence}Cette action est définitive.
      </p>
      {remove.isError && (
        <p role="alert" className="inline-err mx-5 mt-3">
          {getErrorMessage(remove.error)}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2 px-5 pt-[18px] pb-5">
        <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
          Garder le ticket
        </button>
        <button
          type="button"
          className="btn btn-danger-fill"
          disabled={remove.isPending}
          onClick={() => remove.mutate(ticket, { onSuccess: onDeleted })}
        >
          {remove.isPending && <span aria-hidden="true" className="spin" />}
          {remove.isPending ? 'Suppression en cours' : 'Oui, supprimer le ticket'}
        </button>
      </div>
    </dialog>
  );
}
