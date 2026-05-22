import { BarChart3, BookOpen, ClipboardList, LogOut, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { Link, NavLink, Outlet } from "react-router-dom";
import { authService } from "../services/authService";

const navItems = [
  {
    to: "/admin/orders",
    label: "Track orders",
    icon: ClipboardList,
  },
  {
    to: "/admin/menu",
    label: "Add items",
    icon: BookOpen,
  },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];

export const AdminLayout = () => {
  const handleLogout = async () => {
    try {
      await authService.signOut();

      toast.success("Signed out successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to sign out.");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Littlebox
              </p>
              <h1 className="text-lg font-bold text-white">Admin dashboard</h1>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          </div>

          <nav className="flex flex-wrap gap-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-brand-400/40 bg-brand-500 text-slate-950"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
