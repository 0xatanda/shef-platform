import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../../api/client";

type DonationStatus =
  | "pending"
  | "completed"
  | "cancelled";

interface Donation {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  message: string;
  status: DonationStatus | string;
  admin_note: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface DonationListResponse {
  items: Donation[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const STATUS_OPTIONS: DonationStatus[] = [
  "pending",
  "completed",
  "cancelled",
];

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(
  amount: number,
  currency: string,
) {
  const normalizedCurrency =
    currency?.toUpperCase() || "NGN";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toLocaleString()}`;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "pending":
    default:
      return "Pending";
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "pending":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    typeof error === "object" &&
    error !== null &&
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

export default function Donations() {
  const [donations, setDonations] = useState<
    Donation[]
  >([]);

  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);

  const [selectedDonation, setSelectedDonation] =
    useState<Donation | null>(null);

  const [editingDonation, setEditingDonation] =
    useState<Donation | null>(null);

  const [editStatus, setEditStatus] =
    useState<DonationStatus>("pending");

  const [editNote, setEditNote] = useState("");

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<
        ApiResponse<DonationListResponse>
      >("/admin/donations", {
        params: {
          page,
          limit: 10,
        },
      });

      setDonations(
        response.data.data.items || [],
      );

      setPagination(
        response.data.data.pagination || null,
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to load donations. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { 
    const timer = window.setTimeout(() => { 
      void loadDonations(); 
    }, 0); 
    return () => { 
      window.clearTimeout(timer); 
    }; 
  }, [loadDonations]);

  const statistics = useMemo(() => {
    const total = pagination?.total || donations.length;

    const pending = donations.filter(
      (item) => item.status === "pending",
    ).length;

    const completed = donations.filter(
      (item) => item.status === "completed",
    ).length;

    const cancelled = donations.filter(
      (item) => item.status === "cancelled",
    ).length;

    const completedAmount = donations
      .filter(
        (item) => item.status === "completed",
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    return {
      total,
      pending,
      completed,
      cancelled,
      completedAmount,
    };
  }, [donations, pagination]);

  function openDonation(donation: Donation) {
    setSelectedDonation(donation);
    setError("");
    setSuccess("");
  }

  function closeDonation() {
    setSelectedDonation(null);
  }

  function openEdit(donation: Donation) {
    setEditingDonation(donation);

    setEditStatus(
      STATUS_OPTIONS.includes(
        donation.status as DonationStatus,
      )
        ? (donation.status as DonationStatus)
        : "pending",
    );

    setEditNote(donation.admin_note || "");

    setError("");
    setSuccess("");
  }

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditingDonation(null);
    setEditNote("");
    setEditStatus("pending");
  }

  async function handleUpdate() {
    if (!editingDonation) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.put(
        `/admin/donations/${editingDonation.id}`,
        {
          status: editStatus,
          admin_note: editNote.trim(),
        },
      );

      setSuccess(
        "Donation updated successfully.",
      );

      setEditingDonation(null);

      await loadDonations();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to update donation. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    donation: Donation,
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the donation from ${donation.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/donations/${donation.id}`,
      );

      setSuccess(
        "Donation deleted successfully.",
      );

      setSelectedDonation(null);

      if (
        donations.length === 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      } else {
        await loadDonations();
      }
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to delete donation. Please try again.",
        ),
      );
    }
  }

  function handleRefresh() {
    setSuccess("");
    setError("");
    void loadDonations();
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Donations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review donation requests, donor
            information, payment status, and
            administrative notes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ALERTS */}
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

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Donations
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-sm font-medium text-yellow-700">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-800">
            {statistics.pending}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-700">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-800">
            {statistics.completed}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            Cancelled
          </p>

          <p className="mt-2 text-2xl font-bold text-red-800">
            {statistics.cancelled}
          </p>
        </div>
      </div>

      {/* COMPLETED AMOUNT */}
      {!loading && donations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed donations on this page
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatAmount(
              statistics.completedAmount,
              "NGN",
            )}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            This figure is calculated from the
            donations currently loaded on the page.
          </p>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading donations...
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
              ₦
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No donations found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Donation requests submitted through
              the public website will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Donor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {donations.map((donation) => (
                    <tr
                      key={donation.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {donation.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {donation.email}
                          </p>

                          {donation.phone && (
                            <p className="mt-1 text-xs text-gray-400">
                              {donation.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {formatAmount(
                            Number(
                              donation.amount,
                            ),
                            donation.currency,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            donation.status,
                          )}`}
                        >
                          {getStatusLabel(
                            donation.status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(
                          donation.created_at,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openDonation(
                                donation,
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(donation)
                            }
                            className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Update
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                donation,
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="divide-y divide-gray-200 md:hidden">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {donation.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {donation.email}
                      </p>

                      {donation.phone && (
                        <p className="mt-1 text-xs text-gray-400">
                          {donation.phone}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        donation.status,
                      )}`}
                    >
                      {getStatusLabel(
                        donation.status,
                      )}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(
                        Number(
                          donation.amount,
                        ),
                        donation.currency,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(
                        donation.created_at,
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openDonation(donation)
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(donation)
                      }
                      className="flex-1 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION */}
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
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage(
                    (current) => current - 1,
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                    (current) => current + 1,
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* VIEW MODAL */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Donation Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Submitted{" "}
                  {formatDateTime(
                    selectedDonation.created_at,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDonation}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Donor
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {selectedDonation.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedDonation.status,
                    )}`}
                  >
                    {getStatusLabel(
                      selectedDonation.status,
                    )}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  <a
                    href={`mailto:${selectedDonation.email}`}
                    className="mt-1 block text-sm text-green-700 hover:underline"
                  >
                    {selectedDonation.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selectedDonation.phone ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatAmount(
                      Number(
                        selectedDonation.amount,
                      ),
                      selectedDonation.currency,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDateTime(
                      selectedDonation.created_at,
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Donor Message
                </p>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedDonation.message ||
                    "No message provided."}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Admin Note
                </p>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedDonation.admin_note ||
                    "No admin note added."}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    closeDonation();
                    openEdit(
                      selectedDonation,
                    );
                  }}
                  className="rounded-lg border border-green-200 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                  Update Donation
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedDonation,
                    )
                  }
                  className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Donation
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the status and add an
                administrative note.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Donor
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {editingDonation.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Amount
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {formatAmount(
                    Number(
                      editingDonation.amount,
                    ),
                    editingDonation.currency,
                  )}
                </p>
              </div>

              <div>
                <label
                  htmlFor="donation-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="donation-status"
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(
                      event.target
                        .value as DonationStatus,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {getStatusLabel(status)}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="donation-admin-note"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Admin Note
                </label>

                <textarea
                  id="donation-admin-note"
                  rows={5}
                  value={editNote}
                  onChange={(event) =>
                    setEditNote(
                      event.target.value,
                    )
                  }
                  placeholder="Add an internal note about this donation..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}