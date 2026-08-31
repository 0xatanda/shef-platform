import { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
};

type MediaResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: MediaItem[];
  };
};

export default function Media() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("shef_token");

      const response = await fetch(
        "/api/v1/admin/uploads?page=1&limit=50",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: MediaResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load media",
        );
      }

      setItems(result.data?.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load media",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const token = localStorage.getItem("shef_token");

        const response = await fetch(
          "/api/v1/admin/uploads?page=1&limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: MediaResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load media",
          );
        }

        if (!cancelled) {
          setItems(result.data?.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load media",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const token = localStorage.getItem("shef_token");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/v1/admin/uploads",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result: MediaResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Upload failed",
        );
      }

      await loadMedia();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function deleteMedia(id: string) {
    const confirmed = window.confirm(
      "Delete this media file?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("shef_token");

      const response = await fetch(
        `/api/v1/admin/uploads/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete media",
        );
      }

      setItems((current) =>
        current.filter((item) => item.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete media",
      );
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Media Library
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload and manage images and other media.
          </p>
        </div>

        <label className="cursor-pointer rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006f34]">
          {uploading ? "Uploading..." : "Upload Media"}

          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            disabled={uploading}
            onChange={uploadFile}
          />
        </label>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          Loading media...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="font-semibold text-slate-900">
            No media files
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Upload an image or document to get started.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {item.mime_type.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={item.original_name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">
                  {item.mime_type}
                </div>
              )}

              <div className="p-4">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.original_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(item.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <button
                  type="button"
                  onClick={() => deleteMedia(item.id)}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}