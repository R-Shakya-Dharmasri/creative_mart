
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileArchive,
  ShieldCheck,
  Eye,
} from "lucide-react";

import { templates } from "../data/templates";

export default function TemplateDetails() {
  const { id } = useParams<{ id: string }>();

  const template = templates.find(
    (item) => item.id === Number(id)
  );

  if (!template) {
    return (
      <div className="px-6 py-32 text-center">
        <h1 className="text-3xl font-bold">
          Template Not Found
        </h1>

        <Link
          to="/"
          className="mt-6 inline-block text-violet-400"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

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
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <img
              src={template.image}
              alt={template.title}
              className="w-full object-cover"
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">
              Template Preview
            </h2>

            <p className="text-zinc-400">
              Explore this creative resource before downloading.
              Preview images and videos will be available here
              when the template is uploaded by the admin.
            </p>
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

            <p className="mt-4 text-zinc-400">
              High-quality creative template, available
              for free on SriVora.
            </p>

            <div className="mt-8 space-y-5 border-t border-zinc-800 pt-6">

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <FileArchive size={18} />
                  File Type
                </span>
                <span>{template.fileType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Download size={18} />
                  Downloads
                </span>
                <span>{template.downloads.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Eye size={18} />
                  Access
                </span>
                <span className="text-green-400">Free</span>
              </div>

            </div>

            {/* Download Button */}
            <button
              disabled
              title="Downloads will be enabled after backend integration"
              className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-violet-600/50 py-4 font-semibold text-white/70"
            >
              <Download size={20} />
              Free Download — Coming Soon
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <ShieldCheck size={16} />
              No account required
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
