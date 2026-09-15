import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProject,
  type Project,
} from "../../api/projects";
import { API_ORIGIN } from "../../api/client";

function resolveImageUrl(url?: string | null) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setError("Project not found");
        setLoading(false);
        return;
      }

      try {
        const result = await getProject(slug);

        if (!result.success || !result.data) {
          throw new Error(
            result.message || "Unable to load project",
          );
        }

        const loadedProject = result.data;

        if (!cancelled) {
          setProject(loadedProject);

          document.title = `${loadedProject.title} | SHEF`;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load project",
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
  }, [slug]);

  if (loading) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center text-gray-500">
          Loading project...
        </div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Project not found
          </h1>

          <p className="mt-3 text-gray-500">
            {error || "The project could not be found."}
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-block font-semibold text-green-700"
          >
            ← Back to projects
          </Link>
        </div>
      </section>
    );
  }

  const featuredMedia = project.media?.find(
    (media) => media.is_featured,
  );

  const featuredImage =
    featuredMedia?.url ||
    project.featured_image ||
    project.media?.[0]?.url ||
    "";

  return (
    <article>
      {/* Project Header */}
      <section className="bg-green-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="text-sm font-semibold text-green-700"
          >
            ← Projects
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-green-700">
            Project
          </p>

          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {project.title}
          </h1>

          {project.published_at && (
            <div className="mt-5 text-sm text-gray-600">
              {new Date(
                project.published_at,
              ).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </section>

      {/* Project Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Featured Image */}
          {featuredImage && (
            <img
              src={resolveImageUrl(featuredImage)}
              alt={project.title}
              className="mb-12 max-h-130 w-full rounded-2xl object-cover"
            />
          )}

          {/* Summary */}
          {project.summary && (
            <p className="mb-10 text-xl leading-8 text-gray-600">
              {project.summary}
            </p>
          )}

          {/* Project Content */}
          {project.content && (
            <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">
              {project.content}
            </div>
          )}

          {/* Project Gallery */}
          {project.media && project.media.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-8 text-2xl font-bold text-slate-900">
                Project Gallery
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                {project.media
                  .filter(
                    (media) =>
                      media.url &&
                      media.url !== featuredImage,
                  )
                  .sort(
                    (a, b) =>
                      a.sort_order - b.sort_order,
                  )
                  .map((media) => (
                    <img
                      key={media.id}
                      src={resolveImageUrl(media.url)}
                      alt={
                        media.alt_text ||
                        project.title
                      }
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </article>
  );
}