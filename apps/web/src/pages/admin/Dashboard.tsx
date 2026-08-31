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
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          Dashboard
        </h2>

        <p className="text-gray-500 mt-2">
          Manage the SHEF website.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-sm transition"
          >
            <h3 className="font-semibold text-lg">
              {card.title}
            </h3>

            <p className="text-green-700 mt-3">
              Manage →
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}