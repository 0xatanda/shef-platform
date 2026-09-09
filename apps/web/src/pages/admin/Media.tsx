import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import api from "../../api/client";
import type { AxiosError } from "axios";


type MediaType = "image" | "youtube";
type MediaFilter = "all" | MediaType;

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

interface UploadResponse {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

interface UploadApiResponse {
  success: boolean;
  message: string;
  data: UploadResponse;
}

const emptyForm: MediaForm = {
  type: "image",
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
      return (
        parsed.pathname
          .replace(/^\/+|\/+$/g, "")
          .split("/")[0] || ""
      );
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

function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) {
    return "";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ||
    fallback
  );
}

/**
 * The API upload service returns URLs such as:
 *
 * /uploads/filename.jpg
 *
 * VITE_API_URL normally points to:
 *
 * http://localhost:8080/api/v1
 *
 * Therefore uploaded files must use the API origin:
 *
 * http://localhost:8080/uploads/filename.jpg
 */
function resolveMediaUrl(url: string): string {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1";

  try {
    const origin = new URL(apiUrl).origin;

    if (url.startsWith("/")) {
      return `${origin}${url}`;
    }

    return `${origin}/${url}`;
  } catch {
    return url;
  }
}

function formatDate(date: string): string {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Media() {
  const [media, setMedia] = useState<ContentMedia[]>([]);
  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] =
    useState<MediaFilter>("all");

  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<MediaForm>(emptyForm);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<
        string,
        string | number
      > = {
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
        getErrorMessage(
          error,
          "Unable to load media. Please try again.",
        ),
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
    setSaving(false);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleTypeChange = (type: MediaType) => {
    setForm((current) => ({
      ...current,
      type,
      url: "",
      thumbnail_url: "",
      youtube_video_id: "",
    }));

    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleYouTubeUrlChange = (value: string) => {
    const videoId = getYouTubeVideoId(value);

    setForm((current) => ({
      ...current,
      url: value,
      youtube_video_id: videoId,
      thumbnail_url: videoId
        ? getYouTubeThumbnail(videoId)
        : "",
    }));
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image must be smaller than 10MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response =
        await api.post<UploadApiResponse>(
          "/admin/uploads",
          uploadData,
        );

      const uploaded = response.data.data;

      setForm((current) => ({
        ...current,
        type: "image",
        url: uploaded.url,
        thumbnail_url: uploaded.url,
        title:
          current.title ||
          uploaded.original_name.replace(
            /\.[^/.]+$/,
            "",
          ),
        alt_text:
          current.alt_text ||
          uploaded.original_name.replace(
            /\.[^/.]+$/,
            "",
          ),
      }));

      setSuccess(
        "Image uploaded successfully. You can now save it to the media library.",
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to upload image. Please try again.",
        ),
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (form.type === "image") {
        if (!form.url.trim()) {
          setError("Please choose an image first.");
          return;
        }

        const payload = {
          type: "image",
          title: form.title.trim(),
          description: form.description.trim(),
          url: form.url.trim(),
          thumbnail_url:
            form.thumbnail_url.trim() ||
            form.url.trim(),
          youtube_video_id: "",
          alt_text: form.alt_text.trim(),
        };

        if (editingId) {
          await api.put(
            `/admin/media/${editingId}`,
            payload,
          );

          setSuccess(
            "Image updated successfully.",
          );
        } else {
          await api.post(
            "/admin/media",
            payload,
          );

          setSuccess(
            "Image added successfully.",
          );
        }
      } else {
        if (!form.url.trim()) {
          setError(
            "Please enter a YouTube URL.",
          );
          return;
        }

        const videoId =
          getYouTubeVideoId(form.url);

        if (!videoId) {
          setError(
            "Please enter a valid YouTube URL.",
          );
          return;
        }

        const payload = {
          type: "youtube",
          title: form.title.trim(),
          description: form.description.trim(),
          url: form.url.trim(),
          thumbnail_url:
            form.thumbnail_url.trim() ||
            getYouTubeThumbnail(videoId),
          youtube_video_id: videoId,
          alt_text: form.alt_text.trim(),
        };

        if (editingId) {
          await api.put(
            `/admin/media/${editingId}`,
            payload,
          );

          setSuccess(
            "YouTube video updated successfully.",
          );
        } else {
          await api.post(
            "/admin/media",
            payload,
          );

          setSuccess(
            "YouTube video added successfully.",
          );
        }
      }

      resetForm();
      await loadMedia();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to save media. Please try again.",
        ),
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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

      setSuccess(
        "Media deleted successfully.",
      );

      if (media.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadMedia();
      }
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to delete media. Please try again.",
        ),
      );
    }
  };

  const handleFilterChange = (
    value: MediaFilter,
  ) => {
    setFilter(value);
    setPage(1);
    setError("");
  };

  const imagePreview =
    form.type === "image" && form.url
      ? resolveMediaUrl(form.url)
      : "";

  const youtubePreview =
    form.type === "youtube" &&
    form.youtube_video_id
      ? getYouTubeThumbnail(
          form.youtube_video_id,
        )
      : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Media
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage images and YouTube videos used
            across the SHEF platform.
          </p>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? resetForm
              : openCreateForm
          }
          className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          {showForm ? "Cancel" : "Add Media"}
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

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId
                ? `Edit ${
                    form.type === "image"
                      ? "Image"
                      : "YouTube Video"
                  }`
                : "Add Media"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {form.type === "image"
                ? "Upload an image from your computer and save it to the SHEF media library."
                : "Add an existing YouTube video. The video itself remains hosted on YouTube."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Media Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Media Type
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleTypeChange("image")
                  }
                  className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
                    form.type === "image"
                      ? "border-green-700 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Image
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleTypeChange("youtube")
                  }
                  className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
                    form.type === "youtube"
                      ? "border-green-700 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  YouTube
                </button>
              </div>
            </div>

            {/* Image Upload */}
            {form.type === "image" && (
              <div>
                <label
                  htmlFor="media-image"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Choose Image
                </label>

                <input
                  ref={fileInputRef}
                  id="media-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={
                    uploading || saving
                  }
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, WEBP or GIF. Maximum
                  file size: 10MB.
                </p>

                {uploading && (
                  <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Uploading image...
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <div className="aspect-video w-full bg-gray-100">
                      <img
                        src={imagePreview}
                        alt={
                          form.alt_text ||
                          form.title ||
                          "Selected image"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Selected Image
                        </p>

                        <p className="mt-1 max-w-md truncate text-sm text-gray-700">
                          {form.url}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForm(
                            (current) => ({
                              ...current,
                              url: "",
                              thumbnail_url:
                                "",
                            }),
                          );

                          if (
                            fileInputRef.current
                          ) {
                            fileInputRef.current.value =
                              "";
                          }
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* YouTube URL */}
            {form.type === "youtube" && (
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
                  onChange={(event) =>
                    handleYouTubeUrlChange(
                      event.target.value,
                    )
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />

                <p className="mt-2 text-xs text-gray-500">
                  Supports YouTube watch, Shorts,
                  embed and youtu.be links.
                </p>
              </div>
            )}

            {/* YouTube Preview */}
            {youtubePreview && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <div className="aspect-video w-full bg-black">
                  <img
                    src={youtubePreview}
                    alt="YouTube video thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    YouTube Video ID
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
                    title:
                      event.target.value,
                  }))
                }
                placeholder={
                  form.type === "image"
                    ? "Enter image title"
                    : "Enter video title"
                }
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
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Enter a short description"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Alt Text */}
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
                    alt_text:
                      event.target.value,
                  }))
                }
                placeholder={
                  form.type === "image"
                    ? "Describe the image for accessibility"
                    : "Describe the video thumbnail"
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={
                  saving || uploading
                }
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading ||
                  (form.type === "image" &&
                    !form.url)
                }
                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? `Update ${
                        form.type === "image"
                          ? "Image"
                          : "Video"
                      }`
                    : `Save ${
                        form.type === "image"
                          ? "Image"
                          : "Video"
                      }`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(
          ["all", "youtube", "image"] as const
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              handleFilterChange(item)
            }
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

      {/* Media count */}
      {pagination && (
        <div className="text-sm text-gray-500">
          {pagination.total}{" "}
          {pagination.total === 1
            ? "media item"
            : "media items"}
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading media...
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
            +
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No media found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Add an image or YouTube video to
            your media library.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            Add Media
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => {
            const thumbnail =
              item.type === "youtube"
                ? item.thumbnail_url ||
                  getYouTubeThumbnail(
                    item.youtube_video_id,
                  )
                : item.thumbnail_url ||
                  item.url;

            const resolvedThumbnail =
              resolveMediaUrl(thumbnail);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  {resolvedThumbnail ? (
                    <img
                      src={resolvedThumbnail}
                      alt={
                        item.alt_text ||
                        item.title ||
                        "Media thumbnail"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No preview available
                    </div>
                  )}

                  {/* Type Badge */}
                  <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                      item.type === "youtube"
                        ? "bg-red-600"
                        : "bg-green-700"
                    }`}
                  >
                    {item.type === "youtube"
                      ? "YouTube"
                      : "Image"}
                  </div>

                  {/* Play Button */}
                  {item.type ===
                    "youtube" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Watch ${
                        item.title ||
                        "YouTube video"
                      }`}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-xl text-white shadow-lg transition hover:scale-105">
                        ▶
                      </span>
                    </a>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="line-clamp-2 font-semibold text-gray-900">
                    {item.title ||
                      (item.type === "image"
                        ? "Untitled image"
                        : "Untitled video")}
                  </h3>

                  {item.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-400">
                    <span>
                      Added{" "}
                      {formatDate(
                        item.created_at,
                      )}
                    </span>

                    {item.type === "image" && (
                      <span>
                        Image
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(item)
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    {item.url && (
                      <a
                        href={
                          item.type === "image"
                            ? resolveMediaUrl(
                                item.url,
                              )
                            : item.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                      >
                        View
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination &&
        pagination.total_pages > 1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of{" "}
              {pagination.total_pages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  pagination.total_pages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
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
