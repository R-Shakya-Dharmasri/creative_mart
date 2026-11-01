
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";
import { LogOut, UserRound } from "lucide-react";

export default function Navbar() {
  const { user, loading, logout } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function scrollToTemplates() {
    if (location.pathname === "/") {
      document.getElementById("templates")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-3xl font-bold">
          Sri<span className="text-violet-500">Vora.</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {!loading &&
            (user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-zinc-300 transition hover:text-white"
                >
                  <UserRound size={18} />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition hover:border-red-500/50 hover:text-red-400"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 font-medium text-zinc-300 transition hover:text-white"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg border border-violet-500/40 px-4 py-2 font-medium text-violet-300 transition hover:bg-violet-500/10"
                >
                  Sign Up
                </Link>
              </>
            ))}

          <Link
            to="/#templates"
            onClick={scrollToTemplates}
            className="hidden rounded-lg bg-violet-600 px-5 py-2 font-medium transition hover:bg-violet-700 sm:inline-block"
          >
            Explore Templates
          </Link>
        </div>
      </div>
    </nav>
  );
}
