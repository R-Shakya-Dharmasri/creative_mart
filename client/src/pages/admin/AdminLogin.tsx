
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowLeft } from "lucide-react";
import { loginAdmin } from "../../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await loginAdmin(
        email.trim(),
        password
      );

      sessionStorage.setItem(
        "srivora_admin_token",
        response.token
      );

      setPassword("");
      navigate("/admin", { replace: true });
    } catch {
      setError(
        "Login failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-400">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Sign in to manage SriVora creative assets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm text-zinc-300"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-12 pr-4 text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to SriVora
        </Link>

      </div>
    </main>
  );
}
