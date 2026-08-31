type ResourcePageProps = {
  title: string;
  description: string;
  actionLabel: string;
};

export default function ResourcePage({
  title,
  description,
  actionLabel,
}: ResourcePageProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-[#00843D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006f34]"
        >
          {actionLabel}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-10 text-center">
          <h3 className="font-semibold text-slate-900">
            Nothing here yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Records created through the SHEF administration
            system will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}