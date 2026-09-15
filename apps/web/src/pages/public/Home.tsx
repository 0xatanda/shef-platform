import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import AvatarCloud from "../../components/AvatarCloud";
import AnimatedNumber from "../../components/AnimatedNumber";
import MediaShowcase from "../../components/MediaShowcase";

type Partner = {
  id: string;
  name: string;
  logo: string;
  website: string;
  description?: string;
  display_order: number;
  is_active: boolean;
};

type Project = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  summary?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
};

type ProjectListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Project[];
  };
};

type PartnerListResponse = {
  success: boolean;
  message?: string;
  data?: Partner[];
};

type SiteContent = {
  id: string;
  key: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type SiteContentResponse = {
  success: boolean;
  message?: string;
  data?: SiteContent;
};

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

function resolveImageUrl(
  url?: string | null,
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

/*
 * Default homepage content.
 *
 * These values are used when a corresponding
 * Site Content record does not yet exist.
 */
const defaultContent: Record<
  string,
  string
> = {
  "home.hero.title":
    "Shantytown Empowerment Foundation",

  "home.hero.description":
    "SHEF is a dedicated non-governmental organization supporting the Nigeria Slum/Informal Settlement Federation (NSISF), committed to empowering marginalized and deprived communities through social and economic transformation initiatives aimed at improving livelihoods, promoting sustainable development, and fostering inclusive growth across Nigeria.",

  "home.hero.description_2":
    "SHEF and the Nigeria Federation are Nigeria affiliates of Slum Dwellers International (SDI). Through partnerships, advocacy, and community-driven projects, SHEF works to address critical needs in housing, water, sanitation, health, and economic empowerment, helping communities build resilience and achieve lasting progress.",

  "home.hero.projects_button":
    "Our Projects",

  "home.hero.about_button":
    "Learn More",

  "home.impact.title":
    "Our Impact",

  "home.impact.description":
    "Through community savings, data collection, advocacy, and partnerships, SHEF supports informal settlement communities to lead their own development and influence inclusive policies.",

  "home.impact.savings_groups":
    "25",

  "home.impact.savings_groups_label":
    "Savings Groups Supported",

  "home.impact.communities":
    "10",

  "home.impact.communities_label":
    "Communities Reached",

  "home.impact.households":
    "5000",

  "home.impact.households_label":
    "Households Impacted",

  "home.impact.years":
    "3",

  "home.impact.years_label":
    "Years of Community Organizing",

  "home.projects.title":
    "Our Projects",

  "home.projects.description":
    "Community-led initiatives supporting inclusive development, improved livelihoods, and resilient informal settlements.",

  "home.projects.view_all":
    "View all projects →",

  "home.media.title":
    "Featured Videos",

  "home.media.description":
    "Watch stories, updates, and community voices from SHEF and the Nigeria Slum/Informal Settlement Federation.",

  "home.media.view_all":
    "View all videos →",

  "home.partners.title":
    "Our Partners",

  "home.partners.description":
    "We collaborate with trusted institutions, academic partners, and community networks to drive sustainable and inclusive impact.",
};

const metricDefaults = [
  {
    value: 25,
    label: "Savings Groups Supported",
  },
  {
    value: 10,
    label: "Communities Reached",
  },
  {
    value: 5000,
    label: "Households Impacted",
  },
  {
    value: 3,
    label: "Years of Community Organizing",
  },
];

export default function Home() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [partners, setPartners] =
    useState<Partner[]>([]);

  const [content, setContent] =
    useState<Record<string, string>>(
      defaultContent,
    );

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingPartners, setLoadingPartners] =
    useState(true);

  useEffect(() => {
    document.title =
      "Home | Shantytown Empowerment Foundation";
  }, []);

  /*
   * LOAD SITE CONTENT
   *
   * Public endpoint:
   * GET /api/v1/content/:key
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchHomeContent() {
      const keys =
        Object.keys(defaultContent);

      const results =
        await Promise.all(
          keys.map(async (key) => {
            try {
              const response =
                await api.get<SiteContentResponse>(
                  `/content/${encodeURIComponent(
                    key,
                  )}`,
                );

              if (
                response.data.success &&
                response.data.data
              ) {
                return {
                  key,
                  value:
                    response.data.data
                      .content ||
                    response.data.data.title ||
                    defaultContent[key],
                };
              }
            } catch {
              /*
               * The CMS record may not exist yet.
               * Use the homepage default.
               */
            }

            return {
              key,
              value: defaultContent[key],
            };
          }),
        );

      if (cancelled) {
        return;
      }

      const nextContent = {
        ...defaultContent,
      };

      results.forEach((item) => {
        nextContent[item.key] =
          item.value;
      });

      setContent(nextContent);
    }

    void fetchHomeContent();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * LOAD PROJECTS
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchHomeProjects() {
      try {
        setLoadingProjects(true);

        const response =
          await api.get<ProjectListResponse>(
            "/projects",
          );

        if (cancelled) {
          return;
        }

        if (response.data.success) {
          setProjects(
            response.data.data?.items?.slice(
              0,
              3,
            ) ?? [],
          );
        } else {
          setProjects([]);
        }
      } catch {
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    }

    void fetchHomeProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * LOAD PARTNERS
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchHomePartners() {
      try {
        setLoadingPartners(true);

        const response =
          await api.get<PartnerListResponse>(
            "/partners",
          );

        if (cancelled) {
          return;
        }

        if (!response.data.success) {
          setPartners([]);
          return;
        }

        const activePartners = (
          response.data.data ?? []
        )
          .filter(
            (partner) =>
              partner.is_active !== false,
          )
          .sort(
            (a, b) =>
              a.display_order -
                b.display_order ||
              a.name.localeCompare(b.name),
          );

        setPartners(activePartners);
      } catch {
        if (!cancelled) {
          setPartners([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPartners(false);
        }
      }
    }

    void fetchHomePartners();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * GET CMS CONTENT
   */
  function getContent(
    key: string,
  ): string {
    return (
      content[key] ||
      defaultContent[key] ||
      ""
    );
  }

  /*
   * IMPACT METRICS
   */
  const metrics = [
    {
      value:
        Number(
          getContent(
            "home.impact.savings_groups",
          ),
        ) ||
        metricDefaults[0].value,

      suffix: "+",

      label:
        getContent(
          "home.impact.savings_groups_label",
        ) ||
        metricDefaults[0].label,
    },

    {
      value:
        Number(
          getContent(
            "home.impact.communities",
          ),
        ) ||
        metricDefaults[1].value,

      suffix: "+",

      label:
        getContent(
          "home.impact.communities_label",
        ) ||
        metricDefaults[1].label,
    },

    {
      value:
        Number(
          getContent(
            "home.impact.households",
          ),
        ) ||
        metricDefaults[2].value,

      suffix: "+",

      label:
        getContent(
          "home.impact.households_label",
        ) ||
        metricDefaults[2].label,
    },

    {
      value:
        Number(
          getContent(
            "home.impact.years",
          ),
        ) ||
        metricDefaults[3].value,

      suffix: "+",

      label:
        getContent(
          "home.impact.years_label",
        ) ||
        metricDefaults[3].label,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              {getContent(
                "home.hero.title",
              )}
            </h1>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-gray-600 md:mx-0">
              {getContent(
                "home.hero.description",
              )}
            </p>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600 md:mx-0">
              {getContent(
                "home.hero.description_2",
              )}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <a
                href="/projects"
                className="rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700"
              >
                {getContent(
                  "home.hero.projects_button",
                )}
              </a>

              <a
                href="/about"
                className="rounded-md border border-green-600 px-6 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                {getContent(
                  "home.hero.about_button",
                )}
              </a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <AvatarCloud />
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            {getContent(
              "home.impact.title",
            )}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            {getContent(
              "home.impact.description",
            )}
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-gray-200 bg-white p-6 text-center"
              >
                <div className="text-3xl font-bold text-green-700">
                  <AnimatedNumber
                    value={metric.value}
                    suffix={metric.suffix}
                  />
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {getContent(
                  "home.projects.title",
                )}
              </h2>

              <p className="mt-4 max-w-xl text-gray-600">
                {getContent(
                  "home.projects.description",
                )}
              </p>
            </div>

            <a
              href="/projects"
              className="hidden text-sm font-semibold text-green-700 hover:text-green-800 sm:block"
            >
              {getContent(
                "home.projects.view_all",
              )}
            </a>
          </div>

          {loadingProjects && (
            <div className="mt-10 text-sm text-gray-500">
              Loading projects...
            </div>
          )}

          {!loadingProjects &&
            projects.length > 0 && (
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {projects.map((project) => (
                  <a
                    key={project.id}
                    href={`/projects/${
                      project.slug ||
                      project.id
                    }`}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {project.image_url && (
                      <img
                        src={resolveImageUrl(
                          project.image_url,
                        )}
                        alt={
                          project.title ||
                          project.name ||
                          "SHEF project"
                        }
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {project.title ||
                          project.name ||
                          "Untitled project"}
                      </h3>

                      {(project.summary ||
                        project.description) && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {project.summary ||
                            project.description}
                        </p>
                      )}

                      <span className="mt-5 inline-block text-sm font-semibold text-green-700">
                        Learn more →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

          {!loadingProjects &&
            projects.length === 0 && (
              <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-500">
                  Our latest projects will
                  appear here.
                </p>
              </div>
            )}

          <a
            href="/projects"
            className="mt-8 inline-block text-sm font-semibold text-green-700 sm:hidden"
          >
            {getContent(
              "home.projects.view_all",
            )}
          </a>
        </div>
      </section>

      {/* FEATURED YOUTUBE VIDEOS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {getContent(
                  "home.media.title",
                )}
              </h2>

              <p className="mt-4 max-w-xl text-gray-600">
                {getContent(
                  "home.media.description",
                )}
              </p>
            </div>

            <a
              href="/media"
              className="hidden text-sm font-semibold text-green-700 hover:text-green-800 sm:block"
            >
              {getContent(
                "home.media.view_all",
              )}
            </a>
          </div>

          <div className="mt-10">
            <MediaShowcase />
          </div>

          <a
            href="/media"
            className="mt-8 inline-block text-sm font-semibold text-green-700 sm:hidden"
          >
            {getContent(
              "home.media.view_all",
            )}
          </a>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            {getContent(
              "home.partners.title",
            )}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            {getContent(
              "home.partners.description",
            )}
          </p>

          {loadingPartners ? (
            <div className="mt-12 text-center text-sm text-gray-500">
              Loading partners...
            </div>
          ) : partners.length === 0 ? (
            <div className="mt-12 text-center text-sm text-gray-500">
              Our partners will appear here.
            </div>
          ) : (
            <motion.div
              className="mt-12 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                  },
                },
              }}
            >
              {partners.map((partner) => {
                const logoUrl =
                  resolveImageUrl(
                    partner.logo,
                  );

                const logo = (
                  <div className="flex h-32 w-full items-center justify-center rounded-xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={
                          partner.name ||
                          "SHEF partner"
                        }
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-center text-sm font-semibold text-gray-700">
                        {partner.name}
                      </span>
                    )}
                  </div>
                );

                return (
                  <motion.div
                    key={partner.id}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 20,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                      },
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    {partner.website ? (
                      <a
                        href={
                          partner.website
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                          partner.name
                        }
                        title={partner.name}
                        className="block"
                      >
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
