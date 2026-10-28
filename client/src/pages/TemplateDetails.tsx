
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileArchive,
  ShieldCheck,
  Eye,
} from "lucide-react";

import api from "../services/api";

type ApiTemplate = {
  _id: string;
  title: string;
  description: string;
  category: string;
  software?: string;
  thumbnailUrl: string;
  previewImages?: string[];
  downloads?: number;
  fileSize?: string;
  isFree?: boolean;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getImageUrl(imagePath: string): string {
  if (!imagePath) return "";

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${API_BASE_URL}/${normalizedPath}`;
}

export default function TemplateDetails() {
  const { id } = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError("");
        setTemplate(null);

        const response = await api.get(`/templates/${id}`);

        const result = response.data;
        const templateData: ApiTemplate =
          result.template ?? result;

        if (active) {
          setTemplate(templateData);
        }
      } catch (err) {
        console.error("Failed to fetch template:", err);

        if (active) {
          setError("Template not found or unavailable.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void fetchTemplate();
    } else {
      setLoading(false);
      setError("Invalid template ID.");
    }

    return () => {
      active = false;
    };
  }, [id]);

  const handleDownload = async () => {
    if (!template || downloading || template.isFree === false) {
      return;
    }

    try {
      setDownloading(true);
      setDownloadError("");

      const response = await api.get(
        `/templates/${template._id}/download`,
        {
          responseType: "blob",
          timeout: 120000,
        }
      );

      const blob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const safeFileName =
        template.title
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 100) || "SriVora_Template";

      link.href = url;
      link.download = `${safeFileName}.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      setTemplate((current) =>
        current
          ? {
              ...current,
              downloads: (current.downloads ?? 0) + 1,
            }
          : current
      );
    } catch (err) {
      console.error("Download failed:", err);

      setDownloadError(
        "Download failed. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-center text-zinc-400">
        Loading template...
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-center text-white">
        <h1 className="text-3xl font-bold">
          Template Not Found
        </h1>

        <p className="mt-4 text-zinc-400">
          {error}
        </p>

        <Link
          to="/"
          className="mt-6 inline-block text-violet-400"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const thumbnail = getImageUrl(template.thumbnailUrl);
  const previewImages = template.previewImages ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Back Navigation */}
        <Link
          to="/#templates"
          className="mb-8 inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Templates
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">

          {/* Preview Section */}
          <div className="lg:col-span-2">

            {/* Main Thumbnail */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <img
                src={thumbnail}
                alt={template.title}
                className="w-full object-cover"
              />
            </div>

            {/* Preview Images */}
            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold">
                Template Preview
              </h2>

              <p className="mb-6 text-zinc-400">
                Explore this creative resource before downloading.
              </p>

              {previewImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {previewImages.map((imagePath, index) => (
                    <div
                      key={`${imagePath}-${index}`}
                      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
                    >
                      <img
                        src={getImageUrl(imagePath)}
                        alt={`${template.title} preview ${index + 1}`}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No additional previews available.
                </p>
              )}
            </div>
          </div>

          {/* Details Sidebar */}
          <div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7">

              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-400">
                {template.category}
              </span>

              <h1 className="mt-5 text-3xl font-bold">
                {template.title}
              </h1>

              <p className="mt-4 whitespace-pre-line text-zinc-400">
                {template.description}
              </p>

              <div className="mt-8 space-y-5 border-t border-zinc-800 pt-6">

                {/* File Type */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <FileArchive size={18} />
                    File Type
                  </span>
                  <span>ZIP</span>
                </div>

                {/* File Size */}
                {template.fileSize && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">
                      File Size
                    </span>
                    <span>{template.fileSize}</span>
                  </div>
                )}

                {/* Software */}
                {template.software && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-zinc-400">
                      Software
                    </span>
                    <span className="text-right">
                      {template.software}
                    </span>
                  </div>
                )}

                {/* Downloads */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Download size={18} />
                    Downloads
                  </span>
                  <span>
                    {(template.downloads ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Access */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Eye size={18} />
                    Access
                  </span>
                  <span
                    className={
                      template.isFree === false
                        ? "text-amber-400"
                        : "text-green-400"
                    }
                  >
                    {template.isFree === false ? "Paid" : "Free"}
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={
                  downloading ||
                  template.isFree === false
                }
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={20} />

                {downloading
                  ? "Downloading..."
                  : template.isFree === false
                    ? "Download Unavailable"
                    : "Free Download"}
              </button>

              {/* Download Error */}
              {downloadError && (
                <p
                  role="alert"
                  className="mt-3 text-center text-sm text-red-400"
                >
                  {downloadError}
                </p>
              )}

              {/* Download Info */}
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500">
                <ShieldCheck size={16} />
                No account required
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
