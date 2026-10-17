
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Files,
  Download,
  Upload,
  Eye,
  Plus,
  LogOut,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import { logoutAdmin } from "../../services/authService";

interface Template {
  _id: string;
  title: string;
  category: string;
  downloads: number;
}

interface TemplatesResponse {
  success: boolean;
  templates: Template[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<TemplatesResponse>(
        "/templates"
      );

      setTemplates(data.templates);
    } catch {
      setError("Failed to load templates from the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  function handleLogout() {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  }

  const totalDownloads = templates.reduce(
    (total, template) => total + template.downloads,
    0
  );

  const stats = [
    {
      title: "Total Templates",
      value: templates.length.toString(),
      icon: Files,
    },
    {
      title: "Total Downloads",
      value: totalDownloads.toLocaleString(),
      icon: Download,
    },
    {
      title: "Total Categories",
      value: new Set(
        templates.map((template) => template.category)
      ).size.toString(),
      icon: LayoutDashboard,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-violet-400">
            <LayoutDashboard size={20} />
            Admin Panel
          </div>

          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage your SriVora creative resources.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-300 hover:border-red-500 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>

          <Link
            to="/admin/templates/new"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700"
          >
            <Plus size={20} />
            Upload Template
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
                <Icon size={23} />
              </div>

              <p className="text-sm text-zinc-400">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Template Management */}
      <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 p-6">
          <div>
            <h2 className="text-xl font-bold">
              Manage Templates
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Templates stored in MongoDB Atlas
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchTemplates()}
            disabled={loading}
            className="flex items-center gap-2 text-violet-400 hover:text-violet-300 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-5">Template</th>
                <th className="p-5">Category</th>
                <th className="p-5">Downloads</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-zinc-400"
                  >
                    Loading templates...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-zinc-400"
                  >
                    No templates uploaded yet.
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr
                    key={template._id}
                    className="border-b border-zinc-800/70"
                  >
                    <td className="p-5 font-medium">
                      {template.title}
                    </td>

                    <td className="p-5 text-zinc-400">
                      {template.category}
                    </td>

                    <td className="p-5">
                      {template.downloads.toLocaleString()}
                    </td>

                    <td className="p-5">
                      <Link
                        to={`/templates/${template._id}`}
                        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 p-5 text-sm text-zinc-500">
          <span>
            {templates.length} templates
          </span>

          <Upload size={18} className="text-violet-400" />
        </div>
      </div>
    </main>
  );
}
