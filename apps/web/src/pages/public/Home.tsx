import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getProjects,
  type Project,
} from "../../api/projects";
import {
  getPublications,
  type Publication,
} from "../../api/publications";
import {
  getMediaUrl,
} from "../../api/media";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(
    [],
  );

  const [publications, setPublications] =
    useState<Publication[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [projectResult, publicationResult] =
          await Promise.all([
            getProjects(),
            getPublications(),
          ]);

        setProjects(
          projectResult.data?.items || [],
        );

        setPublications(
          publicationResult.data?.items || [],
        );
      } catch {
        // Public page remains usable if API is unavailable.
      }
    }

    load();
  }, []);

  return (
    <>
      <section className="bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-green-700 font-semibold mb-4">
              SHANTYTOWN EMPOWERMENT FOUNDATION
            </p>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Building stronger and more resilient
              communities together.
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-8">
              We work with communities to advance
              inclusive development, access to basic
              services, housing, livelihoods and
              sustainable urban development.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/projects"
                className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700"
              >
                Explore our work
              </Link>

              <Link
                to="/about"
                className="border border-green-600 text-green-700 px-6 py-3 rounded-md font-medium hover:bg-green-100"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-green-700 font-semibold">
              OUR WORK
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Projects creating community impact
            </h2>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500">
              Projects will appear here once they are
              published.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {projects.slice(0, 6).map((project) => (
                <article
                  key={project.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  {project.image_url && (
                    <img
                      src={getMediaUrl(
                        project.image_url,
                      )}
                      alt={project.title}
                      className="w-full h-52 object-cover"
                    />
                  )}

                  <div className="p-6">
                    <h3 className="font-semibold text-xl">
                      {project.title}
                    </h3>

                    <p className="mt-3 text-gray-600 line-clamp-3">
                      {project.description}
                    </p>

                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-block mt-5 text-green-700 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="mt-10">
              <Link
                to="/projects"
                className="text-green-700 font-semibold"
              >
                View all projects →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-green-700 font-semibold">
                RESOURCES
              </p>

              <h2 className="text-3xl font-bold mt-2">
                Latest publications
              </h2>
            </div>

            <Link
              to="/publications"
              className="text-green-700 font-semibold"
            >
              View all →
            </Link>
          </div>

          {publications.length === 0 ? (
            <p className="text-gray-500">
              Publications will appear here once
              published.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {publications.slice(0, 3).map(
                (publication) => (
                  <article
                    key={publication.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {publication.image_url && (
                      <img
                        src={getMediaUrl(
                          publication.image_url,
                        )}
                        alt={publication.title}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-6">
                      <h3 className="font-semibold text-lg">
                        {publication.title}
                      </h3>

                      <p className="mt-3 text-gray-600 line-clamp-3">
                        {publication.excerpt ||
                          publication.description}
                      </p>

                      <Link
                        to={`/publications/${publication.id}`}
                        className="inline-block mt-5 text-green-700 font-medium"
                      >
                        Read publication →
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Work with us to strengthen communities
          </h2>

          <p className="mt-5 text-gray-600 text-lg">
            Whether through partnership, community
            organising or support, there are many ways
            to contribute.
          </p>

          <Link
            to="/contact"
            className="inline-block mt-8 bg-green-600 text-white px-7 py-3 rounded-md font-medium hover:bg-green-700"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}