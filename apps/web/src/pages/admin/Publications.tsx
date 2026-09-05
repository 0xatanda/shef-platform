import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import api from "../../api/client";

type Publication = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: string;
  status: string;
  featured_image: string;
  author: string;
  published_at?: string | null;
};

type ListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Publication[];
  };
};

type FormState = {
  title: string;
  summary: string;
  content: string;
  type: string;
  status: string;
  featured_image: string;
  author: string;
};

const emptyForm: FormState = {
  title: "",
  summary: "",
  content: "",
  type: "article",
  status: "draft",
  featured_image: "",
  author: "",
};

const publicationTypes = [
  ["article", "Article"],
  ["report", "Report"],
  ["research", "Research"],
  ["policy_brief", "Policy Brief"],
  ["case_study", "Case Study"],
  ["other", "Other"],
] as const;

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const loadPublications = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<ListResponse>(
            "/admin/publications",
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load publications",
          );
        }

        setItems(
          response.data.data?.items ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load publications",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadPublications();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadPublications]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(
    publication: Publication,
  ) {
    setEditingId(publication.id);

    setForm({
      title: publication.title,
      summary: publication.summary || "",
      content: publication.content || "",
      type: publication.type || "article",
      status: publication.status || "draft",
      featured_image:
        publication.featured_image || "",
      author: publication.author || "",
    });

    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.put(
          `/admin/publications/${editingId}`,
          form,
        );
      } else {
        await api.post(
          "/admin/publications",
          form,
        );
      }

      closeForm();
      await loadPublications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save publication",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePublication(
    publication: Publication,
  ) {
    const confirmed = window.confirm(
      `Delete "${publication.title}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `/admin/publications/${publication.id}`,
      );

      await loadPublications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete publication",
      );
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Publications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage reports, research, articles and
            other SHEF publications.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006f34]"
        >
          Add Publication
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId
                  ? "Edit Publication"
                  : "Add Publication"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete the publication information
                below.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="text-2xl text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="publication-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Title
              </label>

              <input
                id="publication-title"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Publication title"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="publication-type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Type
                </label>

                <select
                  id="publication-type"
                  value={form.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                >
                  {publicationTypes.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="publication-status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="publication-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="publication-author"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Author
                </label>

                <input
                  id="publication-author"
                  value={form.author}
                  onChange={(event) =>
                    updateField(
                      "author",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600"
                  placeholder="Author"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="publication-summary"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Summary
              </label>

              <textarea
                id="publication-summary"
                value={form.summary}
                onChange={(event) =>
                  updateField(
                    "summary",
                    event.target.value,
                  )
                }
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Short description of the publication"
              />
            </div>

            <div>
              <label
                htmlFor="publication-content"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Content
              </label>

              <textarea
                id="publication-content"
                value={form.content}
                onChange={(event) =>
                  updateField(
                    "content",
                    event.target.value,
                  )
                }
                rows={14}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Publication content..."
                required
              />
            </div>

            <div>
              <label
                htmlFor="publication-image"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Featured Image
              </label>

              <input
                id="publication-image"
                value={form.featured_image}
                onChange={(event) =>
                  updateField(
                    "featured_image",
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="/uploads/publication.jpg"
              />

              <p className="mt-1 text-xs text-slate-500">
                Leave empty if the publication has no
                featured image.
              </p>
            </div>

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
                className="rounded-lg bg-[#00843D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Publication"
                    : "Create Publication"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-6 text-sm text-slate-500">
            Loading publications...
          </div>
        )}

        {!loading &&
          items.length === 0 && (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No publications found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first publication from the CMS.
              </p>
            </div>
          )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((publication) => (
              <div
                key={publication.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-900">
                    {publication.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {publication.slug}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize text-slate-600">
                      {publication.type.replace(
                        "_",
                        " ",
                      )}
                    </span>

                    <span
                      className={
                        publication.status ===
                        "published"
                          ? "rounded-full bg-green-50 px-2.5 py-1 text-green-700"
                          : "rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"
                      }
                    >
                      {publication.status}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(publication)
                    }
                    className="text-sm font-medium text-[#00843D] hover:text-[#006f34]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void deletePublication(
                        publication,
                      )
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}