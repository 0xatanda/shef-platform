import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "../../api/client";

type ContactStatus = "unread" | "read" | string;

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

type ContactListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items: Contact[];
    pagination: Pagination;
  };
};

function formatDate(date: string) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

    return (
      response?.data?.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function Contacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<ContactListResponse>(
          "/admin/contacts/",
          {
            params: {
              page,
              limit: 10,
            },
          },
        );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Unable to load contacts.",
        );
      }

      const data = response.data.data;

      setItems(data?.items ?? []);
      setPagination(data?.pagination ?? null);
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to load contacts. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContacts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadContacts]);

  const handleView = async (contact: Contact) => {
    try {
      setError("");
      setSuccess("");
      setSelectedContact(contact);

      if (contact.status === "unread") {
        setActionLoading(contact.id);

        await api.patch(
          `/admin/contacts/${contact.id}/read`,
        );

        const updatedContact = {
          ...contact,
          status: "read",
        };

        setItems((current) =>
          current.map((item) =>
            item.id === contact.id
              ? updatedContact
              : item,
          ),
        );

        setSelectedContact(updatedContact);
      }
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to mark message as read.",
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsRead = async (
    contact: Contact,
  ) => {
    if (contact.status === "read") {
      return;
    }

    try {
      setActionLoading(contact.id);
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/contacts/${contact.id}/read`,
      );

      const updatedContact = {
        ...contact,
        status: "read",
      };

      setItems((current) =>
        current.map((item) =>
          item.id === contact.id
            ? updatedContact
            : item,
        ),
      );

      if (
        selectedContact?.id === contact.id
      ) {
        setSelectedContact(updatedContact);
      }

      setSuccess(
        "Message marked as read.",
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to mark message as read.",
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (
    contact: Contact,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the message from ${contact.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(contact.id);
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/contacts/${contact.id}`,
      );

      if (
        selectedContact?.id === contact.id
      ) {
        setSelectedContact(null);
      }

      if (
        items.length === 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      } else {
        await loadContacts();
      }

      setSuccess(
        "Message deleted successfully.",
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to delete message.",
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const unreadCount = items.filter(
    (contact) =>
      contact.status === "unread",
  ).length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Contacts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage enquiries submitted through
          the SHEF website.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Messages
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pagination?.total ?? items.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Unread on this page
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {unreadCount}
          </p>
        </div>
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

      {/* Contact List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading contacts...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
              ✉
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No enquiries yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Website enquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((contact) => (
              <article
                key={contact.id}
                className={`p-5 transition hover:bg-gray-50 sm:p-6 ${
                  contact.status === "unread"
                    ? "bg-green-50/30"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      void handleView(contact)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          contact.status ===
                          "unread"
                            ? "text-slate-900"
                            : "text-gray-700"
                        }`}
                      >
                        {contact.subject ||
                          "General enquiry"}
                      </h3>

                      {contact.status ===
                        "unread" && (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Unread
                        </span>
                      )}

                      {contact.status ===
                        "read" && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                          Read
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {contact.name}

                      <span className="mx-2 text-gray-300">
                        •
                      </span>

                      {contact.email}
                    </p>

                    {contact.phone && (
                      <p className="mt-1 text-xs text-gray-500">
                        {contact.phone}
                      </p>
                    )}

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                      {contact.message}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {formatDate(
                        contact.created_at,
                      )}
                    </p>
                  </button>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleView(contact)
                      }
                      disabled={
                        actionLoading ===
                        contact.id
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      View
                    </button>

                    {contact.status ===
                      "unread" && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleMarkAsRead(
                            contact,
                          )
                        }
                        disabled={
                          actionLoading ===
                          contact.id
                        }
                        className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          contact,
                        )
                      }
                      disabled={
                        actionLoading ===
                        contact.id
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination &&
        pagination.total_pages > 1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of{" "}
              {pagination.total_pages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  page <= 1 || loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1,
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                    pagination.total_pages ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* Message Details */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedContact.subject ||
                      "General enquiry"}
                  </h2>

                  {selectedContact.status ===
                  "read" ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                      Read
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Unread
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Received{" "}
                  {formatDateTime(
                    selectedContact.created_at,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedContact(null)
                }
                className="rounded-lg px-3 py-2 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close message"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {selectedContact.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="mt-1 block text-sm font-medium text-green-700 hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                {selectedContact.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Phone
                    </p>

                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="mt-1 block text-sm font-medium text-green-700 hover:underline"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Message
                </p>

                <div className="mt-2 rounded-lg bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                {selectedContact.status ===
                  "unread" && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleMarkAsRead(
                        selectedContact,
                      )
                    }
                    disabled={
                      actionLoading ===
                      selectedContact.id
                    }
                    className="rounded-lg border border-green-200 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                  >
                    Mark as Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void handleDelete(
                      selectedContact,
                    )
                  }
                  disabled={
                    actionLoading ===
                    selectedContact.id
                  }
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedContact(null)
                  }
                  className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
