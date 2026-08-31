import { Link } from "react-router-dom";

export default function Donate() {
  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-700 font-semibold">
            SUPPORT OUR WORK
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Support SHEF
          </h1>

          <p className="max-w-2xl mt-6 text-lg text-gray-600">
            Your support helps communities organise,
            strengthen local leadership and develop
            solutions to challenges affecting their
            settlements.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Partner with us
          </h2>

          <p className="mt-5 text-gray-600 text-lg">
            For donations, partnerships and other forms
            of support, please get in touch with our team.
          </p>

          <Link
            to="/contact"
            className="inline-block mt-8 bg-green-600 text-white px-7 py-3 rounded-lg hover:bg-green-700"
          >
            Contact SHEF
          </Link>
        </div>
      </section>
    </div>
  );
}