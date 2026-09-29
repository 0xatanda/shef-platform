import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../api/client";

interface FocusArea {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FocusAreaResponse {
  success: boolean;
  message?: string;
  data?: FocusArea;
}

function resolveImageUrl(
  url?: string | null,
): string {
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

    if (url.startsWith("/uploads/")) {
      return `${origin}${url}`;
    }

    if (url.startsWith("uploads/")) {
      return `${origin}/${url}`;
    }
  } catch {
    return url;
  }

  return url;
}

export default function FocalAreaDetails() {
  const { slug } =
    useParams<{ slug: string }>();

  const [focusArea, setFocusArea] =
    useState<FocusArea | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFocusArea() {
      if (!slug) {
        setError("Focal area not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<FocusAreaResponse>(
            `/focus-areas/${encodeURIComponent(
              slug,
            )}`,
          );

        const result = response.data;

        if (
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Focal area not found.",
          );
        }

        if (!cancelled) {
          setFocusArea(result.data);

          document.title = `${result.data.title} | SHEF`;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load focal area.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFocusArea();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main>
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 text-center text-gray-500 sm:px-6 lg:px-8">
            Loading focal area...
          </div>
        </section>
      </main>
    );
  }

  if (error || !focusArea) {
    return (
      <main>
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              About SHEF
            </p>

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Focal Area Not Found
            </h1>

            <p className="mt-4 text-gray-500">
              {error ||
                "The requested focal area could not be found."}
            </p>

            <Link
              to="/about"
              className="mt-6 inline-block font-semibold text-green-700 hover:text-green-800"
            >
              ← Back to About
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const imageUrl = resolveImageUrl(
    focusArea.image_url,
  );

  return (
    <main>
      {/* Header */}
      <section className="bg-green-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/about"
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← About SHEF
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-green-700">
            Focal Area
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {focusArea.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {imageUrl && (
            <div className="mb-12 overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={imageUrl}
                alt={focusArea.title}
                className="max-h-130 w-full object-cover"
              />
            </div>
          )}

          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900">
              {focusArea.title}
            </h2>

            {focusArea.description ? (
              <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-gray-600">
                {focusArea.description}
              </div>
            ) : (
              <p className="mt-6 text-lg leading-8 text-gray-500">
                More information about this
                focal area will be available
                soon.
              </p>
            )}
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <Link
              to="/about"
              className="inline-flex items-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              ← Back to About
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
