import { useEffect, useState } from "react";

type Project = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  status?: string;
  is_active?: boolean;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Project[];
  };
};

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);

        const token = localStorage.getItem("shef_token");

        const response = await fetch("/api/v1/admin/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load projects");
        }

        setItems(result.data?.items ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load projects",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage SHEF projects and programmes.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006f34]"
        >
          Add Project
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-6 text-sm text-slate-500">
            Loading projects...
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-slate-900">
              No projects yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Projects created from the CMS will appear here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {project.title ||
                        project.name ||
                        "Untitled project"}
                    </p>

                    {project.slug && (
                      <p className="text-xs text-slate-500">
                        {project.slug}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {project.status ||
                      (project.is_active ? "Active" : "Inactive")}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#00843D]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}