import { useEffect, useState } from "react";
import api from "../api/client";

type MediaType = "image" | "youtube";

type Media = {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  youtube_video_id: string;
  alt_text: string;
};

type ApiResponse = {
  success: boolean;
  data: {
    items: Media[];
  };
};

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

function resolveImageUrl(url: string) {
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

export default function MediaShowcase() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      try {
        const response =
          await api.get<ApiResponse>("/media", {
            params: {
              page: 1,
              limit: 6,
            },
          });

        if (!cancelled) {
          setMedia(response.data.data.items);
        }
      } catch {
        if (!cancelled) {
          setMedia([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-gray-500">
            Loading media...
          </p>
        </div>
      </section>
    );
  }

  if (media.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Stories & Media
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Explore stories, community activities, and
            videos from SHEF and the communities we support.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {media.map((item) => {
            const image =
              item.type === "youtube"
                ? item.thumbnail_url
                : item.url;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={resolveImageUrl(image)}
                    alt={
                      item.alt_text ||
                      item.title ||
                      "SHEF media"
                    }
                    className="h-full w-full object-cover"
                  />

                  {item.type === "youtube" && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Watch ${item.title}`}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl text-white shadow-lg">
                        ▶
                      </span>
                    </a>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-900">
                    {item.title || "SHEF Media"}
                  </h3>

                  {item.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}