
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../services/api";
import TemplateCard from "../components/templates/TemplateCard";
import type { Template } from "../types/template";

const categories = [
  "All Templates",
  "Premiere Pro",
  "CV Templates",
  "Social Media",
];

// MongoDB API response structure
type ApiTemplate = {
  _id: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
  downloads?: number;
  fileType?: string;
};

// Backend URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "";

  // Already a complete URL
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Normalize stored file path
  const normalizedPath = imagePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${API_BASE_URL}/${normalizedPath}`;
}

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("All Templates");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchTemplates = async () => {
      try {
        const response = await api.get("/templates");
        const result = response.data;

        const templateList: ApiTemplate[] = Array.isArray(result)
          ? result
          : Array.isArray(result.templates)
            ? result.templates
            : [];

        const mappedTemplates: Template[] = templateList.map(
          (item) => ({
            id: item._id,
            title: item.title,
            category: item.category,
            image: getImageUrl(item.thumbnailUrl),
            downloads: item.downloads ?? 0,
            fileType: item.fileType ?? "ZIP",
          })
        );

        // Debug image URLs
        console.log("Mapped templates:", mappedTemplates);

        if (active) {
          setTemplates(mappedTemplates);
          setError("");
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);

        if (active) {
          setError("Unable to load templates.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTemplates();

    return () => {
      active = false;
    };
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All Templates" ||
      template.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl">
            Explore Free Templates
          </h2>

          <p className="mt-3 text-zinc-400">
            Discover high-quality creative resources,
            completely free to download.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-4 pl-12 pr-4 text-white outline-none transition focus:border-violet-500"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <SlidersHorizontal
            size={20}
            className="mr-2 text-zinc-400"
          />

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-violet-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-zinc-400">
            Loading templates...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center text-red-400">
            {error}
          </p>
        )}

        {/* Templates */}
        {!loading && !error && (
          <>
            <p className="mb-6 text-sm text-zinc-400">
              Showing {filteredTemplates.length} templates
            </p>

            {filteredTemplates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center">
                <Search
                  size={40}
                  className="mx-auto mb-4 text-zinc-500"
                />

                <h3 className="text-xl font-semibold">
                  No templates found
                </h3>

                <p className="mt-2 text-zinc-400">
                  Try searching for another template.
                </p>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All Templates");
                  }}
                  className="mt-6 rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
