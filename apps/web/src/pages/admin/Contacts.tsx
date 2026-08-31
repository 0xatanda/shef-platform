import { useEffect, useState } from "react";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
};

type ContactResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Contact[];
  };
};

export default function Contacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      try {
        const token = localStorage.getItem("shef_token");

        const response = await fetch(
          "/api/v1/admin/contacts?page=1&limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: ContactResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load contacts",
          );
        }

        if (!cancelled) {
          setItems(result.data?.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load contacts",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContacts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Contacts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage enquiries submitted through the SHEF website.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-8 text-sm text-slate-500">
            Loading contacts...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-slate-900">
              No enquiries yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Website enquiries will appear here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((contact) => (
              <article
                key={contact.id}
                className="p-6"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {contact.subject || "General enquiry"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {contact.name} · {contact.email}
                    </p>

                    {contact.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {contact.phone}
                      </p>
                    )}
                  </div>

                  <time className="text-xs text-slate-400">
                    {new Date(
                      contact.created_at,
                    ).toLocaleDateString()}
                  </time>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {contact.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}