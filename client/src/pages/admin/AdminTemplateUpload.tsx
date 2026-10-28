
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";

import {
  uploadTemplate,
  type TemplateUploadData,
} from "../../services/templateService";

export default function AdminTemplateUpload() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [software, setSoftware] = useState("");
  const [tags, setTags] = useState("");

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previews, setPreviews] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePreviews = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 5) {
      setError("Maximum 5 preview files allowed.");
      setPreviews([]);
      return;
    }

    setError("");
    setPreviews(files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!thumbnail || !templateFile || previews.length === 0) {
      setError("Thumbnail, at least one preview, and ZIP file are required.");
      return;
    }

    if (!templateFile.name.toLowerCase().endsWith(".zip")) {
      setError("Original template must be a ZIP file.");
      return;
    }

    const data: TemplateUploadData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      software: software.trim(),
      tags: tags.trim(),
      thumbnail,
      previews,
      templateFile,
    };

    try {
      setLoading(true);

      await uploadTemplate(data);

      setSuccess("Template uploaded successfully!");

      setTitle("");
      setDescription("");
      setCategory("");
      setSoftware("");
      setTags("");
      setThumbnail(null);
      setPreviews([]);
      setTemplateFile(null);

      // Redirect to dashboard after success
      navigate("/admin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Upload failed. Please try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload New Template</h1>
          <p className="mt-2 text-slate-400">
            Add a new digital template to SriVora.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div>
            <label htmlFor="title" className="mb-2 block text-sm">
              Template Title *
            </label>
            <input
              id="title"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Modern CV Template"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your template..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-2 block text-sm">
                Category *
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <option value="">Select category</option>
                <option value="CV Templates">CV Templates</option>
                <option value="Social Media">Social Media</option>
                <option value="Video Templates">Video Templates</option>
                <option value="Presentations">Presentations</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="software" className="mb-2 block text-sm">
                Software
              </label>
              <select
                id="software"
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <option value="">Select software</option>
                <option value="Microsoft Word">Microsoft Word</option>
                <option value="Adobe Photoshop">Adobe Photoshop</option>
                <option value="Adobe Premiere Pro">Adobe Premiere Pro</option>
                <option value="Canva">Canva</option>
                <option value="Figma">Figma</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="mb-2 block text-sm">
              Tags
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="cv, resume, professional"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate tags using commas.
            </p>
          </div>

          <div className="space-y-5 rounded-xl border border-dashed border-slate-700 p-5">
            <div className="flex items-center gap-2 text-indigo-400">
              <UploadCloud size={20} />
              <h2 className="font-semibold">Upload Files</h2>
            </div>

            <div>
              <label htmlFor="thumbnail" className="mb-2 block text-sm">
                Thumbnail Image *
              </label>
              <input
                id="thumbnail"
                type="file"
                required
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) =>
                  setThumbnail(e.target.files?.[0] ?? null)
                }
                className="block w-full text-sm text-slate-300"
              />
              {thumbnail && (
                <p className="mt-2 text-xs text-slate-400">
                  Selected: {thumbnail.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="previews" className="mb-2 block text-sm">
                Preview Images / Videos *
              </label>
              <input
                id="previews"
                type="file"
                multiple
                required
                accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
                onChange={handlePreviews}
                className="block w-full text-sm text-slate-300"
              />
              <p className="mt-2 text-xs text-slate-400">
                {previews.length} / 5 preview files selected
              </p>
            </div>

            <div>
              <label htmlFor="templateFile" className="mb-2 block text-sm">
                Original Template ZIP *
              </label>
              <input
                id="templateFile"
                type="file"
                required
                accept=".zip,application/zip"
                onChange={(e) =>
                  setTemplateFile(e.target.files?.[0] ?? null)
                }
                className="block w-full text-sm text-slate-300"
              />
              {templateFile && (
                <p className="mt-2 text-xs text-slate-400">
                  Selected: {templateFile.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="rounded-lg bg-green-950 p-3 text-sm text-green-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Publish Template
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
