import { useCallback, useEffect, useState } from "react";
import api from "../../api/client";
import type { AxiosError } from "axios";

type MediaType = "image" | "youtube";

interface ContentMedia {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  youtube_video_id: string;
  alt_text: string;
  created_at: string;
  updated_at: string;
}

interface ApiErrorResponse {
  message?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface MediaListResponse {
  items: ContentMedia[];
  pagination: Pagination;
}

interface MediaForm {
  type: MediaType;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  youtube_video_id: string;
  alt_text: string;
}

const emptyForm: MediaForm = {
  type: "youtube",
  title: "",
  description: "",
  url: "",
  thumbnail_url: "",
  youtube_video_id: "",
  alt_text: "",
};

function getYouTubeVideoId(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      return parsed.pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return videoId;
      }

      const path = parsed.pathname.replace(/^\/+/, "");

      if (path.startsWith("shorts/")) {
        return path.replace("shorts/", "").split("/")[0] || "";
      }

      if (path.startsWith("embed/")) {
        return path.replace("embed/", "").split("/")[0] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) {
    return "";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function Media() {
  const [media, setMedia] = useState<ContentMedia[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<MediaForm>(emptyForm);

    const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page,
        limit: 12,
      };

      if (filter !== "all") {
        params.type = filter;
      }

      const response = await api.get<{
        success: boolean;
        data: MediaListResponse;
      }>("/admin/media", {
        params,
      });

      setMedia(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error: unknown) {
      setError(
        getErrorMessage(error, "Unable to load media. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadMedia();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadMedia]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleUrlChange = (value: string) => {
    const videoId = getYouTubeVideoId(value);

    setForm((current) => ({
      ...current,
      url: value,
      youtube_video_id: videoId,
      thumbnail_url: videoId
        ? getYouTubeThumbnail(videoId)
        : current.thumbnail_url,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.url.trim()) {
        setError("Please enter a YouTube URL.");
        return;
      }

      const videoId = getYouTubeVideoId(form.url);

      if (!videoId) {
        setError("Please enter a valid YouTube URL.");
        return;
      }

      const payload = {
        type: "youtube",
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        thumbnail_url:
          form.thumbnail_url.trim() || getYouTubeThumbnail(videoId),
        youtube_video_id: videoId,
        alt_text: form.alt_text.trim(),
      };

      if (editingId) {
        await api.put(`/admin/media/${editingId}`, payload);
        setSuccess("Media updated successfully.");
      } else {
        await api.post("/admin/media", payload);
        setSuccess("YouTube video added successfully.");
      }

      resetForm();
      await loadMedia();
    }  catch (error: unknown) {
  setError(
    getErrorMessage(error, "Unable to load media. Please try again."),
  );

    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ContentMedia) => {
    setEditingId(item.id);

    setForm({
      type: item.type,
      title: item.title,
      description: item.description,
      url: item.url,
      thumbnail_url: item.thumbnail_url,
      youtube_video_id: item.youtube_video_id,
      alt_text: item.alt_text,
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this media item?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/admin/media/${id}`);

      setSuccess("Media deleted successfully.");

      if (media.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadMedia();
      }
    }  catch (error: unknown) {
      setError(
        getErrorMessage(error, "Unable to load media. Please try again."),
      );

    }
  };

  const handleFilterChange = (value: "all" | MediaType) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage images and YouTube videos used across the SHEF platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          {showForm ? "Cancel" : "Add YouTube Video"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit YouTube Video" : "Add YouTube Video"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add an existing YouTube video. The video itself will remain
              hosted on YouTube.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* YouTube URL */}
            <div>
              <label
                htmlFor="media-url"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                YouTube URL
              </label>

              <input
                id="media-url"
                type="url"
                value={form.url}
                onChange={(event) => handleUrlChange(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                required
              />
            </div>

            {/* Preview */}
            {form.youtube_video_id && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <div className="aspect-video w-full bg-black">
                  <img
                    src={getYouTubeThumbnail(form.youtube_video_id)}
                    alt="YouTube video thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Video ID
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {form.youtube_video_id}
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="media-title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title
              </label>

              <input
                id="media-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Enter video title"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="media-description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="media-description"
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Enter a short description"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Alt text */}
            <div>
              <label
                htmlFor="media-alt-text"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Alt Text
              </label>

              <input
                id="media-alt-text"
                type="text"
                value={form.alt_text}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    alt_text: event.target.value,
                  }))
                }
                placeholder="Describe the video thumbnail"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Video"
                    : "Save Video"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "youtube", "image"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleFilterChange(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === item
                ? "bg-green-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item === "all"
              ? "All Media"
              : item === "youtube"
                ? "YouTube"
                : "Images"}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading media...
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No media found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Add your first YouTube video to the media library.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.alt_text || item.title || "Media thumbnail"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No thumbnail
                  </div>
                )}

                {item.type === "youtube" && (
                  <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    YouTube
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="line-clamp-2 font-semibold text-gray-900">
                  {item.title || "Untitled video"}
                </h3>

                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                    {item.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  Added{" "}
                  {new Date(item.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                    >
                      View
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.total_pages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}