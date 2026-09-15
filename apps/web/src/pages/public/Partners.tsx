import { useEffect, useState } from "react";
import api, { API_ORIGIN } from "../../api/client";

type Partner = {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  display_order: number;
  is_active: boolean;
};

type PartnersResponse = {
  success: boolean;
  message?: string;
  data?: Partner[];
};

function resolveImageUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const origin = API_ORIGIN.replace(/\/$/, "");

  return url.startsWith("/")
    ? `${origin}${url}`
    : `${origin}/${url}`;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPartners() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<PartnersResponse>("/partners");

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load partners.",
          );
        }

        if (mounted) {
          const items = response.data.data ?? [];

          const activePartners = items
            .filter(
              (partner) =>
                partner.is_active !== false,
            )
            .sort(
              (a, b) =>
                a.display_order -
                  b.display_order ||
                a.name.localeCompare(b.name),
            );

          setPartners(activePartners);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load partners.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadPartners();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
            Our Partners
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Working Together for Inclusive Communities
          </h1>

          <p className="mt-4 text-gray-600">
            We work with organisations and institutions
            committed to strengthening communities and
            advancing inclusive urban development.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading partners...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          partners.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              Our partners will appear here.
            </div>
          )}

        {/* Partners */}
        {!loading &&
          !error &&
          partners.length > 0 && (
            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {partners.map((partner) => {
                const logoUrl =
                  resolveImageUrl(partner.logo);

                const content = (
                  <div className="flex min-h-44 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={
                          partner.name ||
                          "SHEF partner"
                        }
                        className="max-h-32 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-center font-semibold text-gray-700">
                        {partner.name}
                      </span>
                    )}
                  </div>
                );

                if (partner.website) {
                  return (
                    <a
                      key={partner.id}
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={partner.name}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={partner.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}
