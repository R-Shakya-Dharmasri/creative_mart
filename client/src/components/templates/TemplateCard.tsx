
import { Link } from "react-router-dom";
import { Download, ArrowUpRight } from "lucide-react";
import type { Template } from "../../types/template";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({
  template,
}: TemplateCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-violet-500/50">

      <Link to={`/templates/${template.id}`}>
        <img
          src={template.image}
          alt={template.title}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="p-5">
        <span className="text-xs text-violet-400">
          {template.category}
        </span>

        <Link to={`/templates/${template.id}`}>
          <h3 className="mt-2 text-lg font-semibold transition hover:text-violet-400">
            {template.title}
          </h3>
        </Link>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
          <span>
            {template.downloads.toLocaleString()} downloads
          </span>
          <span>{template.fileType}</span>
        </div>

        <Link
          to={`/templates/${template.id}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 font-medium transition hover:bg-violet-700"
        >
          <Download size={17} />
          View & Download
          <ArrowUpRight size={16} />
        </Link>
      </div>

    </div>
  );
}
