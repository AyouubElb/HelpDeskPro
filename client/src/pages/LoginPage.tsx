import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate } from 'react-router';
import Field from '../components/Field';
import { getErrorMessage } from '../lib/api/client';
import { useLogin, useMe } from '../lib/hooks/useAuth';
import { loginSchema, type LoginInput } from '../lib/schemas/auth.schema';

export default function LoginPage() {
  const { data: user } = useMe();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="ruled grid min-h-screen place-items-center py-10 pr-5 pl-14">
      <div className="grid w-full max-w-[380px] gap-3">
        <form
          noValidate
          onSubmit={handleSubmit((values) => login.mutate(values))}
          className="card grid gap-3.5 border-[1.5px] border-ink p-6 shadow-ink-lg"
        >
          <span className="logo">HelpDeskPro</span>
          <span className="-mt-2 text-xs text-pencil">Support client</span>
          <h1 className="h-title">Connexion</h1>

          {login.isError && (
            <p role="alert" className="inline-err">
              {getErrorMessage(login.error)}
            </p>
          )}

          <Field id="email" label="E-mail" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </Field>

          <Field id="password" label="Mot de passe" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
          </Field>

          <button type="submit" className="btn btn-primary w-full" disabled={login.isPending}>
            {login.isPending && <span aria-hidden="true" className="spin" />}
            {login.isPending ? 'Connexion en cours' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-xs text-pencil">Votre session reste ouverte 8 heures.</p>
      </div>
    </main>
  );
}
