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

function resolveImageUrl(
  url: string,
): string {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const origin =
    API_ORIGIN.replace(/\/$/, "");

  if (url.startsWith("/uploads/")) {
    return `${origin}${url}`;
  }

  return url;
}

export default function MediaShowcase() {
  const [videos, setVideos] =
    useState<Media[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadYouTubeVideos() {
      try {
        setLoading(true);

        /*
         * We request more than the three displayed
         * on the homepage because the media library
         * contains both images and YouTube videos.
         *
         * We filter to YouTube videos before displaying
         * the first three.
         */
        const response =
          await api.get<ApiResponse>(
            "/media",
            {
              params: {
                page: 1,
                limit: 50,
              },
            },
          );

        if (cancelled) {
          return;
        }

        const youtubeVideos =
          (
            response.data.data?.items ?? []
          )
            .filter(
              (item) =>
                item.type === "youtube",
            )
            .slice(0, 3);

        setVideos(youtubeVideos);
      } catch {
        if (!cancelled) {
          setVideos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadYouTubeVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center text-sm text-gray-500">
        Loading videos...
      </div>
    );
  }

  /*
   * Don't render anything when there are no
   * YouTube videos in the media library.
   */
  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <p className="text-sm text-gray-500">
          Featured videos will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {videos.map((item) => {
        const thumbnail =
          item.thumbnail_url ||
          (item.youtube_video_id
            ? `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`
            : "");

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
              {thumbnail ? (
                <img
                  src={resolveImageUrl(
                    thumbnail,
                  )}
                  alt={
                    item.alt_text ||
                    item.title ||
                    "SHEF YouTube video"
                  }
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No video thumbnail
                </div>
              )}

              {/* YouTube Play Button */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch ${
                  item.title ||
                  "SHEF YouTube video"
                }`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-xl text-white shadow-lg transition hover:scale-110 hover:bg-green-800">
                  ▶
                </span>
              </a>
            </div>

            {/* Video Information */}
            <div className="p-5">
              <h3 className="line-clamp-2 font-semibold text-slate-900">
                {item.title ||
                  "SHEF YouTube Video"}
              </h3>

              {item.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              )}

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Watch video →
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
