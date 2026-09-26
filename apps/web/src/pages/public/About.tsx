import { useEffect, useState } from "react";
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

  "about.focal_areas.items":
    "Economic and Capacity Building Program\nPolicy and Advocacy Program\nCommunity Health and Environment Program\nHousing and Community Upgrade Program\nStorytelling for Impact (Know-Your-City TV)\nProfiling and Data Collection Program",

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

function getFocalAreas(
  content: Record<string, string>,
): string[] {
  const items =
    content["about.focal_areas.items"] ||
    "";

  return items
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function About() {
  const [content, setContent] =
    useState<Record<string, string>>(
      defaultContent,
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    document.title =
      "About | Shantytown Empowerment Foundation";
  }, []);

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
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const focalAreas =
    getFocalAreas(content);

  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="/hero/about-hero.jpg"
            alt={
              content[
                "about.hero.description"
              ] ||
              "Community empowerment and organizing"
            }
            className="h-105 w-full object-cover"
          />

          {/* Hero Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <div className="px-6 text-center text-white">
              <h1 className="text-4xl font-bold sm:text-5xl">
                {loading
                  ? defaultContent[
                      "about.hero.title"
                    ]
                  : content[
                      "about.hero.title"
                    ]}
              </h1>

              {content[
                "about.hero.description"
              ] && (
                <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg">
                  {
                    content[
                      "about.hero.description"
                    ]
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-6 text-center text-4xl font-bold text-slate-900">
          {content[
            "about.intro.title"
          ]}
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

       

        {/* MISSION */}
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

         {/* FOCAL AREAS */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
            {
              content[
                "about.focal_areas.title"
              ]
            }
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {focalAreas.map((area) => (
              <div
                key={area}
                className="rounded-lg bg-green-600 px-6 py-4 font-medium text-white transition hover:bg-green-700"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}