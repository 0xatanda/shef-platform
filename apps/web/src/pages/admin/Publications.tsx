import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import api from "../../api/client";

type ContentMedia = {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  youtube_video_id?: string;
  alt_text?: string;
};

type PublicationMedia = {
  id: string;
  media_id: string;
  sort_order: number;
  media?: ContentMedia | null;
};

type PublicationBlock = {
  id?: string;
  type: "text" | "image";
  content: string;
  media_id?: string | null;
  sort_order: number;
  media?: ContentMedia | null;
};

type Publication = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: string;
  status: string;
  featured_image: string;
  publication_source: string;
  publisher_name: string;
  external_url: string;
  external_link_text: string;
  author: string;
  media: PublicationMedia[];
  blocks: PublicationBlock[];
  published_at?: string | null;
};

type ListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Publication[];
  };
};

type MediaListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: ContentMedia[];
  };
};

type UploadResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    url?: string;
    path?: string;
    title?: string;
  };
};

type MediaResponse = {
  success: boolean;
  message?: string;
  data?: ContentMedia;
};

type FormBlock = {
  localId: string;
  type: "text" | "image";
  content: string;
  mediaId: string;
  media?: ContentMedia | null;
};

type FormState = {
  title: string;
  summary: string;
  content: string;
  type: string;
  status: string;
  featured_image: string;
  publication_source: string;
  publisher_name: string;
  external_url: string;
  external_link_text: string;
  author: string;
  media: ContentMedia[];
  blocks: FormBlock[];
};

function createLocalId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

const emptyForm: FormState = {
  title: "",
  summary: "",
  content: "",
  type: "article",
  status: "draft",
  featured_image: "",
  publication_source: "shef",
  publisher_name: "",
  external_url: "",
  external_link_text: "Read the original publication",
  author: "",
  media: [],
  blocks: [
    {
      localId: createLocalId(),
      type: "text",
      content: "",
      mediaId: "",
      media: null,
    },
  ],
};

const publicationTypes = [
  ["article", "Article"],
  ["report", "Report"],
  ["research", "Research"],
  ["policy_brief", "Policy Brief"],
  ["case_study", "Case Study"],
  ["other", "Other"],
] as const;

function getApiOrigin() {
  const baseURL = import.meta.env.VITE_API_URL || "";

  try {
    return new URL(baseURL).origin;
  } catch {
    return window.location.origin;
  }
}

function resolveMediaUrl(url?: string | null) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${getApiOrigin()}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
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

