
import { Routes, Route, Link } from "react-router-dom";
import { Download, Sparkles } from "lucide-react";

import Home from "./pages/Home";
import TemplateDetails from "./pages/TemplateDetails";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminTemplateUpload from "./pages/admin/AdminTemplateUpload";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-zinc-800 px-8 py-5">
        <Link to="/" className="text-3xl font-bold">
          Sri<span className="text-violet-500">Vora.</span>
        </Link>

        <Link
          to="/#templates"
          onClick={() => {
            if (window.location.pathname === "/") {
              document.getElementById("templates")?.scrollIntoView({
                behavior: "smooth",
              });
            }
          }}
          className="rounded-lg bg-violet-600 px-5 py-2 font-medium hover:bg-violet-700"
        >
          Explore Templates
        </Link>
      </nav>

      {/* Page Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <section className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                  <Sparkles size={16} />
                  Free Creative Resources
                </div>

                <h2 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
                  Create Beyond
                  <span className="text-violet-500">
                    {" "}Boundaries.
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-lg text-zinc-400">
                  Discover free Premiere Pro templates, social media
                  designs, CV templates and creative assets.
                  Preview, download and create something amazing.
                </p>

                <a
                  href="#templates"
                  className="mt-8 flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 font-semibold hover:bg-violet-700"
                >
                  <Download size={20} />
                  Browse Free Templates
                </a>
              </section>

              <section id="templates">
                <Home />
              </section>
            </>
          }
        />

        <Route
          path="/templates/:id"
          element={<TemplateDetails />}
        />

        {/* Public Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected Admin Routes */}
       <Route element={<ProtectedAdminRoute />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/templates/new"
              element={<AdminTemplateUpload />}
            />
          </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="py-32 text-center">
              <h1 className="text-4xl font-bold">
                404 - Page Not Found
              </h1>
              <Link
                to="/"
                className="mt-6 inline-block text-violet-400"
              >
                Return Home
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
