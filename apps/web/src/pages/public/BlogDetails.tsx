import { Link, useParams } from "react-router-dom";

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <section className="min-h-[60vh] bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          to="/"
          className="text-sm font-medium text-[#00843D] hover:underline"
        >
          ← Back to home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-wide text-[#00843D]">
            SHEF Blog
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {slug
              ? slug
                  .split("-")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1),
                  )
                  .join(" ")
              : "Blog Post"}
          </h1>

          <div className="mt-8 rounded-2xl bg-slate-50 p-8">
            <p className="text-slate-600">
              This blog page is ready for connection to the
              SHEF backend content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}