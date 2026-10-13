import { NavLink, Outlet } from 'react-router';
import { ROLE_LABELS } from '../lib/format';
import { useCurrentUser, useLogout } from '../lib/hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1.5 ${isActive ? 'bg-tint font-semibold text-main-text' : 'text-ink hover:bg-paper'}`;

// The side menu on a computer; on a phone it sits above the page.
export default function AppLayout() {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-card px-3 py-3 text-[13.5px] md:sticky md:top-0 md:h-screen md:w-[220px] md:shrink-0 md:flex-col md:flex-nowrap md:items-stretch md:gap-3.5 md:border-r md:border-b-0 md:py-4">
        <div className="flex flex-col gap-1.5 px-1.5">
          <span className="logo">HelpDeskPro</span>
          <span className="hidden text-xs text-pencil md:block">Support client</span>
        </div>
        <nav aria-label="Menu" className="flex gap-0.5 md:flex-col">
          <NavLink to="/" end className={navLinkClass}>
            Tableau de bord
          </NavLink>
          <NavLink to="/tickets" className={navLinkClass}>
            Tickets
          </NavLink>
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 md:mt-auto md:ml-0 md:flex-col md:items-start md:gap-0.5 md:border-t md:border-line md:px-2 md:pt-2.5">
          <b className="text-[13px]">{user.name}</b>
          <span className="text-xs text-pencil">{ROLE_LABELS[user.role]}</span>
          <button
            type="button"
            className="btn-link mt-1 font-semibold"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      <main className="ruled min-w-0 flex-1 py-6 pr-4 pl-14 md:pr-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
