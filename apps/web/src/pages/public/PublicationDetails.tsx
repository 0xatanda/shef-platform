import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import {
  getPublication,
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

export default function PublicationDetails() {
  const { id } = useParams<{ id: string }>();

  const [publication, setPublication] =
    useState<Publication | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError("Publication not found");
        setLoading(false);
        return;
      }

      try {
        const result = await getPublication(id);

        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load publication",
          );
        }

        if (!cancelled) {
          setPublication(result.data);
          document.title = `${result.data.title} | SHEF`;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load publication",
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
  }, [id]);

  if (loading) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center text-gray-500">
          Loading publication...
        </div>
      </section>
    );
  }

  if (error || !publication) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Publication not found
          </h1>

          <p className="mt-3 text-gray-500">
            {error ||
              "The publication could not be found."}
          </p>

          <Link
            to="/publications"
            className="mt-6 inline-block font-semibold text-green-700"
          >
            ← Back to publications
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article>
      <section className="bg-green-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/publications"
            className="text-sm font-semibold text-green-700"
          >
            ← Publications
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-green-700">
            {publication.type.replace("_", " ")}
          </p>

          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {publication.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
            {publication.author && (
              <span>
                By {publication.author}
              </span>
            )}

            {publication.published_at && (
              <span>
                {new Date(
                  publication.published_at,
                ).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {publication.featured_image && (
            <img
              src={resolveImageUrl(
                publication.featured_image,
              )}
              alt={publication.title}
              className="mb-12 max-h-130 w-full rounded-2xl object-cover"
            />
          )}

          {publication.summary && (
            <p className="mb-10 text-xl leading-8 text-gray-600">
              {publication.summary}
            </p>
          )}

          <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">
            {publication.content}
          </div>
        </div>
      </section>
    </article>
  );
}