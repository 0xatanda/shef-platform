import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import api from "../../api/client";

type UserRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "staff";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface EmployeeListResponse {
  items: Employee[];
  page: number;
  limit: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface EmployeeForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}

const emptyForm: EmployeeForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "staff",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  staff: "Staff",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(
    [],
  );

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 10,
      total: 0,
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<EmployeeForm>(emptyForm);

  /*
   * Load employees.
   *
   * The requested page is passed explicitly so pagination
   * actions do not depend on stale state.
   */
  const loadEmployees = useCallback(
    async (requestedPage: number) => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<
          ApiResponse<EmployeeListResponse>
        >("/admin/users", {
          params: {
            page: requestedPage,
            limit: pagination.limit,
          },
        });

        const result = response.data.data;

        setEmployees(result.items);

        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total,
        });
      } catch (error: unknown) {
        setError(
          getErrorMessage(
            error,
            "Unable to load employees. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  /*
   * Defer the initial request by one task.
   *
   * This avoids the react-hooks/set-state-in-effect
   * lint warning caused by synchronously invoking a
   * state-updating async function from the effect.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEmployees(1);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadEmployees]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (employee: Employee) => {
    setForm({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      password: "",
      role:
        employee.role === "super_admin" ||
        employee.role === "admin" ||
        employee.role === "editor" ||
        employee.role === "staff"
          ? employee.role
          : "staff",
    });

    setEditingId(employee.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStatusChange = async (
    employee: Employee,
  ) => {
    const nextStatus = !employee.is_active;

    const action = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${
        employee.first_name
      } ${employee.last_name}'s account?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/users/${employee.id}/status`,
        {
          is_active: nextStatus,
        },
      );

      setSuccess(
        `Employee account ${
          action === "activate"
            ? "activated"
            : "deactivated"
        } successfully.`,
      );

      await loadEmployees(pagination.page);
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          `Unable to ${action} employee account.`,
        ),
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim().toLowerCase();

    if (!firstName) {
      setError("First name is required.");
      return;
    }

    if (!lastName) {
      setError("Last name is required.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!editingId && !form.password) {
      setError("Password is required.");
      return;
    }

    if (!editingId && form.password.length < 12) {
      setError(
        "Password must be at least 12 characters.",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/admin/users/${editingId}`,
          {
            first_name: firstName,
            last_name: lastName,
            role: form.role,
          },
        );

        setSuccess(
          "Employee updated successfully.",
        );
      } else {
        await api.post("/admin/users", {
          first_name: firstName,
          last_name: lastName,
          email,
          password: form.password,
          role: form.role,
        });

        setSuccess(
          "Employee account created successfully.",
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadEmployees(pagination.page);
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          editingId
            ? "Unable to update employee."
            : "Unable to create employee.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    employee: Employee,
  ) => {
    const confirmed = window.confirm(
      `Delete ${employee.first_name} ${employee.last_name}'s account permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/users/${employee.id}`,
      );

      setSuccess(
        "Employee account deleted successfully.",
      );

      const shouldGoBack =
        employees.length === 1 &&
        pagination.page > 1;

      await loadEmployees(
        shouldGoBack
          ? pagination.page - 1
          : pagination.page,
      );
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          "Unable to delete employee account.",
        ),
      );
    }
  };

  const totalPages =
    pagination.total > 0
      ? Math.ceil(
          pagination.total / pagination.limit,
        )
      : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage employee accounts that
            can access the SHEF administration platform.
          </p>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? closeForm
              : openCreateForm
          }
          className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          {showForm ? "Cancel" : "Add Employee"}
        </button>
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

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId
                ? "Edit Employee"
                : "Create Employee Account"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? "Update the employee's profile and role."
                : "Create an account for a staff member who needs access to the SHEF admin platform."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Names */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="employee-first-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>

                <input
                  id="employee-first-name"
                  type="text"
                  value={form.first_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      first_name:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="employee-last-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>

                <input
                  id="employee-last-name"
                  type="text"
                  value={form.last_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      last_name:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="employee-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="employee-email"
                type="email"
                value={form.email}
                disabled={Boolean(editingId)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                required
              />

              {editingId && (
                <p className="mt-2 text-xs text-gray-500">
                  Email changes are disabled here because
                  the current backend UpdateUser service
                  does not update email addresses.
                </p>
              )}
            </div>

            {/* Password */}
            {!editingId && (
              <div>
                <label
                  htmlFor="employee-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Temporary Password
                </label>

                <input
                  id="employee-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password:
                        event.target.value,
                    }))
                  }
                  minLength={12}
                  autoComplete="new-password"
                  placeholder="Minimum 12 characters"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />

                <p className="mt-2 text-xs text-gray-500">
                  Use a strong temporary password. The
                  employee should change it after receiving
                  access.
                </p>
              </div>
            )}

            {/* Role */}
            <div>
              <label
                htmlFor="employee-role"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Role
              </label>

              <select
                id="employee-role"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target
                      .value as UserRole,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="staff">
                  Staff
                </option>

                <option value="editor">
                  Editor
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="super_admin">
                  Super Admin
                </option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Role permissions are enforced by the
                backend. Super Admin access should only be
                assigned when necessary.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Employee"
                    : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee Count */}
      <div className="text-sm text-gray-500">
        {pagination.total}{" "}
        {pagination.total === 1
          ? "employee"
          : "employees"}
      </div>

      {/* Employee Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
            +
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No employees found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Create an employee account to give a staff
            member access to the administration platform.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            Add Employee
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last Login
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50"
                  >
                    {/* Employee */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {employee.first_name
                            .charAt(0)
                            .toUpperCase()}
                          {employee.last_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {employee.first_name}{" "}
                            {employee.last_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          employee.role ===
                          "super_admin"
                            ? "bg-purple-100 text-purple-700"
                            : employee.role ===
                                "admin"
                              ? "bg-blue-100 text-blue-700"
                              : employee.role ===
                                  "editor"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {roleLabels[
                          employee.role
                        ] || employee.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 text-sm font-medium ${
                          employee.is_active
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            employee.is_active
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        />

                        {employee.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {formatDate(
                        employee.last_login,
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              employee,
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleStatusChange(
                              employee,
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            employee.is_active
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {employee.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              employee,
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of{" "}
                {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    void loadEmployees(
                      pagination.page - 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    pagination.page >= totalPages
                  }
                  onClick={() =>
                    void loadEmployees(
                      pagination.page + 1,
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
