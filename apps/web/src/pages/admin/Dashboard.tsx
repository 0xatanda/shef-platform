export default function Dashboard() {

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your SHEF website.
        </p>

      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          "Projects",
          "Publications",
          "Partners",
          "Team Members",
          "Testimonials",
          "Media",
          "Contacts",
          "Donations",
        ].map((item) => (

          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >

            <p className="text-sm text-slate-500">
              {item}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              —
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}