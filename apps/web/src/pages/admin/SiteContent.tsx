import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import api, { API_ORIGIN } from "../../api/client";

interface SiteContent {
  id: string;
  key: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ContentListResponse {
  success: boolean;
  data: {
    items: SiteContent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

interface ApiErrorResponse {
  message?: string;
}

interface ContentFormValue {
  title: string;
  content: string;
}

interface ContentGroup {
  name: string;
  description: string;
  keys: string[];
}

interface FocusArea {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FocusAreaListResponse {
  success: boolean;
  data: FocusArea[];
}

interface FocusAreaForm {
  title: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const contentGroups: ContentGroup[] = [
  {
    name: "Hero Section",
    description:
      "Manage the main homepage heading, description and call-to-action buttons.",
    keys: [
      "home.hero.title",
      "home.hero.description",
      "home.hero.description_2",
      "home.hero.projects_button",
      "home.hero.about_button",
    ],
  },

  {
    name: "Impact Section",
    description:
      "Manage the statistics and supporting text displayed on the homepage.",
    keys: [
      "home.impact.title",
      "home.impact.description",
      "home.impact.savings_groups",
      "home.impact.savings_groups_label",
      "home.impact.communities",
      "home.impact.communities_label",
      "home.impact.households",
      "home.impact.households_label",
      "home.impact.years",
      "home.impact.years_label",
    ],
  },

  {
    name: "Projects Section",
    description:
      "Manage the homepage projects section heading and button.",
    keys: [
      "home.projects.title",
      "home.projects.description",
      "home.projects.view_all",
    ],
  },

  {
    name: "Featured Videos",
    description:
      "Manage the heading and description for the homepage featured videos section.",
    keys: [
      "home.media.title",
      "home.media.description",
      "home.media.view_all",
    ],
  },

  {
    name: "Partners Section",
    description:
      "Manage the homepage partners section heading and description.",
    keys: [
      "home.partners.title",
      "home.partners.description",
    ],
  },

  {
    name: "About Page",
    description:
      "Manage the general text displayed on the public About page.",
    keys: [
      "about.hero.title",
      "about.hero.description",
      "about.intro.title",
      "about.intro.description",
      "about.intro.description_2",
      "about.focal_areas.title",
      "about.mission.title",
      "about.mission.description",
    ],
  },
];

const defaultValues: Record<
  string,
  ContentFormValue
> = {
  "home.hero.title": {
    title: "Homepage Hero Title",
    content:
      "Shantytown Empowerment Foundation",
  },

  "home.hero.description": {
    title: "Homepage Hero Description",
    content:
      "Shantytown Empowerment Foundation (SHEF) supports the Nigeria Slum/Informal Settlement Federation and works with marginalized urban communities to advance inclusive development.",
  },

  "home.hero.description_2": {
    title:
      "Homepage Hero Secondary Description",
    content:
      "We support community-led initiatives, advocacy, data collection and inclusive urban development.",
  },

  "home.hero.projects_button": {
    title: "Projects Button",
    content: "Our Projects",
  },

  "home.hero.about_button": {
    title: "About Button",
    content: "Learn More",
  },

  "home.impact.title": {
    title: "Impact Section Title",
    content: "Our Impact",
  },

  "home.impact.description": {
    title: "Impact Section Description",
    content:
      "Working with communities to strengthen local leadership, organizing and inclusive development.",
  },

  "home.impact.savings_groups": {
    title: "Savings Groups Number",
    content: "25+",
  },

  "home.impact.savings_groups_label": {
    title: "Savings Groups Label",
    content: "Savings Groups Supported",
  },

  "home.impact.communities": {
    title: "Communities Number",
    content: "10+",
  },

  "home.impact.communities_label": {
    title: "Communities Label",
    content: "Communities Reached",
  },

  "home.impact.households": {
    title: "Households Number",
    content: "5,000+",
  },

  "home.impact.households_label": {
    title: "Households Label",
    content: "Households Impacted",
  },

  "home.impact.years": {
    title: "Years Number",
    content: "3+",
  },

  "home.impact.years_label": {
    title: "Years Label",
    content:
      "Years of Community Organizing",
  },

  "home.projects.title": {
    title: "Projects Section Title",
    content: "Our Projects",
  },

  "home.projects.description": {
    title: "Projects Section Description",
    content:
      "Explore some of the community-led projects and initiatives supported by SHEF.",
  },

  "home.projects.view_all": {
    title: "Projects View All Button",
    content: "View All Projects",
  },

  "home.media.title": {
    title: "Featured Videos Title",
    content: "Featured Videos",
  },

  "home.media.description": {
    title: "Featured Videos Description",
    content:
      "Watch stories, documentaries and community experiences from SHEF and the Federation.",
  },

  "home.media.view_all": {
    title: "Featured Videos View All Button",
    content: "View All Media",
  },

  "home.partners.title": {
    title: "Partners Section Title",
    content: "Our Partners",
  },

  "home.partners.description": {
    title: "Partners Section Description",
    content:
      "We work with organizations and institutions committed to inclusive and community-led development.",
  },

  "about.hero.title": {
    title: "About Hero Title",
    content: "About Us",
  },

  "about.hero.description": {
    title: "About Hero Description",
    content:
      "Shantytown Empowerment Foundation",
  },

  "about.intro.title": {
    title: "About Introduction Title",
    content: "About Us",
  },

  "about.intro.description": {
    title: "About Introduction",
    content:
      "Shantytown Empowerment Foundation (SHEF) is a non-governmental organization that supports the Nigeria Slum/Informal Settlement Federation (NSISF). We work with marginalized and deprived urban communities to advance social and economic transformation through community-led initiatives, advocacy, and inclusive development practices.",
  },

  "about.intro.description_2": {
    title:
      "About Introduction Secondary Text",
    content:
      "Through our focal areas, SHEF seeks to build awareness around social and economic rights and explore practical strategies for securing their realization. We aim to broaden individual and community access to decision-making processes, while strengthening meaningful participation in the design and implementation of social and economic policies and programs that directly affect urban poor communities.",
  },

  "about.focal_areas.title": {
    title: "Focal Areas Title",
    content: "Our Focal Areas",
  },

  "about.mission.title": {
    title: "Mission Title",
    content: "Our Mission",
  },

  "about.mission.description": {
    title: "Mission Description",
    content:
      "Our mission is to empower informal settlement communities by strengthening their capacity to organize, generate data, influence policy, and drive inclusive urban development. We are committed to supporting community leadership, promoting equity, and enabling sustainable improvements in quality of life.",
  },
};

function formatKey(key: string): string {
  return key
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function isLongContent(key: string): boolean {
  return (
    key.includes("description") ||
    key.includes("content")
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const response = (
    error as {
      response?: {
        data?: ApiErrorResponse;
      };
    }
  ).response;

  return (
    response?.data?.message ||
    fallback
  );
}

function resolveImageUrl(url?: string | null): string {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }

  if (url.startsWith("uploads/")) {
    return `${API_ORIGIN}/${url}`;
  }

  return url;
}

const emptyFocusArea: FocusAreaForm = {
  title: "",
  slug: "",
  description: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

export default function SiteContent() {
  const [content, setContent] = useState<
    Record<string, SiteContent>
  >({});

  const [forms, setForms] = useState<
    Record<string, ContentFormValue>
  >({});

  const [focusAreas, setFocusAreas] =
    useState<FocusArea[]>([]);

  const [focusAreaForm, setFocusAreaForm] =
    useState<FocusAreaForm>(
      emptyFocusArea,
    );

  const [editingFocusAreaId, setEditingFocusAreaId] =
    useState<string | null>(null);

  const [showFocusAreaForm, setShowFocusAreaForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [loadingFocusAreas, setLoadingFocusAreas] =
    useState(false);

  const [savingKey, setSavingKey] =
    useState<string | null>(null);

  const [savingFocusArea, setSavingFocusArea] =
    useState(false);

  const [uploadingFocusAreaImage, setUploadingFocusAreaImage] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const loadContent = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<ContentListResponse>(
            "/admin/content",
            {
              params: {
                page: 1,
                limit: 100,
              },
            },
          );

        const items =
          response.data.data.items;

        const contentMap: Record<
          string,
          SiteContent
        > = {};

        const formMap: Record<
          string,
          ContentFormValue
        > = {};

        for (const item of items) {
          contentMap[item.key] = item;

          formMap[item.key] = {
            title: item.title,
            content: item.content,
          };
        }

        setContent(contentMap);
        setForms(formMap);
      } catch (error: unknown) {
        setError(
          getErrorMessage(
            error,
            "Unable to load site content. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadFocusAreas = useCallback(
    async () => {
      try {
        setLoadingFocusAreas(true);

        const response =
          await api.get<FocusAreaListResponse>(
            "/admin/focus-areas",
          );

        const items =
          response.data.data || [];

        setFocusAreas(
          [...items].sort(
            (a, b) =>
              a.sort_order -
              b.sort_order,
          ),
        );
      } catch (error: unknown) {
        setError(
          getErrorMessage(
            error,
            "Unable to load focus areas. Please try again.",
          ),
        );
      } finally {
        setLoadingFocusAreas(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
      void loadFocusAreas();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadContent, loadFocusAreas]);

  function getValue(
    key: string,
  ): ContentFormValue {
    return (
      forms[key] ||
      defaultValues[key] || {
        title: formatKey(key),
        content: "",
      }
    );
  }

  function updateForm(
    key: string,
    field: keyof ContentFormValue,
    value: string,
  ) {
    setForms((current) => ({
      ...current,
      [key]: {
        ...getValue(key),
        [field]: value,
      },
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    key: string,
  ) {
    event.preventDefault();

    try {
      setSavingKey(key);
      setError("");
      setSuccess("");

      const value = getValue(key);
      const existing = content[key];

      if (existing) {
        await api.put(
          `/admin/content/${existing.id}`,
          {
            title: value.title.trim(),
            content: value.content,
          },
        );
      } else {
        await api.post(
          "/admin/content",
          {
            key,
            title: value.title.trim(),
            content: value.content,
          },
        );
      }

      setSuccess(
        `"${formatKey(
          key,
        )}" saved successfully.`,
      );

      await loadContent();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          `Unable to save "${formatKey(
            key,
          )}". Please try again.`,
        ),
      );
    } finally {
      setSavingKey(null);
    }
  }

  function openCreateFocusArea() {
    setEditingFocusAreaId(null);

    setFocusAreaForm({
      ...emptyFocusArea,
      sort_order:
        focusAreas.length,
    });

    setShowFocusAreaForm(true);
    setError("");
    setSuccess("");
  }

  function openEditFocusArea(
    area: FocusArea,
  ) {
    setEditingFocusAreaId(area.id);

    setFocusAreaForm({
      title: area.title,
      slug: area.slug,
      description: area.description,
      image_url: area.image_url,
      sort_order: area.sort_order,
      is_active: area.is_active,
    });

    setShowFocusAreaForm(true);
    setError("");
    setSuccess("");
  }

  function resetFocusAreaForm() {
    setEditingFocusAreaId(null);
    setFocusAreaForm({
      ...emptyFocusArea,
      sort_order:
        focusAreas.length,
    });
    setShowFocusAreaForm(false);
  }

  async function handleFocusAreaImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image must be smaller than 10MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingFocusAreaImage(true);
      setError("");
      setSuccess("");

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await api.post<{
        success: boolean;
        message: string;
        data: {
          id: string;
          original_name: string;
          filename: string;
          mime_type: string;
          size: number;
          path: string;
          url: string;
          created_at: string;
        };
      }>("/admin/uploads", uploadData);

      const uploaded = response.data.data;

      if (!response.data.success || !uploaded?.url) {
        throw new Error(
          response.data.message ||
            "Image upload did not return a public URL.",
        );
      }

      setFocusAreaForm((current) => ({
        ...current,
        image_url: uploaded.url,
      }));

      setSuccess(
        "Image uploaded successfully. Save the focus area to keep it.",
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to upload image. Please try again.",
        ),
      );
      event.target.value = "";
    } finally {
      setUploadingFocusAreaImage(false);
    }
  }

  async function handleFocusAreaSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSavingFocusArea(true);
      setError("");
      setSuccess("");

      const payload = {
        title:
          focusAreaForm.title.trim(),
        slug:
          focusAreaForm.slug.trim() ||
          slugify(
            focusAreaForm.title,
          ),
        description:
          focusAreaForm.description.trim(),
        image_url:
          focusAreaForm.image_url.trim(),
        sort_order:
          Number(
            focusAreaForm.sort_order,
          ),
        is_active:
          focusAreaForm.is_active,
      };

      if (editingFocusAreaId) {
        await api.put(
          `/admin/focus-areas/${editingFocusAreaId}`,
          payload,
        );

        setSuccess(
          "Focus area updated successfully.",
        );
      } else {
        await api.post(
          "/admin/focus-areas",
          payload,
        );

        setSuccess(
          "Focus area created successfully.",
        );
      }

      resetFocusAreaForm();

      await loadFocusAreas();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to save focus area. Please try again.",
        ),
      );
    } finally {
      setSavingFocusArea(false);
    }
  }

  async function handleDeleteFocusArea(
    area: FocusArea,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${area.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/focus-areas/${area.id}`,
      );

      setSuccess(
        "Focus area deleted successfully.",
      );

      await loadFocusAreas();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to delete focus area. Please try again.",
        ),
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Site Content
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage editable text and content
          displayed across the public SHEF
          website.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Focus Areas */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Focus Areas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the six focus areas displayed
              on the public About page.
            </p>
          </div>

          <button
            type="button"
            onClick={
              showFocusAreaForm
                ? resetFocusAreaForm
                : openCreateFocusArea
            }
            className="rounded-lg bg-[#00843D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            {showFocusAreaForm
              ? "Cancel"
              : "Add Focus Area"}
          </button>
        </div>

        {/* Focus Area Form */}
        {showFocusAreaForm && (
          <div className="border-b border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-slate-900">
              {editingFocusAreaId
                ? "Edit Focus Area"
                : "Add Focus Area"}
            </h3>

            <form
              onSubmit={
                handleFocusAreaSubmit
              }
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Title */}
                <div>
                  <label
                    htmlFor="focus-area-title"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Title
                  </label>

                  <input
                    id="focus-area-title"
                    type="text"
                    required
                    value={
                      focusAreaForm.title
                    }
                    onChange={(event) =>
                      setFocusAreaForm(
                        (current) => ({
                          ...current,
                          title:
                            event.target
                              .value,
                          slug:
                            current.slug ||
                            slugify(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                    placeholder="Economic and Capacity Building Program"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="focus-area-slug"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Slug
                  </label>

                  <input
                    id="focus-area-slug"
                    type="text"
                    required
                    value={
                      focusAreaForm.slug
                    }
                    onChange={(event) =>
                      setFocusAreaForm(
                        (current) => ({
                          ...current,
                          slug: event.target
                            .value
                            .toLowerCase()
                            .trim()
                            .replace(
                              /\s+/g,
                              "-",
                            ),
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                    placeholder="economic-capacity-building"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    This slug is used in the
                    public URL.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="focus-area-description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="focus-area-description"
                  rows={5}
                  value={
                    focusAreaForm.description
                  }
                  onChange={(event) =>
                    setFocusAreaForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                  placeholder="Describe this focus area..."
                />
              </div>

              {/* Image Picker */}
              <div>
                <label
                  htmlFor="focus-area-image"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Focus Area Image
                </label>

                <input
                  id="focus-area-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFocusAreaImageUpload}
                  disabled={
                    uploadingFocusAreaImage ||
                    savingFocusArea
                  }
                  className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG, WEBP or GIF. Maximum file size: 10MB.
                </p>

                {uploadingFocusAreaImage && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Uploading image...
                  </div>
                )}

                {focusAreaForm.image_url && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div className="aspect-video w-full bg-slate-100">
                      <img
                        src={resolveImageUrl(
                          focusAreaForm.image_url,
                        )}
                        alt={
                          focusAreaForm.title ||
                          "Focus area image"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Selected Image
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-700">
                          {focusAreaForm.image_url}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFocusAreaForm((current) => ({
                            ...current,
                            image_url: "",
                          }));
                        }}
                        disabled={
                          uploadingFocusAreaImage ||
                          savingFocusArea
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort / Active */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="focus-area-sort"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Sort Order
                  </label>

                  <input
                    id="focus-area-sort"
                    type="number"
                    min="0"
                    value={
                      focusAreaForm.sort_order
                    }
                    onChange={(event) =>
                      setFocusAreaForm(
                        (current) => ({
                          ...current,
                          sort_order:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        focusAreaForm.is_active
                      }
                      onChange={(event) =>
                        setFocusAreaForm(
                          (current) => ({
                            ...current,
                            is_active:
                              event.target
                                .checked,
                          }),
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={
                    resetFocusAreaForm
                  }
                  disabled={
                    savingFocusArea ||
                    uploadingFocusAreaImage
                  }
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingFocusArea ||
                    uploadingFocusAreaImage
                  }
                  className="rounded-lg bg-[#00843D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingFocusArea
                    ? "Saving..."
                    : editingFocusAreaId
                      ? "Update Focus Area"
                      : "Create Focus Area"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Focus Area List */}
        {loadingFocusAreas ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading focus areas...
          </div>
        ) : focusAreas.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              No focus areas found.
            </p>

            <button
              type="button"
              onClick={
                openCreateFocusArea
              }
              className="mt-4 rounded-lg bg-[#00843D] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Add First Focus Area
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {focusAreas.map((area) => (
              <div
                key={area.id}
                className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 gap-4">
                  {area.image_url ? (
                    <img
                      src={resolveImageUrl(area.image_url)}
                      alt={area.title}
                      className="h-20 w-28 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                      No image
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {area.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          area.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {area.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      /about/focal-areas/
                      {area.slug}
                    </p>

                    {area.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {area.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      Sort order:{" "}
                      {area.sort_order}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openEditFocusArea(
                        area,
                      )
                    }
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDeleteFocusArea(
                        area,
                      )
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* General Site Content */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading site content...
        </div>
      ) : (
        <div className="space-y-8">
          {contentGroups.map((group) => (
            <section
              key={group.name}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {group.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {group.description}
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {group.keys.map((key) => {
                  const value = getValue(key);
                  const saving =
                    savingKey === key;

                  return (
                    <form
                      key={key}
                      onSubmit={(event) =>
                        void handleSubmit(
                          event,
                          key,
                        )
                      }
                      className="space-y-4 p-6"
                    >
                      <div>
                        <label
                          htmlFor={`${key}-title`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          {formatKey(key)}
                        </label>

                        <input
                          id={`${key}-title`}
                          type="text"
                          value={
                            value.title
                          }
                          onChange={(event) =>
                            updateForm(
                              key,
                              "title",
                              event.target
                                .value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                          placeholder="Content title"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${key}-content`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Content
                        </label>

                        {isLongContent(
                          key,
                        ) ? (
                          <textarea
                            id={`${key}-content`}
                            rows={5}
                            value={
                              value.content
                            }
                            onChange={(event) =>
                              updateForm(
                                key,
                                "content",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                            placeholder={`Enter ${formatKey(
                              key,
                            ).toLowerCase()}`}
                          />
                        ) : (
                          <input
                            id={`${key}-content`}
                            type="text"
                            value={
                              value.content
                            }
                            onChange={(event) =>
                              updateForm(
                                key,
                                "content",
                                event.target
                                  .value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                            placeholder={`Enter ${formatKey(
                              key,
                            ).toLowerCase()}`}
                          />
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-lg bg-[#00843D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
