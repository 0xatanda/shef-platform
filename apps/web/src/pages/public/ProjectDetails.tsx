import { useEffect, useState } from "react";
import {
  useParams,
} from "react-router-dom";
import {
  getProject,
  type Project,
} from "../../api/projects";
import { getMediaUrl } from "../../api/media";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getProject(id)
      .then((result) => {
        setProject(result.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        Project not found.
      </div>
    );
  }

  return (
    <article>
      {project.image_url && (
        <img
          src={getMediaUrl(project.image_url)}
          alt={project.title}
          className="w-full h-105 object-cover"
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">
          {project.title}
        </h1>

        {project.location && (
          <p className="text-green-700 mt-3">
            {project.location}
          </p>
        )}

        <div className="mt-8 text-gray-700 leading-8 whitespace-pre-line">
          {project.content ||
            project.description}
        </div>
      </div>
    </article>
  );
}