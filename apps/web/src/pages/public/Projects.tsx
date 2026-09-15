import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProjects,
  type Project,
} from "../../api/projects";

import { getMediaUrl } from "../../api/media";

function formatDate(
  date?: string | null,
) {
  if (!date) return "";

  return new Date(
    date,
  ).toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const result =
          await getProjects();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load projects",
          );
        }

        if (!cancelled) {
          setProjects(
            result.data?.items ?? [],
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load projects",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold uppercase tracking-wider text-green-700">
            Our Work
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">
            Projects
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Explore projects and programmes
            led by SHEF with communities
            and partners.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="py-16 text-center text-gray-500">
              Loading projects...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="py-16 text-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  No projects yet
                </h2>

                <p className="mt-2 text-gray-500">
                  Published projects will appear here.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            projects.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(
                  (project) => (
                    <article
                      key={project.id}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {project.featured_image && (
                        <Link
                          to={`/projects/${project.id}`}
                        >
                          <img
                            src={getMediaUrl(
                              project.featured_image,
                            )}
                            alt={
                              project.title
                            }
                            className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </Link>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                          <span>
                            {project.status}
                          </span>

                          {project.published_at && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {formatDate(
                                  project.published_at,
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-slate-900">
                          {
                            project.title
                          }
                        </h2>

                        {project.summary && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                            {
                              project.summary
                            }
                          </p>
                        )}

                        <Link
                          to={`/projects/${project.slug}`}
                          className="mt-5 inline-flex font-semibold text-green-700 hover:text-green-800"
                        >
                          View project →
                        </Link>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
        </div>
      </section>
    </div>
  );
}