import { Navigate, Outlet } from 'react-router';
import { BrokenState } from '../components/PageStates';
import { useMe } from '../lib/hooks/useAuth';

export default function ProtectedRoute() {
  const { data: user, isPending, isError, refetch } = useMe();

  if (isPending) {
    return <p className="ruled grid min-h-screen place-items-center font-mono text-pencil">Chargement…</p>;
  }
  if (isError) {
    return (
      <div className="ruled grid min-h-screen place-items-center pr-5 pl-14">
        <BrokenState onRetry={() => refetch()} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
