import { useEffect } from "react";

const focalAreas = [
  "Economic and Capacity Building Program",
  "Policy and Advocacy Program",
  "Community Health and Environment Program",
  "Housing and Community Upgrade Program",
  "Storytelling for Impact (Know-Your-City TV)",
  "Profiling and Data Collection Program",
];

export default function About() {
  useEffect(() => {
    document.title =
      "About | Shantytown Empowerment Foundation";
  }, []);

  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="overflow-hidden rounded-xl">
          <img
            src="/hero/about-hero.jpg"
            alt="Community empowerment and organizing"
            className="h-105 w-full object-cover"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-6 text-center text-4xl font-bold text-slate-900">
          About Us
        </h1>

        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-gray-700">
          Shantytown Empowerment Foundation (SHEF) is a
          non-governmental organization that supports the
          Nigeria Slum/Informal Settlement Federation (NSISF).
          We work with marginalized and deprived urban
          communities to advance social and economic
          transformation through community-led initiatives,
          advocacy, and inclusive development practices.
        </p>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <p className="text-lg leading-relaxed text-gray-700">
            Through our focal areas, SHEF seeks to build
            awareness around social and economic rights and
            explore practical strategies for securing their
            realization. We aim to broaden individual and
            community access to decision-making processes,
            while strengthening meaningful participation in
            the design and implementation of social and
            economic policies and programs that directly
            affect urban poor communities.
          </p>
        </div>

        {/* FOCAL AREAS */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
            Our Focal Areas
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {focalAreas.map((area) => (
              <div
                key={area}
                className="rounded-lg bg-green-600 px-6 py-4 font-medium text-white transition hover:bg-green-700"
              >
                {area}
              </div>
            ))}
          </div>
        </div>

        {/* MISSION */}
        <div className="mx-auto mt-20 max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Our Mission
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            Our mission is to empower informal settlement
            communities by strengthening their capacity to
            organize, generate data, influence policy, and
            drive inclusive urban development. We are
            committed to supporting community leadership,
            promoting equity, and enabling sustainable
            improvements in quality of life.
          </p>
        </div>
      </div>
    </section>
  );
}