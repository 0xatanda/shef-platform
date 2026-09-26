export default function Dashboard() {
  const cards = [
    {
      title: "Projects",
      href: "/admin/projects",
    },
    {
      title: "Publications",
      href: "/admin/publications",
    },
    {
      title: "Partners",
      href: "/admin/partners",
    },
    {
      title: "Media",
      href: "/admin/media",
    },
    {
      title: "Contacts",
      href: "/admin/contacts",
    },
    {
      title: "Donations",
      href: "/admin/donations",
    },
    {
      title: "Employees",
      href: "/admin/employees",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-500">
          Manage the SHEF website and
          administration platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-green-500 hover:shadow-sm"
          >
            <h3 className="text-lg font-semibold">
              {card.title}
            </h3>

            <p className="mt-3 text-green-700">
              Manage →
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
