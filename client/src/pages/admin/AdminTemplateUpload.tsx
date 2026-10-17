
import { Link } from "react-router-dom";
import { ArrowLeft, CloudUpload } from "lucide-react";

export default function AdminTemplateUpload() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/admin"
        className="mb-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <CloudUpload
          size={36}
          className="mb-4 text-violet-400"
        />

        <h1 className="text-3xl font-bold">
          Upload New Template
        </h1>

        <p className="mt-3 text-zinc-400">
          Add a creative resource to SriVora.
          The upload form will be connected next.
        </p>
      </div>
    </main>
  );
}
