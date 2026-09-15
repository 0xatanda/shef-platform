import { useEffect, useState } from "react";
import api, { API_ORIGIN } from "../../api/client";

type MediaType = "image" | "youtube";

interface Media {
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

interface MediaResponse {
  success: boolean;
  data: {
    items: Media[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

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

  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

function getYouTubeThumbnail(
  videoId: string,
  fallback?: string,
): string {
  if (fallback) {
    return fallback;
  }

  if (!videoId) {
    return "";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function formatDate(date: string): string {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

export default function Media() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      try {
        setLoading(true);

        const response =
          await api.get<MediaResponse>(
            "/media",
            {
              params: {
                page: 1,
                limit: 50,
              },
            },
          );

        if (!cancelled) {
          setMedia(
            response.data.data.items || [],
          );
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

  const videos = media.filter(
    (item) => item.type === "youtube",
  );

  const images = media.filter(
    (item) => item.type === "image",
  );

  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="bg-green-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            SHEF Media
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Media
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Explore videos, stories, activities, and
            images from SHEF and the communities we
            support.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-500">
                Loading media...
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {/* YouTube Videos */}
              <section>
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
                    Videos
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    YouTube Videos
                  </h2>

                  <p className="mt-3 max-w-2xl text-gray-600">
                    Watch stories, community activities,
                    and other videos from SHEF.
                  </p>
                </div>

                {videos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No videos available yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((item) => {
                      const thumbnail =
                        getYouTubeThumbnail(
                          item.youtube_video_id,
                          item.thumbnail_url,
                        );

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          {/* Video Thumbnail */}
                          <div className="relative aspect-video overflow-hidden bg-gray-100">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={
                                  item.alt_text ||
                                  item.title ||
                                  "SHEF YouTube video"
                                }
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                No preview available
                              </div>
                            )}

                            {/* Play Button */}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Watch ${
                                  item.title ||
                                  "SHEF video"
                                }`}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-2xl text-white shadow-lg transition hover:scale-110 hover:bg-green-800">
                                  ▶
                                </span>
                              </a>
                            )}
                          </div>

                          {/* Video Content */}
                          <div className="p-5">
                            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                              {item.title ||
                                "SHEF Video"}
                            </h3>

                            {item.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                                {item.description}
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span className="text-xs text-gray-400">
                                {formatDate(
                                  item.created_at,
                                )}
                              </span>

                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-green-700 hover:text-green-800"
                                >
                                  Watch video →
                                </a>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Images */}
              <section>
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
                    Gallery
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Images
                  </h2>

                  <p className="mt-3 max-w-2xl text-gray-600">
                    A collection of images from SHEF
                    programmes, community activities,
                    and field work.
                  </p>
                </div>

                {images.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No images available yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((item) => {
                      const imageUrl =
                        resolveMediaUrl(
                          item.thumbnail_url ||
                            item.url,
                        );

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          {/* Image */}
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={
                                    item.alt_text ||
                                    item.title ||
                                    "SHEF image"
                                  }
                                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                  No image available
                                </div>
                              )}
                            </div>
                          </a>

                          {/* Image Content */}
                          <div className="p-5">
                            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                              {item.title ||
                                "SHEF Image"}
                            </h3>

                            {item.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                                {item.description}
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span className="text-xs text-gray-400">
                                {formatDate(
                                  item.created_at,
                                )}
                              </span>

                              {imageUrl && (
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-green-700 hover:text-green-800"
                                >
                                  View image →
                                </a>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
