import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

type Publication = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  description?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  is_published?: boolean;
};

type PublicationsResponse = {
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
    let cancelled = false;

    async function loadPublications() {
      try {
        const response =
          await api.get<PublicationsResponse>(
            "/publications",
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load publications",
          );
        }

        if (!cancelled) {
          setItems(
            (response.data.data?.items ?? []).filter(
              (item) =>
                item.is_published !== false,
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load publications",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPublications();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Publications
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Research, Stories & Resources
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Explore our publications, community stories,
            research, reports and resources documenting
            community-led development.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading publications...
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-lg bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              No publications available yet.
            </div>
          )}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((publication) => (
                <article
                  key={publication.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {publication.image_url && (
                    <img
                      src={publication.image_url}
                      alt={publication.title}
                      className="h-52 w-full object-cover"
                      loading="lazy"
                    />
                  )}

                  <div className="p-6">
                    {publication.published_at && (
                      <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                        {new Date(
                          publication.published_at,
                        ).toLocaleDateString()}
                      </p>
                    )}

                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {publication.title}
                    </h2>

                    {(publication.excerpt ||
                      publication.description) && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {publication.excerpt ||
                          publication.description}
                      </p>
                    )}

                    <Link
                      to={`/publications/${
                        publication.slug ||
                        publication.id
                      }`}
                      className="mt-5 inline-block font-semibold text-green-700 hover:text-green-800"
                    >
                      Read publication →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}