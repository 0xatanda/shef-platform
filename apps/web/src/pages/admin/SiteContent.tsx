import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import api from "../../api/client";

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
      "Manage all text displayed on the public About page.",
    keys: [
      "about.hero.title",
      "about.hero.description",
      "about.intro.title",
      "about.intro.description",
      "about.intro.description_2",
      "about.focal_areas.title",
      "about.focal_areas.items",
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
    title: "Homepage Hero Secondary Description",
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
    content: "Years of Community Organizing",
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
    title: "About Introduction Secondary Text",
    content:
      "Through our focal areas, SHEF seeks to build awareness around social and economic rights and explore practical strategies for securing their realization. We aim to broaden individual and community access to decision-making processes, while strengthening meaningful participation in the design and implementation of social and economic policies and programs that directly affect urban poor communities.",
  },

  "about.focal_areas.title": {
    title: "Focal Areas Title",
    content: "Our Focal Areas",
  },

  "about.focal_areas.items": {
    title: "Focal Areas",
    content:
      "Economic and Capacity Building Program\nPolicy and Advocacy Program\nCommunity Health and Environment Program\nHousing and Community Upgrade Program\nStorytelling for Impact (Know-Your-City TV)\nProfiling and Data Collection Program",
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
    key.includes("content") ||
    key.endsWith(".items")
  );
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

export default function SiteContent() {
  const [content, setContent] = useState<
    Record<string, SiteContent>
  >({});

  const [forms, setForms] = useState<
    Record<string, ContentFormValue>
  >({});

  const [loading, setLoading] =
    useState(true);

  const [savingKey, setSavingKey] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadContent]);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Site Content
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage editable text and content
          displayed across the public SHEF website.
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
              {/* Group Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {group.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {group.description}
                </p>
              </div>

              {/* Fields */}
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
                          value={value.title}
                          onChange={(event) =>
                            updateForm(
                              key,
                              "title",
                              event.target.value,
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

                        {isLongContent(key) ? (
                          <textarea
                            id={`${key}-content`}
                            rows={
                              key.endsWith(
                                ".items",
                              )
                                ? 8
                                : 5
                            }
                            value={value.content}
                            onChange={(event) =>
                              updateForm(
                                key,
                                "content",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                            placeholder={
                              key.endsWith(
                                ".items",
                              )
                                ? "Enter one item per line"
                                : `Enter ${formatKey(
                                    key,
                                  ).toLowerCase()}`
                            }
                          />
                        ) : (
                          <input
                            id={`${key}-content`}
                            type="text"
                            value={value.content}
                            onChange={(event) =>
                              updateForm(
                                key,
                                "content",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#00843D] focus:ring-2 focus:ring-green-100"
                            placeholder={`Enter ${formatKey(
                              key,
                            ).toLowerCase()}`}
                          />
                        )}

                        {key ===
                          "about.focal_areas.items" && (
                          <p className="mt-2 text-xs text-slate-500">
                            Enter each focal area on
                            a separate line. The order
                            here is the order displayed
                            on the About page.
                          </p>
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
