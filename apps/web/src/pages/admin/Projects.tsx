import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import api from "../../api/client";
import { getMediaUrl } from "../../api/media";

type ProjectMedia = {
  id: string;
  media_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_featured: boolean;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
  media: ProjectMedia[];
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ProjectForm = {
  title: string;
  summary: string;
  content: string;
  status: "draft" | "published";
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

type UploadResponse = {
  url: string;
};

type ContentMedia = {
  id: string;
  url: string;
};

const emptyForm: ProjectForm = {
  title: "",
  summary: "",
  content: "",
  status: "draft",
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function Projects() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const [existingMedia, setExistingMedia] = useState<ProjectMedia[]>(
    [],
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>(
    [],
  );

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  function getErrorMessage(
    err: unknown,
    fallback: string,
  ) {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err
    ) {
      const response = (
        err as {
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

    if (err instanceof Error) {
      return err.message;
    }

    return fallback;
  }

  /*
   * ---------------------------------------------------------
   * Load projects
   * ---------------------------------------------------------
   */

  const loadProjects = useCallback(async () => {
    try {
      const response =
        await api.get<ApiResponse<ProjectListData>>(
          "/admin/projects",
        );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Unable to load projects.",
        );
      }

      setItems(
        response.data.data?.items ?? [],
      );
    } catch (err) {
      console.error(
        "Failed to load projects:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load projects.",
        ),
      );

      setItems([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response =
          await api.get<ApiResponse<ProjectListData>>(
            "/admin/projects",
          );

        if (cancelled) {
          return;
        }

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load projects.",
          );
        }

        setItems(
          response.data.data?.items ?? [],
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load projects:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load projects.",
          ),
        );

        setItems([]);
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
  }, []);

  /*
   * ---------------------------------------------------------
   * Image selection
   * ---------------------------------------------------------
   */

  function resetImageSelection() {
    setSelectedPreviews((current) => {
      current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      return [];
    });

    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeSelectedImage(index: number) {
    setSelectedPreviews((current) => {
      const preview = current[index];

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      return current.filter(
        (_, previewIndex) =>
          previewIndex !== index,
      );
    });

    setSelectedFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length === 0) {
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        errors.push(
          `${file.name} is not a valid image file.`,
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(
          `${file.name} is larger than 10MB.`,
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setError(
        errors.join(" ") ||
          "No valid images were selected.",
      );

      event.target.value = "";
      return;
    }

    setError("");

    /*
     * Prevent the same file from being selected twice.
     */
    setSelectedFiles((current) => {
      const existingKeys = new Set(
        current.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );

      const newFiles = validFiles.filter(
        (file) =>
          !existingKeys.has(
            `${file.name}-${file.size}-${file.lastModified}`,
          ),
      );

      return [
        ...current,
        ...newFiles,
      ];
    });

    setSelectedPreviews((current) => {
      const currentFileKeys = new Set(
        selectedFiles.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );

      const newPreviews = validFiles
        .filter(
          (file) =>
            !currentFileKeys.has(
              `${file.name}-${file.size}-${file.lastModified}`,
            ),
        )
        .map((file) =>
          URL.createObjectURL(file),
        );

      return [
        ...current,
        ...newPreviews,
      ];
    });

    /*
     * Allows selecting the same file again later.
     */
    event.target.value = "";

    if (errors.length > 0) {
      setError(errors.join(" "));
    }
  }

  /*
   * ---------------------------------------------------------
   * Form
   * ---------------------------------------------------------
   */

  function openCreateForm() {
    resetImageSelection();

    setEditingId(null);
    setExistingMedia([]);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  async function openEditForm(
    project: Project,
  ) {
    resetImageSelection();

    setEditingId(project.id);

    setForm({
      title: project.title ?? "",
      summary: project.summary ?? "",
      content: project.content ?? "",
      status:
        project.status === "published"
          ? "published"
          : "draft",
    });

    setExistingMedia(
      project.media ?? [],
    );

    setError("");
    setShowForm(true);

    try {
      const response =
        await api.get<ApiResponse<Project>>(
          `/admin/projects/${project.id}`,
        );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Unable to load project.",
        );
      }

      setExistingMedia(
        response.data.data?.media ?? [],
      );

      setForm({
        title:
          response.data.data?.title ??
          project.title ??
          "",
        summary:
          response.data.data?.summary ??
          project.summary ??
          "",
        content:
          response.data.data?.content ??
          project.content ??
          "",
        status:
          response.data.data?.status ===
          "published"
            ? "published"
            : "draft",
      });
    } catch (err) {
      console.error(
        "Failed to load project:",
        err,
      );

      /*
       * Keep the data already available from
       * the project list if the detail request fails.
       */
      setExistingMedia(
        project.media ?? [],
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load project images.",
        ),
      );
    }
  }

  function closeForm() {
    if (saving || uploading) {
      return;
    }

    resetImageSelection();

    setShowForm(false);
    setEditingId(null);
    setExistingMedia([]);
    setForm(emptyForm);
    setError("");
  }

  function updateField<
    K extends keyof ProjectForm,
  >(
    field: K,
    value: ProjectForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * ---------------------------------------------------------
   * Upload images
   * ---------------------------------------------------------
   */

  async function uploadProjectImages(
    projectId: string,
  ) {
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    try {
      /*
       * Check whether the project already has a
       * featured image before uploading new images.
       */
      let hasFeaturedImage =
        existingMedia.some(
          (media) => media.is_featured,
        );

      for (
        let index = 0;
        index < selectedFiles.length;
        index += 1
      ) {
        const file = selectedFiles[index];

        /*
         * ---------------------------------------------------
         * STEP 1
         * Upload physical file.
         * ---------------------------------------------------
         */

        const formData = new FormData();

        formData.append(
          "file",
          file,
        );

        const uploadResponse =
          await api.post<
            ApiResponse<UploadResponse>
          >(
            "/admin/uploads",
            formData,
          );

        if (
          !uploadResponse.data.success
        ) {
          throw new Error(
            uploadResponse.data.message ||
              `Unable to upload ${file.name}.`,
          );
        }

        const mediaUrl =
          uploadResponse.data.data?.url;

        if (!mediaUrl) {
          throw new Error(
            `The server did not return an image URL for ${file.name}.`,
          );
        }

        /*
         * ---------------------------------------------------
         * STEP 2
         * Create ContentMedia record.
         * ---------------------------------------------------
         */

        const mediaResponse =
          await api.post<
            ApiResponse<ContentMedia>
          >(
            "/admin/media",
            {
              type: "image",
              title: file.name.replace(
                /\.[^/.]+$/,
                "",
              ),
              url: mediaUrl,
              alt_text:
                form.title.trim(),
            },
          );

        if (
          !mediaResponse.data.success
        ) {
          throw new Error(
            mediaResponse.data.message ||
              `Unable to create media record for ${file.name}.`,
          );
        }

        const contentMedia =
          mediaResponse.data.data;

        if (!contentMedia?.id) {
          throw new Error(
            `The server did not return a media ID for ${file.name}.`,
          );
        }

        /*
         * ---------------------------------------------------
         * STEP 3
         * Attach ContentMedia to Project.
         * ---------------------------------------------------
         */

        const attachResponse =
          await api.post<
            ApiResponse<ProjectMedia>
          >(
            `/admin/projects/${projectId}/media`,
            {
              media_id:
                contentMedia.id,
              alt_text:
                form.title.trim(),
            },
          );

        if (
          !attachResponse.data.success
        ) {
          throw new Error(
            attachResponse.data.message ||
              `Unable to attach ${file.name} to the project.`,
          );
        }

        const projectMedia =
          attachResponse.data.data;

        if (!projectMedia?.id) {
          throw new Error(
            `The server did not return a project media ID for ${file.name}.`,
          );
        }

        /*
         * ---------------------------------------------------
         * STEP 4
         * Automatically make the first available image
         * featured if the project doesn't already have one.
         *
         * IMPORTANT:
         * The featured endpoint expects ProjectMedia.id,
         * NOT ContentMedia.id.
         * ---------------------------------------------------
         */

        if (
          !hasFeaturedImage &&
          index === 0
        ) {
          await api.patch(
            `/admin/projects/${projectId}/media/${projectMedia.id}/featured`,
          );

          hasFeaturedImage = true;
        }
      }
    } catch (err) {
      console.error(
        "Failed to upload project images:",
        err,
      );

      throw new Error(
        getErrorMessage(
          err,
          "Unable to upload project images.",
        ),
        { cause: err },
      );
    } finally {
      setUploading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * Save project
   * ---------------------------------------------------------
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving || uploading) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const title =
        form.title.trim();

      const summary =
        form.summary.trim();

      const content =
        form.content.trim();

      if (!title) {
        throw new Error(
          "Project title is required.",
        );
      }

      if (!content) {
        throw new Error(
          "Project content is required.",
        );
      }

      /*
       * Existing featured image.
       *
       * For a newly created project this will be empty.
       * The first uploaded image will then be promoted
       * after attachment.
       */
      const featuredImage =
        existingMedia.find(
          (media) =>
            media.is_featured,
        )?.url ?? "";

      const payload = {
        title,
        summary,
        content,
        featured_image:
          featuredImage,
        status: form.status,
      };

      let projectId =
        editingId;

      /*
       * ---------------------------------------------------
       * CREATE
       * ---------------------------------------------------
       */

      if (!editingId) {
        const response =
          await api.post<
            ApiResponse<Project>
          >(
            "/admin/projects",
            payload,
          );

        if (
          !response.data.success
        ) {
          throw new Error(
            response.data.message ||
              "Unable to create project.",
          );
        }

        projectId =
          response.data.data?.id ??
          null;

        if (!projectId) {
          throw new Error(
            "The project was created but no project ID was returned.",
          );
        }
      }

      /*
       * ---------------------------------------------------
       * UPDATE
       * ---------------------------------------------------
       */

      if (editingId) {
        const response =
          await api.put<
            ApiResponse<Project>
          >(
            `/admin/projects/${editingId}`,
            payload,
          );

        if (
          !response.data.success
        ) {
          throw new Error(
            response.data.message ||
              "Unable to update project.",
          );
        }
      }

      /*
       * ---------------------------------------------------
       * UPLOAD NEW IMAGES
       * ---------------------------------------------------
       */

      if (projectId) {
        await uploadProjectImages(
          projectId,
        );
      }

      /*
       * Clean up previews.
       */
      resetImageSelection();

      /*
       * Close form.
       */
      setShowForm(false);
      setEditingId(null);
      setExistingMedia([]);
      setForm(emptyForm);

      /*
       * Reload projects so the featured image
       * and project data are immediately visible.
       */
      await loadProjects();
    } catch (err) {
      console.error(
        "Failed to save project:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to save project.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * Delete project
   * ---------------------------------------------------------
   */

  async function handleDelete(
    project: Project,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${project.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(project.id);
      setError("");

      const response =
        await api.delete<
          ApiResponse<null>
        >(
          `/admin/projects/${project.id}`,
        );

      if (
        !response.data.success
      ) {
        throw new Error(
          response.data.message ||
            "Unable to delete project.",
        );
      }

      await loadProjects();
    } catch (err) {
      console.error(
        "Failed to delete project:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete project.",
        ),
      );
    } finally {
      setDeleting(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * Delete project image
   * ---------------------------------------------------------
   */

  async function handleDeleteMedia(
    media: ProjectMedia,
  ) {
    if (!editingId) {
      return;
    }

    if (saving || uploading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove this image from the project?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/admin/projects/${editingId}/media/${media.id}`,
      );

      setExistingMedia(
        (current) =>
          current.filter(
            (item) =>
              item.id !== media.id,
          ),
      );
    } catch (err) {
      console.error(
        "Failed to remove project image:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to remove image.",
        ),
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Set featured image
   * ---------------------------------------------------------
   */

  async function handleSetFeatured(
    media: ProjectMedia,
  ) {
    if (!editingId) {
      return;
    }

    if (saving || uploading) {
      return;
    }

    try {
      setError("");

      await api.patch(
        `/admin/projects/${editingId}/media/${media.id}/featured`,
      );

      setExistingMedia(
        (current) =>
          current.map((item) => ({
            ...item,
            is_featured:
              item.id === media.id,
          })),
      );
    } catch (err) {
      console.error(
        "Failed to set featured image:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Unable to set featured image.",
        ),
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <section>
      {/* Page Header */}
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
          disabled={saving || uploading}
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Project
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Project Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Form Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId
                  ? "Edit Project"
                  : "Add Project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add the project information and images.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={
                saving || uploading
              }
              className="text-sm font-medium text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                disabled={
                  saving || uploading
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] disabled:bg-slate-50"
                placeholder="Enter project title"
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Summary
              </label>

              <textarea
                value={form.summary}
                onChange={(event) =>
                  updateField(
                    "summary",
                    event.target.value,
                  )
                }
                disabled={
                  saving || uploading
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] disabled:bg-slate-50"
                placeholder="Short project summary"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project Content
              </label>

              <textarea
                value={form.content}
                onChange={(event) =>
                  updateField(
                    "content",
                    event.target.value,
                  )
                }
                disabled={
                  saving || uploading
                }
                rows={10}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] disabled:bg-slate-50"
                placeholder="Full project description..."
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target
                      .value as
                      | "draft"
                      | "published",
                  )
                }
                disabled={
                  saving || uploading
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00843D] disabled:bg-slate-50"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>
              </select>
            </div>

            {/* =================================================
                IMAGE SELECTOR
               ================================================= */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Project Images
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Select one or more images directly from your device.
                    Maximum file size is 10MB per image.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    saving || uploading
                  }
                  className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : "Choose Images"}
                </button>
              </div>

              {/* Hidden native device picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageSelection
                }
                disabled={
                  saving || uploading
                }
                className="hidden"
              />

              {/* Empty selector */}
              {selectedPreviews.length ===
                0 &&
                existingMedia.length ===
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      saving ||
                      uploading
                    }
                    className="group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-[#00843D] hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                      +
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      Choose project images
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Click here to browse images on your device
                    </p>
                  </button>
                )}

              {/* Newly selected images */}
              {selectedPreviews.length >
                0 && (
                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      New Images
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={
                        saving ||
                        uploading
                      }
                      className="text-xs font-semibold text-[#00843D] hover:underline disabled:opacity-50"
                    >
                      + Add more images
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {selectedPreviews.map(
                      (
                        preview,
                        index,
                      ) => (
                        <div
                          key={preview}
                          className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="relative">
                            <img
                              src={
                                preview
                              }
                              alt={`Selected project image ${
                                index + 1
                              }`}
                              className="h-36 w-full object-cover"
                            />

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedImage(
                                  index,
                                )
                              }
                              disabled={
                                saving ||
                                uploading
                              }
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Remove selected image"
                            >
                              ×
                            </button>

                            {/* First image label */}
                            {index ===
                              0 && (
                              <span className="absolute bottom-2 left-2 rounded-md bg-[#00843D] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                First image
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="truncate text-xs font-medium text-slate-700">
                              {
                                selectedFiles[
                                  index
                                ]
                                  ?.name
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {Math.round(
                                (selectedFiles[
                                  index
                                ]
                                  ?.size ??
                                  0) /
                                  1024 /
                                  1024 *
                                  10,
                              ) /
                                10}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Existing images */}
              {editingId &&
                existingMedia.length >
                  0 && (
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Current Images
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          These images are already attached to this project.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        ...existingMedia,
                      ]
                        .sort(
                          (
                            a,
                            b,
                          ) =>
                            (a.sort_order ??
                              0) -
                            (b.sort_order ??
                              0),
                        )
                        .map(
                          (
                            media,
                          ) => (
                            <div
                              key={
                                media.id
                              }
                              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                            >
                              <div className="relative">
                                <img
                                  src={getMediaUrl(
                                    media.url,
                                  )}
                                  alt={
                                    media.alt_text ||
                                    form.title ||
                                    "Project image"
                                  }
                                  className="h-36 w-full object-cover"
                                />

                                {media.is_featured && (
                                  <span className="absolute left-2 top-2 rounded-md bg-[#00843D] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2 p-3">
                                {!media.is_featured && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleSetFeatured(
                                        media,
                                      )
                                    }
                                    disabled={
                                      saving ||
                                      uploading
                                    }
                                    className="block text-xs font-semibold text-[#00843D] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Set as featured
                                  </button>
                                )}

                                {media.is_featured && (
                                  <p className="text-xs font-semibold text-[#00843D]">
                                    Featured image
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteMedia(
                                      media,
                                    )
                                  }
                                  disabled={
                                    saving ||
                                    uploading
                                  }
                                  className="block text-xs font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Remove image
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                    </div>
                  </div>
                )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={
                  saving || uploading
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving || uploading
                }
                className="rounded-lg bg-[#00843D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006f34] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading images..."
                  : saving
                    ? "Saving..."
                    : editingId
                      ? "Update Project"
                      : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          PROJECT TABLE
         ===================================================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-6 text-sm text-slate-500">
            Loading projects...
          </div>
        )}

        {!loading &&
          items.length === 0 && (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No projects yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Projects created from the CMS will appear here.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006f34]"
              >
                Add First Project
              </button>
            </div>
          )}

        {!loading &&
          items.length > 0 && (
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
                  {items.map(
                    (project) => (
                      <tr
                        key={
                          project.id
                        }
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {project.featured_image ? (
                              <img
                                src={getMediaUrl(
                                  project.featured_image,
                                )}
                                alt={
                                  project.title
                                }
                                className="h-12 w-16 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                                No image
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-slate-900">
                                {
                                  project.title
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                {
                                  project.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <span
                            className={
                              project.status ===
                              "published"
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                                : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                            }
                          >
                            {
                              project.status
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                void openEditForm(
                                  project,
                                )
                              }
                              disabled={
                                deleting !==
                                  null ||
                                saving ||
                                uploading
                              }
                              className="text-sm font-medium text-[#00843D] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  project,
                                )
                              }
                              disabled={
                                deleting ===
                                  project.id ||
                                saving ||
                                uploading
                              }
                              className="text-sm font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting ===
                              project.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}