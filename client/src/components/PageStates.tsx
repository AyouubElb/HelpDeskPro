import type { ReactNode } from 'react';

export function PageHead({ crumb, title, action }: { crumb: ReactNode; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="crumb">{crumb}</p>
        <h1 className="h-title">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card grid justify-items-start gap-2 px-5 py-[22px]">
      <h2 className="font-mono text-[15px] font-semibold">{title}</h2>
      <p className="max-w-[46ch] text-[13.5px] text-pencil">{text}</p>
      {action}
    </div>
  );
}

export function BrokenState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="card grid justify-items-start gap-2 border-red px-5 py-[22px]">
      <h2 className="font-mono text-[15px] font-semibold">Cette page n’a pas pu s’afficher</h2>
      <p className="max-w-[46ch] text-[13.5px] text-pencil">Rien n’a été perdu. Réessayez dans un instant.</p>
      <button type="button" className="btn" onClick={onRetry}>
        Réessayer
      </button>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card grid gap-2.5 p-3" aria-label="Chargement" aria-busy="true">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid grid-cols-[1fr_70px_70px_90px] gap-3.5">
          <i className="skel" />
          <i className="skel" />
          <i className="skel" />
          <i className="skel" />
        </div>
      ))}
    </div>
  );
}
