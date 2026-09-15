
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import api, {
  API_ORIGIN,
} from "../../api/client";

import {
  createPartner,
  deletePartner,
  getPartners,
  updatePartner,
} from "../../api/partners";

import type {
  Partner,
  PartnerForm,
} from "../../api/partners";

const emptyForm: PartnerForm = {
  name: "",
  logo: "",
  website: "",
  description: "",
  display_order: 0,
  is_active: true,
};

function resolveImageUrl(
  url?: string | null,
) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const origin = API_ORIGIN.replace(
    /\/$/,
    "",
  );

  return url.startsWith("/")
    ? `${origin}${url}`
    : `${origin}/${url}`;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function Partners() {
  const [partners, setPartners] =
    useState<Partner[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<PartnerForm>(emptyForm);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const loadPartners = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await getPartners(page, 20);

        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load partners",
          );
        }

        setPartners(
          result.data.items || [],
        );

        setTotalPages(
          result.data.pagination
            ?.total_pages || 1,
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Unable to load partners",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => { 
    const timer = window.setTimeout(() => { 
      void loadPartners(); 
    }, 0); 
    return () => { 
      window.clearTimeout(timer); 
    }; 
  }, [loadPartners]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const {
      name,
      value,
      type,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  }

  function handleActiveChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((current) => ({
      ...current,
      is_active:
        event.target.checked,
    }));
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image must be smaller than 10MB.",
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await api.post(
          "/admin/uploads",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );

      const uploadedUrl =
        response.data?.data?.url ||
        response.data?.url;

      if (!uploadedUrl) {
        throw new Error(
          "Image uploaded, but no image URL was returned.",
        );
      }

      setForm((current) => ({
        ...current,
        logo: uploadedUrl,
      }));

      setSuccess(
        "Partner image uploaded successfully.",
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to upload partner image.",
        ),
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function handleEdit(
    partner: Partner,
  ) {
    setEditingId(partner.id);

    setForm({
      name: partner.name || "",
      logo: partner.logo || "",
      website:
        partner.website || "",
      description:
        partner.description || "",
      display_order:
        partner.display_order || 0,
      is_active:
        partner.is_active,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(
    partner: Partner,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${partner.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deletePartner(
        partner.id,
      );

      setSuccess(
        "Partner deleted successfully.",
      );

      await loadPartners();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete partner.",
        ),
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Partner name is required.",
      );

      return;
    }

    if (!form.logo) {
      setError(
        "Please select a partner image.",
      );

      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updatePartner(
          editingId,
          form,
        );

        setSuccess(
          "Partner updated successfully.",
        );
      } else {
        await createPartner(
          form,
        );

        setSuccess(
          "Partner created successfully.",
        );
      }

      resetForm();

      await loadPartners();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save partner.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Partners
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage SHEF partners and
            collaborating organisations.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Partner Form */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId
                ? "Edit Partner"
                : "Add Partner"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the organisation information
              and upload its logo.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Partner Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. SDI"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Website
              </label>

              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.org"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Partner Image / Logo
            </label>

            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {uploading
                  ? "Uploading..."
                  : "Choose Image"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageUpload
                  }
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {form.logo && (
                <div className="h-32 w-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={resolveImageUrl(
                      form.logo,
                    )}
                    alt={
                      form.name ||
                      "Partner preview"
                    }
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Select an image from your device.
              Maximum size: 10MB.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Brief description of the partnership..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Display Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Display Order
              </label>

              <input
                type="number"
                name="display_order"
                value={
                  form.display_order
                }
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D]"
              />

              <p className="mt-2 text-xs text-slate-500">
                Lower numbers appear first.
              </p>
            </div>

            {/* Active */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={
                    handleActiveChange
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#00843D] focus:ring-[#00843D]"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-700">
                    Active partner
                  </span>

                  <span className="block text-xs text-slate-500">
                    Active partners appear on
                    the public website.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={
                saving || uploading
              }
              className="rounded-lg bg-[#00843D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Partner"
                  : "Add Partner"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Partners List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Existing Partners
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading partners...
          </div>
        ) : partners.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-slate-900">
              No partners yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add your first partner using
              the form above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {partners.map(
              (partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                >
                  {/* Partner info */}
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <img
                        src={resolveImageUrl(
                          partner.logo,
                        )}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {partner.name}
                      </h3>

                      {partner.website && (
                        <a
                          href={
                            partner.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-sm text-green-700 hover:underline"
                        >
                          {
                            partner.website
                          }
                        </a>
                      )}

                      {partner.description && (
                        <p className="mt-2 line-clamp-2 max-w-xl text-sm text-slate-500">
                          {
                            partner.description
                          }
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            partner.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {partner.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <span className="text-xs text-slate-400">
                          Order:{" "}
                          {
                            partner.display_order
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          partner,
                        )
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          partner,
                        )
                      }
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-slate-500">
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
      </div>
    </section>
  );
}