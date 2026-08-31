import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b">
          <img
            src="/public/logo/SHEF.jpg"
            alt="Shantytown Empowerment Foundation"
            className="h-12 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/admin/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Dashboard
          </a>

          <a
            href="/admin/projects"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Projects
          </a>

          <a
            href="/admin/publications"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Publications
          </a>

          <a
            href="/admin/partners"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Partners
          </a>

          <a
            href="/admin/team"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Team
          </a>

          <a
            href="/admin/testimonials"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Testimonials
          </a>

          <a
            href="/admin/media"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Media
          </a>

          <a
            href="/admin/contacts"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Contacts
          </a>

          <a
            href="/admin/donations"
            className="block px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700"
          >
            Donations
          </a>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="font-semibold text-gray-800">
            SHEF Administration
          </h1>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600"
          >
            Sign out
          </button>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}