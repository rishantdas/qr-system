import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { authService } from "../services/authService";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await authService.signIn(form);

      toast.success("Welcome back.");
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.message || "Invalid login credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-soft backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden min-h-full flex-col justify-between bg-brand-500 p-10 text-slate-950 lg:flex">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em]">
              Restaurant operations
            </p>
            <h1 className="mt-4 max-w-sm text-5xl font-black leading-tight">
              Manage live QR orders without leaving the floor.
            </h1>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-slate-900/80">
            Secure admin access, realtime order updates, and fast status changes
            for busy service windows.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            Admin login
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            Sign in to your dashboard
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Use your Supabase Auth email and password to access incoming orders.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Email address
              </span>
              <div className="surface-muted flex items-center gap-3 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="admin@restaurant.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </span>
              <div className="surface-muted flex items-center gap-3 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
