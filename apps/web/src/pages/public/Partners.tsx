import { useEffect, useState } from "react";
import api from "../../api/client";

type Partner = {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
};

type PartnersResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Partner[];
  };
};

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPartners() {
      try {
        const response =
          await api.get<PartnersResponse>("/partners");

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Unable to load partners",
          );
        }

        if (mounted) {
          setPartners(
            (response.data.data?.items ?? []).filter(
              (partner) => partner.is_active !== false,
            ),
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load partners",
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
      <div className="mx-auto max-w-7xl px-4 py-16">
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

        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading partners...
          </div>
        )}

        {!loading && error && (
          <div className="py-16 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && partners.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            Our partners will appear here.
          </div>
        )}

        {!loading && !error && partners.length > 0 && (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {partners.map((partner) => {
              const content = (
                <div className="flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-h-24 max-w-full object-contain"
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