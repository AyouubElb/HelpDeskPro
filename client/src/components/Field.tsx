import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  help?: string;
  children: ReactNode;
}

// Label above; the error replaces the help text below until it is fixed.
export default function Field({ id, label, error, help, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : (
        help && <p className="text-xs text-pencil">{help}</p>
      )}
    </div>
  );
}
