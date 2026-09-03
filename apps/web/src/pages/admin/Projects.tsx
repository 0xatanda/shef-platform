import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import api from "../../api/client";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string | null;
  status?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type ProjectForm = {
  title: string;
  slug: string;
  description: string;
  image_url: string;
  status: string;
  sort_order: number;
  is_active: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ProjectListData = {
  items: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

const emptyForm: ProjectForm = {
  title: "",
  slug: "",
  description: "",
  image_url: "",
  status: "active",
  sort_order: 0,
  is_active: true,
};

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ApiResponse<ProjectListData>>(
        "/admin/projects",
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to load projects",
        );
      }

      setItems(response.data.data?.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function fetchProjects() {
    try {
      const token = localStorage.getItem("shef_token");

      const response = await api.get("/admin/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!cancelled) {
        setItems(response.data?.data?.items ?? []);
        setError("");
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

  void fetchProjects();

  return () => {
    cancelled = true;
  };
}, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title ?? "",
      slug: project.slug ?? "",
      description: project.description ?? "",
      image_url: project.image_url ?? "",
      status: project.status ?? "active",
      sort_order: project.sort_order ?? 0,
      is_active:
        project.is_active !== undefined
          ? project.is_active
          : true,
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || null,
        status: form.status,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
      };

      if (!payload.title) {
        throw new Error("Project title is required");
      }

      if (editingId) {
        const response = await api.put<ApiResponse<Project>>(
          `/admin/projects/${editingId}`,
          payload,
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Unable to update project",
          );
        }
      } else {
        const response = await api.post<ApiResponse<Project>>(
          "/admin/projects",
          payload,
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Unable to create project",
          );
        }
      }

      closeForm();
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save project",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(project.id);
      setError("");

      const response = await api.delete<
        ApiResponse<null>
      >(`/admin/projects/${project.id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to delete project",
        );
      }

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete project",
      );
    } finally {
      setDeleting(null);
    }
  }

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
          onClick={openCreateForm}
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006f34]"
        >
          Add Project
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Project" : "Add Project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the project information."
                  : "Create a new SHEF project."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="project-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project Title
              </label>

              <input
                id="project-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="project-slug"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Slug
              </label>

              <input
                id="project-slug"
                type="text"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
                placeholder="project-slug"
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="project-description"
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                rows={7}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
                placeholder="Describe the project..."
              />
            </div>

            <div>
              <label
                htmlFor="project-image"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Image URL
              </label>

              <input
                id="project-image"
                type="text"
                value={form.image_url}
                onChange={(event) =>
                  updateField(
                    "image_url",
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
                placeholder="/uploads/project.jpg"
              />
            </div>

            {form.image_url && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Image Preview
                </p>

                <img
                  src={form.image_url}
                  alt={form.title || "Project preview"}
                  className="h-48 w-full rounded-lg object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="project-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="project-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D]"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-sort"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Sort Order
                </label>

                <input
                  id="project-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(event) =>
                    updateField(
                      "sort_order",
                      Number(event.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField(
                    "is_active",
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm text-slate-700">
                Project is active
              </span>
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#00843D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Project"
                    : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-6 text-sm text-slate-500">
            Loading projects...
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

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
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
                      <div className="flex items-center gap-4">
                        {project.image_url && (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="h-12 w-16 rounded-md object-cover"
                          />
                        )}

                        <div>
                          <p className="font-medium text-slate-900">
                            {project.title ||
                              "Untitled project"}
                          </p>

                          {project.slug && (
                            <p className="text-xs text-slate-500">
                              {project.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.status ||
                        (project.is_active
                          ? "Active"
                          : "Inactive")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(project)
                          }
                          className="text-sm font-medium text-[#00843D] hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(project)
                          }
                          disabled={
                            deleting === project.id
                          }
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deleting === project.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}