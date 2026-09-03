import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Publications", to: "/publications" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          <Link to="/">
            <img
              src="/logo/SHEF.jpg"
              alt="Shantytown Empowerment Foundation"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-green-700"
                      : "text-gray-700 hover:text-green-700",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/donate"
              className="bg-green-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-green-700 transition"
            >
              Support Us
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className="text-2xl">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-5 border-t">
            <div className="pt-4 space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-md ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <Link
                to="/donate"
                onClick={() => setOpen(false)}
                className="block mt-3 bg-green-600 text-white text-center px-5 py-3 rounded-md"
              >
                Support Us
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}