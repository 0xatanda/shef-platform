import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";

interface SiteContent {
  id: string;
  key: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ContentResponse {
  success: boolean;
  data: SiteContent;
}

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

interface FocusAreaListResponse {
  success: boolean;
  data: FocusArea[];
}

const defaultContent: Record<string, string> = {
  "about.hero.title": "About Us",

  "about.hero.description":
    "Shantytown Empowerment Foundation",

  "about.intro.title": "About Us",

  "about.intro.description":
    "Shantytown Empowerment Foundation (SHEF) is a non-governmental organization that supports the Nigeria Slum/Informal Settlement Federation (NSISF). We work with marginalized and deprived urban communities to advance social and economic transformation through community-led initiatives, advocacy, and inclusive development practices.",

  "about.intro.description_2":
    "Through our focal areas, SHEF seeks to build awareness around social and economic rights and explore practical strategies for securing their realization. We aim to broaden individual and community access to decision-making processes, while strengthening meaningful participation in the design and implementation of social and economic policies and programs that directly affect urban poor communities.",

  "about.focal_areas.title":
    "Our Focal Areas",

  "about.mission.title":
    "Our Mission",

  "about.mission.description":
    "Our mission is to empower informal settlement communities by strengthening their capacity to organize, generate data, influence policy, and drive inclusive urban development. We are committed to supporting community leadership, promoting equity, and enabling sustainable improvements in quality of life.",
};

const contentKeys = Object.keys(
  defaultContent,
);

async function getContent(
  key: string,
): Promise<string> {
  try {
    const response =
      await api.get<ContentResponse>(
        `/content/${encodeURIComponent(key)}`,
      );

    return (
      response.data.data.content ||
      defaultContent[key] ||
      ""
    );
  } catch (error: unknown) {
    console.error(
      `Failed to load About CMS content: ${key}`,
      error,
    );

    return defaultContent[key] || "";
  }
}

async function getFocusAreas(): Promise<
  FocusArea[]
> {
  try {
    const response =
      await api.get<FocusAreaListResponse>(
        "/focus-areas",
      );

    if (
      !response.data.success ||
      !Array.isArray(response.data.data)
    ) {
      throw new Error(
        "Invalid focus area response.",
      );
    }

    return response.data.data
      .filter(
        (area) =>
          area.is_active &&
          Boolean(area.slug) &&
          Boolean(area.title),
      )
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order,
      );
  } catch (error: unknown) {
    console.error(
      "Failed to load Focus Areas:",
      error,
    );

    return [];
  }
}

export default function About() {
  const [content, setContent] =
    useState<Record<string, string>>(
      defaultContent,
    );

  const [focusAreas, setFocusAreas] =
    useState<FocusArea[]>([]);

  const [loadingFocusAreas, setLoadingFocusAreas] =
    useState(true);

  useEffect(() => {
    document.title =
      "About | Shantytown Empowerment Foundation";
  }, []);

  /*
   * Load About page CMS content.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const results = await Promise.all(
          contentKeys.map(async (key) => ({
            key,
            value: await getContent(key),
          })),
        );

        if (cancelled) {
          return;
        }

        const nextContent = {
          ...defaultContent,
        };

        for (const result of results) {
          nextContent[result.key] =
            result.value;
        }

        setContent(nextContent);
      } catch (error) {
        console.error(
          "Failed to load About page content:",
          error,
        );
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load Focus Areas from the database.
   *
   * The database Focus Area slug is used
   * directly for the public page URL.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadFocusAreas() {
      try {
        setLoadingFocusAreas(true);

        const areas =
          await getFocusAreas();

        if (!cancelled) {
          setFocusAreas(areas);
        }
      } finally {
        if (!cancelled) {
          setLoadingFocusAreas(false);
        }
      }
    }

    void loadFocusAreas();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white">
      {/* =========================
          HERO IMAGE
      ========================== */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="/hero/about-hero.jpg"
            alt="Community empowerment and organizing"
            className="h-105 w-full object-cover"
          />
        </div>
      </div>

      {/* =========================
          CONTENT
      ========================== */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* INTRODUCTION */}
        <h1 className="mb-6 text-center text-4xl font-bold text-slate-900">
          {content["about.intro.title"]}
        </h1>

        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-gray-700">
          {
            content[
              "about.intro.description"
            ]
          }
        </p>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <p className="text-lg leading-relaxed text-gray-700">
            {
              content[
                "about.intro.description_2"
              ]
            }
          </p>
        </div>

        {/* =========================
            MISSION
        ========================== */}
        <div className="mx-auto mt-20 max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            {
              content[
                "about.mission.title"
              ]
            }
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            {
              content[
                "about.mission.description"
              ]
            }
          </p>
        </div>

        {/* =========================
            FOCAL AREAS
        ========================== */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
            {
              content[
                "about.focal_areas.title"
              ]
            }
          </h2>

          {loadingFocusAreas ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Loading focal areas...
            </div>
          ) : focusAreas.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No focal areas are currently
              available.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {focusAreas.map((area) => (
                <Link
                  key={area.id}
                  to={`/about/focal-areas/${encodeURIComponent(
                    area.slug,
                  )}`}
                  className="group rounded-lg bg-green-600 px-6 py-5 font-medium text-white transition hover:bg-green-700"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      {area.title}
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-xl transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}