import { NavLink } from "react-router-dom";

export default function Footer() {
  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "font-semibold text-green-700"
      : "text-gray-600 transition hover:text-green-700";

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Publications */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Publications
          </h4>

          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <a
                href="https://chsdunilag.org/acrc-hosts-transformative-action-research-and-safeguarding-workshop-in-lagos/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-green-700"
              >
                <p className="font-medium text-gray-700">
                  ACRC Hosts Transformative Action Research and
                  Safeguarding Workshop in Lagos
                </p>

                <span className="text-xs text-gray-500">
                  June 26, 2025 · CHSD UNILAG
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://www.african-cities.org/transforming-informal-settlements-in-lagos-through-community-driven-wash-innovation-the-okerube-project/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-green-700"
              >
                <p className="font-medium text-gray-700">
                  Transforming Informal Settlements in Lagos
                  Through Community-Driven WASH Innovation
                </p>

                <span className="text-xs text-gray-500">
                  July 10, 2025 · African Cities Research Consortium
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://guardian.ng/news/nigeria/metro/group-unveils-water-sanitation-project-in-lagos-settlement/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-green-700"
              >
                <p className="font-medium text-gray-700">
                  Group unveils water, sanitation project in
                  Lagos settlement
                </p>

                <span className="text-xs text-gray-500">
                  September 22, 2025 · The Guardian Nigeria
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://www.african-cities.org/building-partnerships-in-development-what-needs-to-change/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-green-700"
              >
                <p className="font-medium text-gray-700">
                  Building Partnerships in Development:
                  What Needs to Change?
                </p>

                <span className="text-xs text-gray-500">
                  November 26, 2025 · African Cities Research Consortium
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Site Links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Site Links
          </h4>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/about" className={linkClass}>
                About
              </NavLink>
            </li>

            <li>
              <NavLink to="/projects" className={linkClass}>
                Projects
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/publications"
                className={linkClass}
              >
                Publications
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className={linkClass}>
                Contact Us
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Organisation */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Organisation
          </h4>

          <ul className="mt-4 space-y-3 text-sm">
            <li className="text-gray-400">
              Careers
            </li>

            <li>
              <NavLink to="/about" className={linkClass}>
                About SHEF
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className={linkClass}>
                Partner With Us
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Contact
          </h4>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            13 Bashiru Street (1st Floor), GTCO Bank,
            Ojodu Berger, Lagos, Nigeria.
          </p>

          <p className="mt-3 text-sm text-gray-600">
            +234 805 559 6821
            <br />
            +234 708 102 2172
          </p>

          <p className="mt-3 text-sm">
            <a
              href="mailto:shantytownfoundation@gmail.com"
              className="text-green-700 transition hover:underline"
            >
              shantytownfoundation@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          {/* Logo + Copyright */}
          <NavLink
            to="/"
            className="flex items-center gap-4"
          >
            <img
              src="/logo/SHEF.jpg"
              alt="SHEF Logo"
              className="h-16 w-auto object-contain"
            />

            <span className="text-xs text-gray-500">
              © {new Date().getFullYear()} Shantytown
              Empowerment Foundation
            </span>
          </NavLink>

          {/* Social Links */}
          <div className="flex flex-wrap gap-5 text-sm text-gray-600">
            <a
              href="https://www.facebook.com/share/17MXrVVVFW/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-green-700"
            >
              Facebook
            </a>

            <a
              href="https://x.com/ShefEmpower"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-green-700"
            >
              X (Twitter)
            </a>

            <span className="cursor-default text-gray-400">
              Instagram
            </span>

            <span className="cursor-default text-gray-400">
              LinkedIn
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}