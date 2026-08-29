import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {

  const navigate = useNavigate();

  function logout() {

    localStorage.removeItem("shef_token");
    localStorage.removeItem("shef_user");

    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">

        <div className="flex h-16 items-center border-b border-slate-200 px-6">

          <span className="text-lg font-bold text-slate-900">
            SHEF Admin
          </span>

        </div>

        <nav className="space-y-1 p-4">

          <Link
            to="/admin/dashboard"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/projects"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Projects
          </Link>

          <Link
            to="/admin/publications"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Publications
          </Link>

          <Link
            to="/admin/partners"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Partners
          </Link>

          <Link
            to="/admin/team"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Team
          </Link>

          <Link
            to="/admin/testimonials"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Testimonials
          </Link>

          <Link
            to="/admin/media"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Media
          </Link>

          <Link
            to="/admin/contacts"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Contacts
          </Link>

          <Link
            to="/admin/donations"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Donations
          </Link>

        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">

          <button
            onClick={logout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>

        </div>

      </aside>

      <main className="lg:pl-64">

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Admin Dashboard
          </h2>

          <button
            onClick={logout}
            className="text-sm text-slate-600 lg:hidden"
          >
            Sign out
          </button>

        </header>

        <div className="p-6">
          <Outlet />
        </div>

      </main>

    </div>
  );
}