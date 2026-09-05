import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPublications,
  type Publication,
} from "../../api/publications";
import { API_ORIGIN } from "../../api/client";

function resolveImageUrl(url?: string | null) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

function formatDate(date?: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getPublications();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load publications",
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
              : "Unable to load publications",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold uppercase tracking-wider text-green-700">
            Resources
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">
            Publications
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Explore reports, research, articles, policy
            briefs and stories from SHEF and the
            communities we work with.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="py-16 text-center text-gray-500">
              Loading publications...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            items.length === 0 && (
              <div className="py-16 text-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  No publications yet
                </h2>

                <p className="mt-2 text-gray-500">
                  Published resources will appear here.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            items.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {items.map((publication) => (
                  <article
                    key={publication.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {publication.featured_image && (
                      <Link
                        to={`/publications/${publication.id}`}
                      >
                        <img
                          src={resolveImageUrl(
                            publication.featured_image,
                          )}
                          alt={publication.title}
                          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </Link>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                        <span>
                          {publication.type.replace(
                            "_",
                            " ",
                          )}
                        </span>

                        {publication.published_at && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDate(
                                publication.published_at,
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="mt-3 text-xl font-bold text-slate-900">
                        {publication.title}
                      </h2>

                      {publication.summary && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {publication.summary}
                        </p>
                      )}

                      <Link
                        to={`/publications/${publication.id}`}
                        className="mt-5 inline-flex font-semibold text-green-700 hover:text-green-800"
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
    </div>
  );
}