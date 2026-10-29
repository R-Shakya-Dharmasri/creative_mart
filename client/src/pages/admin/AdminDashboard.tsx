
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
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
  Pencil,
  X,
  Save,
  Trash2,
} from "lucide-react";

import api from "../../services/api";
import { logoutAdmin } from "../../services/authService";

interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  software: string;
  tags: string[];
  downloads: number;
}

interface TemplatesResponse {
  success: boolean;
  templates: Template[];
}

interface DeleteResponse {
  success: boolean;
  message: string;
  cleanupComplete?: boolean;
}

interface EditForm {
  title: string;
  description: string;
  category: string;
  software: string;
  tags: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingTemplate, setEditingTemplate] =
    useState<Template | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    category: "",
    software: "",
    tags: "",
  });

  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<Template | null>(null);

  // Fetch templates from MongoDB
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

  // Logout
  function handleLogout() {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  }

  // Open edit modal
  function handleEdit(template: Template) {
    setEditingTemplate(template);
    setEditError("");
    setSuccessMessage("");

    setEditForm({
      title: template.title,
      description: template.description,
      category: template.category,
      software: template.software,
      tags: template.tags.join(", "),
    });
  }

  function handleCloseEdit() {
    if (saving) return;

    setEditingTemplate(null);
    setEditError("");
  }

  function handleInputChange(
    field: keyof EditForm,
    value: string
  ) {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Save edited template
  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTemplate || saving) return;

    setSaving(true);
    setEditError("");

    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        software: editForm.software.trim(),
        tags: editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await api.patch(
        `/templates/${editingTemplate._id}`,
        payload
      );

      setEditingTemplate(null);
      setSuccessMessage("Template updated successfully!");

      await fetchTemplates();
    } catch (err) {
      console.error("Update template failed:", err);

      setEditError(
        "Failed to update template. Check your admin login and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Open delete confirmation
  function handleDeleteClick(template: Template) {
    if (deletingId !== null) return;

    setTemplateToDelete(template);
    setSuccessMessage("");
    setError("");
  }

  function handleCancelDelete() {
    if (deletingId !== null) return;
    setTemplateToDelete(null);
  }

  // Confirm permanent deletion
  async function handleConfirmDelete() {
    if (!templateToDelete || deletingId !== null) return;

    const templateId = templateToDelete._id;

    setDeletingId(templateId);
    setError("");
    setSuccessMessage("");

    try {
      const { data } = await api.delete<DeleteResponse>(
        `/templates/${templateId}`
      );

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setTemplateToDelete(null);

      // Refresh table and statistics
      await fetchTemplates();

      if (data.cleanupComplete === false) {
        setError(
          "Template deleted, but some uploaded files require cleanup. Check server logs."
        );
      } else {
        setSuccessMessage("Template deleted successfully!");
      }
    } catch (err) {
      console.error("Delete template failed:", err);

      setError(
        "Failed to delete template. Please check your admin login or server logs."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Dashboard statistics
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

      {/* Dashboard Header */}
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

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400"
        >
          {successMessage}
        </div>
      )}

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
            disabled={loading || deletingId !== null}
            className="flex items-center gap-2 text-violet-400 hover:text-violet-300 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
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
                <th className="p-5">Actions</th>
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
                      <div className="flex items-center gap-5">

                        {/* View */}
                        <Link
                          to={`/templates/${template._id}`}
                          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                        >
                          <Eye size={16} />
                          View
                        </Link>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleEdit(template)}
                          disabled={deletingId !== null}
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(template)}
                          disabled={deletingId !== null}
                          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingId === template._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
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

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-template-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="edit-template-title"
                className="text-xl font-bold"
              >
                Edit Template
              </h2>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={saving}
                aria-label="Close edit form"
                className="text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={editForm.title}
                  onChange={(event) =>
                    handleInputChange("title", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Description
                </label>
                <textarea
                  required
                  maxLength={5000}
                  rows={4}
                  value={editForm.description}
                  onChange={(event) =>
                    handleInputChange("description", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editForm.category}
                  onChange={(event) =>
                    handleInputChange("category", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Software
                </label>
                <input
                  type="text"
                  required
                  value={editForm.software}
                  onChange={(event) =>
                    handleInputChange("software", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(event) =>
                    handleInputChange("tags", event.target.value)
                  }
                  placeholder="cv, resume, modern"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              {editError && (
                <p role="alert" className="text-sm text-red-400">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={saving}
                  className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-template-title"
            aria-describedby="delete-template-description"
            className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Trash2 size={24} />
            </div>

            <h2
              id="delete-template-title"
              className="text-xl font-bold text-white"
            >
              Delete Template?
            </h2>

            <p
              id="delete-template-description"
              className="mt-3 text-sm leading-6 text-zinc-400"
            >
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-white">
                {templateToDelete.title}
              </span>
              ?
              <br />
              This will remove the template and its uploaded files.
              This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deletingId !== null}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {deletingId !== null
                  ? "Deleting..."
                  : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
