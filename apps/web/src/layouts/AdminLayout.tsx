import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    label: "Projects",
    path: "/admin/projects",
  },
  {
    label: "Publications",
    path: "/admin/publications",
  },
  {
    label: "Partners",
    path: "/admin/partners",
  },
  {
    label: "Team",
    path: "/admin/team",
  },
  {
    label: "Testimonials",
    path: "/admin/testimonials",
  },
  {
    label: "Media",
    path: "/admin/media",
  },
  {
    label: "Contacts",
    path: "/admin/contacts",
  },
  {
    label: "Donations",
    path: "/admin/donations",
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("shef_token");
    localStorage.removeItem("shef_user");

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-5">
          <img
            src="/logo/SHEF.jpg"
            alt="Shantytown Empowerment Foundation"
            className="h-12 w-auto object-contain"
          />

          <div className="ml-3">
            <p className="text-sm font-bold text-slate-900">
              SHEF
            </p>
            <p className="text-xs text-slate-500">
              Administration
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const active =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  "block rounded-lg px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[#00843D] text-white"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#00843D]">
              SHEF Administration
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              Content Management System
            </h2>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            Sign out
          </button>
        </header>

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}