export default function Publications() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const featuredImageInputRef =
    useRef<HTMLInputElement | null>(null);

  const blockImageInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

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
          getErrorMessage(
            err,
            "Unable to load publications",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadMedia = useCallback(
    async () => {
      try {
        setLoadingMedia(true);

        const response =
          await api.get<MediaListResponse>(
            "/admin/media",
            {
              params: {
                page: 1,
                limit: 100,
                type: "image",
              },
            },
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load media",
          );
        }

        return response.data.data?.items ?? [];
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Unable to load media",
          ),
        );

        return [];
      } finally {
        setLoadingMedia(false);
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

    setForm({
      ...emptyForm,
      blocks: [
        {
          localId: createLocalId(),
          type: "text",
          content: "",
          mediaId: "",
          media: null,
        },
      ],
      media: [],
    });

    setError("");
    setFormOpen(true);
  }

  async function openEditForm(
    publication: Publication,
  ) {
    setEditingId(publication.id);
    setError("");

    const media =
      publication.media
        ?.map((item) => item.media)
        .filter(
          (item): item is ContentMedia =>
            Boolean(item),
        ) ?? [];

    const blocks =
      publication.blocks?.length > 0
        ? [...publication.blocks]
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order,
            )
            .map((block) => ({
              localId:
                block.id || createLocalId(),
              type: block.type,
              content: block.content || "",
              mediaId:
                block.media_id || "",
              media: block.media || null,
            }))
        : [
            {
              localId: createLocalId(),
              type: "text" as const,
              content: publication.content || "",
              mediaId: "",
              media: null,
            },
          ];

    setForm({
      title: publication.title,
      summary: publication.summary || "",
      content: publication.content || "",
      type: publication.type || "article",
      status: publication.status || "draft",
      featured_image:
        publication.featured_image || "",
      publication_source:
        publication.publication_source || "shef",
      publisher_name:
        publication.publisher_name || "",
      external_url:
        publication.external_url || "",
      external_link_text:
        publication.external_link_text ||
        "Read the original publication",
      author: publication.author || "",
      media,
      blocks,
    });

    setFormOpen(true);
  }

  function closeForm() {
    if (saving || uploading) return;

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(
    field: keyof Omit<
      FormState,
      "media" | "blocks"
    >,
    value: string,
  ) {
    setForm((current) => {
      if (field === "publication_source") {
        if (value === "external") {
          return {
            ...current,
            publication_source: value,
            summary: "",
            content: "",
            author: "",
            featured_image: "",
            publisher_name: "",
            external_link_text: "Read Publication",
            status: "published",
            media: [],
            blocks: [],
          };
        }

        return {
          ...current,
          publication_source: value,
          publisher_name: "",
          external_url: "",
          external_link_text: "",
          featured_image: "",
        };
      }

      if (
        field === "status" &&
        current.publication_source === "external"
      ) {
        return {
          ...current,
          status: "published",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function addTextBlock() {
    setForm((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          localId: createLocalId(),
          type: "text",
          content: "",
          mediaId: "",
          media: null,
        },
      ],
    }));
  }

  function addImageBlock() {
    setForm((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          localId: createLocalId(),
          type: "image",
          content: "",
          mediaId: "",
          media: null,
        },
      ],
    }));
  }

  function updateBlock(
    localId: string,
    field: "content",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.localId === localId
          ? {
              ...block,
              [field]: value,
            }
          : block,
      ),
    }));
  }

  function removeBlock(localId: string) {
    setForm((current) => {
      const blocks = current.blocks.filter(
        (block) => block.localId !== localId,
      );

      return {
        ...current,
        blocks:
          blocks.length > 0
            ? blocks
            : [
                {
                  localId: createLocalId(),
                  type: "text",
                  content: "",
                  mediaId: "",
                  media: null,
                },
              ],
      };
    });
  }

  function moveBlock(
    localId: string,
    direction: "up" | "down",
  ) {
    setForm((current) => {
      const index = current.blocks.findIndex(
        (block) => block.localId === localId,
      );

      if (index === -1) return current;

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= current.blocks.length
      ) {
        return current;
      }

      const blocks = [...current.blocks];
      const [moved] = blocks.splice(index, 1);

      blocks.splice(targetIndex, 0, moved);

      return {
        ...current,
        blocks,
      };
    });
  }

  function addMedia(media: ContentMedia) {
    setForm((current) => {
      const exists = current.media.some(
        (item) => item.id === media.id,
      );

      if (exists) return current;

      return {
        ...current,
        media: [...current.media, media],
      };
    });
  }

  function removeMedia(mediaId: string) {
    setForm((current) => ({
      ...current,
      media: current.media.filter(
        (item) => item.id !== mediaId,
      ),
      blocks: current.blocks.map((block) =>
        block.mediaId === mediaId
          ? {
              ...block,
              mediaId: "",
              media: null,
            }
          : block,
      ),
    }));
  }

  function selectBlockMedia(
    blockId: string,
    mediaId: string,
  ) {
    const selectedMedia =
      form.media.find(
        (media) => media.id === mediaId,
      ) || null;

    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.localId === blockId
          ? {
              ...block,
              mediaId,
              media: selectedMedia,
            }
          : block,
      ),
    }));
  }

  async function uploadImage(
    file: File,
  ): Promise<ContentMedia | null> {
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file.",
      );
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image must be 10MB or smaller.",
      );
      return null;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse =
        await api.post<UploadResponse>(
          "/admin/uploads",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );

      const uploadData =
        uploadResponse.data.data;

      if (
        !uploadResponse.data.success ||
        !uploadData?.url
      ) {
        throw new Error(
          uploadResponse.data.message ||
            "Image upload failed",
        );
      }

      const title =
        file.name.replace(
          /\.[^/.]+$/,
          "",
        );

      const mediaResponse =
        await api.post<MediaResponse>(
          "/admin/media",
          {
            type: "image",
            title,
            url: uploadData.url,
            alt_text: title,
          },
        );

      if (
        !mediaResponse.data.success ||
        !mediaResponse.data.data
      ) {
        throw new Error(
          mediaResponse.data.message ||
            "Unable to save image to media library",
        );
      }

      const media =
        mediaResponse.data.data;

      addMedia(media);

      return media;
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to upload image",
        ),
      );

      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleFeaturedImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const media = await uploadImage(file);

    if (media) {
      updateField(
        "featured_image",
        media.url,
      );
    }

    event.target.value = "";
  }

  async function handleBlockImageChange(
    event: ChangeEvent<HTMLInputElement>,
    blockId: string,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const media = await uploadImage(file);

    if (media) {
      setForm((current) => ({
        ...current,
        blocks: current.blocks.map(
          (block) =>
            block.localId === blockId
              ? {
                  ...block,
                  mediaId: media.id,
                  media,
                }
              : block,
        ),
      }));
    }

    event.target.value = "";
  }

  async function addExistingMedia() {
    const media = await loadMedia();

    if (media.length === 0) {
      setError(
        "No images are available in the media library.",
      );
      return;
    }

    const available = media.filter(
      (item) =>
        !form.media.some(
          (selected) =>
            selected.id === item.id,
        ),
    );

    if (available.length === 0) {
      setError(
        "All available images are already attached.",
      );
      return;
    }

    const selectedId =
      window.prompt(
        `Enter the number of the image to attach:\n\n${available
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}`,
          )
          .join("\n")}`,
      );

    if (!selectedId) return;

    const index =
      Number.parseInt(
        selectedId,
        10,
      ) - 1;

    if (
      Number.isNaN(index) ||
      !available[index]
    ) {
      setError("Invalid image selection.");
      return;
    }

    addMedia(available[index]);
    setError("");
  }

  function buildPayload() {
    const blocks = form.blocks
      .map((block, index) => ({
        type: block.type,
        content:
          block.type === "text"
            ? block.content
            : "",
        ...(block.type === "image" &&
        block.mediaId
          ? {
              media_id: block.mediaId,
            }
          : {}),
        sort_order: index,
      }))
      .filter((block) =>
        block.type === "image"
          ? Boolean(block.media_id)
          : Boolean(
              block.content.trim(),
            ),
      );

    const media = form.media.map(
      (mediaItem, index) => ({
        media_id: mediaItem.id,
        sort_order: index,
      }),
    );

    const isExternal =
      form.publication_source === "external";

    return {
      title: form.title.trim(),
      summary: isExternal ? "" : form.summary.trim(),
      content: isExternal ? "" : form.content.trim(),
      type: form.type,
      status: form.status,
      featured_image: isExternal
        ? ""
        : form.featured_image.trim(),

      publication_source:
        form.publication_source,

      publisher_name: "",

      external_url: isExternal
        ? form.external_url.trim()
        : "",

      external_link_text: isExternal
        ? "Read Publication"
        : "",

      author: isExternal
        ? ""
        : form.author.trim(),

      media: isExternal ? [] : media,
      blocks: isExternal ? [] : blocks,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (
      form.publication_source !==
        "external" &&
      !form.content.trim()
    ) {
      setError(
        "Content is required. Add the main publication content.",
      );
      return;
    }

    if (
      form.publication_source ===
      "external"
    ) {
      if (!form.external_url.trim()) {
        setError(
          "Publication URL is required for an external publication.",
        );
        return;
      }
    }

    const invalidImageBlock =
      form.blocks.some(
        (block) =>
          block.type === "image" &&
          !block.mediaId,
      );

    if (invalidImageBlock) {
      setError(
        "Every image block must have an image selected.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = buildPayload();

      if (editingId) {
        await api.put(
          `/admin/publications/${editingId}`,
          payload,
        );
      } else {
        await api.post(
          "/admin/publications",
          payload,
        );
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPublications();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save publication",
        ),
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
        getErrorMessage(
          err,
          "Unable to delete publication",
        ),
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
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId
                  ? "Edit Publication"
                  : "Add Publication"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a SHEF publication or reference
                work published by another organisation.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={
                saving || uploading
              }
              className="text-2xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
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

            <div className="grid gap-5 md:grid-cols-4">
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

                {form.publication_source === "external" ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                    Published automatically
                  </div>
                ) : (
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
                )}
              </div>

              {form.publication_source ===
                "shef" && (
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
              )}

              <div>
                <label
                  htmlFor="publication-source"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Publication Source
                </label>

                <select
                  id="publication-source"
                  value={
                    form.publication_source
                  }
                  onChange={(event) =>
                    updateField(
                      "publication_source",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                >
                  <option value="shef">
                    SHEF Website
                  </option>

                  <option value="external">
                    External Organisation
                  </option>
                </select>
              </div>
            </div>

            {form.publication_source ===
              "external" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900">
                    External Publication
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Use this when another organisation has
                    published the work on its own website. SHEF
                    will show the publication and send readers to
                    the original page.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="external-url"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Original Publication Link
                  </label>

                  <input
                    id="external-url"
                    type="url"
                    value={form.external_url}
                    onChange={(event) =>
                      updateField(
                        "external_url",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600"
                    placeholder="https://organisation.org/publication"
                    required
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    The publication will be published on SHEF and readers will be taken to the original page.
                  </p>
                </div>
              </div>
            )}

            {form.publication_source ===
              "shef" && (
              <>
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
                    Main Content
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
                    rows={8}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 leading-6 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="Main publication content..."
                    required
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Required base content. Use the blocks below
                    when you need images positioned between sections
                    of the publication.
                  </p>
                </div>
              </>
            )}

            {form.publication_source === "shef" && (
              <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Featured Image
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Upload the main image for this publication.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    featuredImageInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : "Choose Image"}
                </button>

                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFeaturedImageChange
                  }
                  className="hidden"
                />
              </div>

              {form.featured_image && (
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={resolveMediaUrl(
                      form.featured_image,
                    )}
                    alt="Featured publication"
                    className="max-h-72 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "featured_image",
                        "",
                      )
                    }
                    className="absolute right-3 top-3 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

              </>
            )}

            {form.publication_source === "shef" && (
            <>
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Publication Media
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Attach additional images to this
                      publication.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void addExistingMedia()
                    }
                    disabled={
                      loadingMedia ||
                      saving ||
                      uploading
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMedia
                      ? "Loading..."
                      : "Add From Library"}
                  </button>
                </div>
              </div>

              {form.media.length > 0 ? (
                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {form.media.map((media) => (
                    <div
                      key={media.id}
                      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={resolveMediaUrl(
                          media.url,
                        )}
                        alt={
                          media.alt_text ||
                          media.title
                        }
                        className="h-36 w-full object-cover"
                      />

                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {media.title}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              media.id,
                            )
                          }
                          className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm text-slate-500">
                  No additional media attached.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Content Blocks
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Arrange text and images in the exact order
                      they should appear on the public page.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      + Text
                    </button>

                    <button
                      type="button"
                      onClick={addImageBlock}
                      className="rounded-lg bg-[#00843D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#006f34]"
                    >
                      + Image
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {form.blocks.map(
                  (block, index) => (
                    <div
                      key={block.localId}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                            {index + 1}
                          </span>

                          <span className="text-sm font-semibold capitalize text-slate-800">
                            {block.type} block
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              moveBlock(
                                block.localId,
                                "up",
                              )
                            }
                            disabled={index === 0}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:opacity-30"
                            title="Move up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveBlock(
                                block.localId,
                                "down",
                              )
                            }
                            disabled={
                              index ===
                              form.blocks
                                .length -
                                1
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:opacity-30"
                            title="Move down"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeBlock(
                                block.localId,
                              )
                            }
                            className="ml-2 rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {block.type ===
                        "text" && (
                        <textarea
                          value={block.content}
                          onChange={(event) =>
                            updateBlock(
                              block.localId,
                              "content",
                              event.target.value,
                            )
                          }
                          rows={7}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 leading-6 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                          placeholder="Write this section of the publication..."
                        />
                      )}

                      {block.type ===
                        "image" && (
                        <div>
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                            <select
                              value={
                                block.mediaId
                              }
                              onChange={(event) =>
                                selectBlockMedia(
                                  block.localId,
                                  event.target
                                    .value,
                                )
                              }
                              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                            >
                              <option value="">
                                Select an attached image
                              </option>

                              {form.media.map(
                                (media) => (
                                  <option
                                    key={
                                      media.id
                                    }
                                    value={
                                      media.id
                                    }
                                  >
                                    {media.title}
                                  </option>
                                ),
                              )}
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                blockImageInputRefs.current[
                                  block.localId
                                ]?.click()
                              }
                              disabled={
                                uploading
                              }
                              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Upload Image
                            </button>

                            <input
                              ref={(element) => {
                                blockImageInputRefs.current[
                                  block.localId
                                ] = element;
                              }}
                              type="file"
                              accept="image/*"
                              onChange={(
                                event,
                              ) =>
                                void handleBlockImageChange(
                                  event,
                                  block.localId,
                                )
                              }
                              className="hidden"
                            />
                          </div>

                          {block.media && (
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <img
                                src={resolveMediaUrl(
                                  block.media
                                    .url,
                                )}
                                alt={
                                  block.media
                                    .alt_text ||
                                  block.media
                                    .title
                                }
                                className="max-h-80 w-full object-contain"
                              />
                            </div>
                          )}

                          {!block.mediaId && (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                              Select or upload an image
                              for this block.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
            </>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={
                  saving || uploading
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving || uploading
                }
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

        {!loading &&
          items.length > 0 && (
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

                      {publication.publication_source ===
                        "external" && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                          External publication
                        </span>
                      )}

                      {publication.media?.length >
                        0 && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                          {
                            publication.media
                              .length
                          }{" "}
                          media
                        </span>
                      )}

                      {publication.blocks?.length >
                        0 && (
                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-purple-700">
                          {
                            publication.blocks
                              .length
                          }{" "}
                          blocks
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        void openEditForm(
                          publication,
                        )
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