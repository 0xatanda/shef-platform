import { useEffect, useState } from "react";
import {
  getProjects,
  type Project,
} from "../../api/projects";
import { getMediaUrl } from "../../api/media";
import { Link } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((result) => {
        setProjects(result.data?.items || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-700 font-semibold">
            OUR WORK
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Projects
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500">
              No projects have been published yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {project.image_url && (
                    <img
                      src={getMediaUrl(
                        project.image_url,
                      )}
                      alt={project.title}
                      className="w-full h-56 object-cover"
                    />
                  )}

                  <div className="p-6">
                    <h2 className="text-xl font-semibold">
                      {project.title}
                    </h2>

                    <p className="text-gray-600 mt-3">
                      {project.description}
                    </p>

                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-block mt-5 text-green-700 font-medium"
                    >
                      View project →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}