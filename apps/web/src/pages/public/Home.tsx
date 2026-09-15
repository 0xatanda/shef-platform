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

const metrics = [
  {
    value: 25,
    suffix: "+",
    label: "Savings Groups Supported",
  },
  {
    value: 10,
    suffix: "+",
    label: "Communities Reached",
  },
  {
    value: 5000,
    suffix: "+",
    label: "Households Impacted",
  },
  {
    value: 3,
    suffix: "+",
    label: "Years of Community Organizing",
  },
];

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

function resolveImageUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const origin = API_ORIGIN.replace(/\/$/, "");

  if (url.startsWith("/uploads/")) {
    return `${origin}${url}`;
  }

  return url;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingPartners, setLoadingPartners] =
    useState(true);

  useEffect(() => {
    document.title =
      "Home | Shantytown Empowerment Foundation";
  }, []);

  /*
   * PROJECTS
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchHomeProjects() {
      try {
        const response =
          await api.get<ProjectListResponse>(
            "/projects",
          );

        if (cancelled) {
          return;
        }

        if (response.data.success) {
          setProjects(
            response.data.data?.items?.slice(0, 3) ??
              [],
          );
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
   * PARTNERS
   *
   * The public API returns:
   *
   * {
   *   success: true,
   *   data: [...]
   * }
   *
   * It does NOT return:
   *
   * data: {
   *   items: [...]
   * }
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchHomePartners() {
      try {
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

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Shantytown Empowerment Foundation
            </h1>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-gray-600 md:mx-0">
              SHEF is a dedicated non-governmental
              organization supporting the Nigeria
              Slum/Informal Settlement Federation
              (NSISF), committed to empowering
              marginalized and deprived communities
              through social and economic transformation
              initiatives aimed at improving livelihoods,
              promoting sustainable development, and
              fostering inclusive growth across Nigeria.
            </p>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600 md:mx-0">
              SHEF and the Nigeria Federation are Nigeria
              affiliates of Slum Dwellers International
              (SDI). Through partnerships, advocacy, and
              community-driven projects, SHEF works to
              address critical needs in housing, water,
              sanitation, health, and economic empowerment,
              helping communities build resilience and
              achieve lasting progress.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <a
                href="/projects"
                className="rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Our Projects
              </a>

              <a
                href="/about"
                className="rounded-md border border-green-600 px-6 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                Learn More
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
            Our Impact
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            Through community savings, data collection,
            advocacy, and partnerships, SHEF supports
            informal settlement communities to lead their
            own development and influence inclusive
            policies.
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
                Our Projects
              </h2>

              <p className="mt-4 max-w-xl text-gray-600">
                Community-led initiatives supporting
                inclusive development, improved
                livelihoods, and resilient informal
                settlements.
              </p>
            </div>

            <a
              href="/projects"
              className="hidden text-sm font-semibold text-green-700 hover:text-green-800 sm:block"
            >
              View all projects →
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
                      project.slug || project.id
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
                  Our latest projects will appear here.
                </p>
              </div>
            )}

          <a
            href="/projects"
            className="mt-8 inline-block text-sm font-semibold text-green-700 sm:hidden"
          >
            View all projects →
          </a>
        </div>
      </section>

      {/* MEDIA */}
      <MediaShowcase />

      {/* PARTNERS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Our Partners
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            We collaborate with trusted institutions,
            academic partners, and community networks to
            drive sustainable and inclusive impact.
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
                const logoUrl = resolveImageUrl(
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
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={partner.name}
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
