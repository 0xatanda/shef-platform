import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img
              src="/public/logo/SHEF.png"
              alt="Shantytown Empowerment Foundation"
              className="h-16 w-auto object-contain mb-5"
            />

            <p className="text-gray-600 leading-7">
              Shantytown Empowerment Foundation works
              with communities to build inclusive,
              resilient and sustainable settlements.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Publications
            </h3>

            <Link
              to="/publications"
              className="block text-gray-600 hover:text-green-700 mb-2"
            >
              Publications
            </Link>

            <Link
              to="/projects"
              className="block text-gray-600 hover:text-green-700"
            >
              Projects
            </Link>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Organisation
            </h3>

            <Link
              to="/about"
              className="block text-gray-600 hover:text-green-700 mb-2"
            >
              About SHEF
            </Link>

            <Link
              to="/contact"
              className="block text-gray-600 hover:text-green-700"
            >
              Contact
            </Link>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Get Involved
            </h3>

            <Link
              to="/donate"
              className="block text-gray-600 hover:text-green-700 mb-2"
            >
              Support Us
            </Link>

            <Link
              to="/contact"
              className="block text-gray-600 hover:text-green-700"
            >
              Partner With Us
            </Link>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Shantytown
            Empowerment Foundation. All rights reserved.
          </p>

          <div className="flex gap-5">
            <a href="#" className="hover:text-green-700">
              Facebook
            </a>

            <a href="#" className="hover:text-green-700">
              X
            </a>

            <a href="#" className="hover:text-green-700">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}