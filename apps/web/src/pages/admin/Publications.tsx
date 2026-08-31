import { useEffect, useState } from "react";

type Publication = {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
  published_at?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Publication[];
  };
};

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("shef_token");

        const response = await fetch(
          "/api/v1/admin/publications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load publications",
          );
        }

        setItems(result.data?.items ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load publications",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Publications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage reports, articles and publications.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white"
        >
          Add Publication
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {loading && (
          <p className="p-6 text-sm text-slate-500">
            Loading publications...
          </p>
        )}

        {!loading && error && (
          <p className="p-6 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No publications found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first publication from the CMS.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((publication) => (
              <div
                key={publication.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <h3 className="font-medium text-slate-900">
                    {publication.title || "Untitled publication"}
                  </h3>

                  {publication.slug && (
                    <p className="text-xs text-slate-500">
                      {publication.slug}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="text-sm font-medium text-[#00843D]"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}