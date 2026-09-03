import { useEffect, useState } from "react";

import api from "../../api/client";

type TeamMember = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  image_url?: string;
  is_active?: boolean;
};

type TeamResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: TeamMember[];
  };
};

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      try {
        const response = await api.get<TeamResponse>(
          "/team",
        );

        if (!cancelled && response.data.success) {
          setMembers(response.data.data?.items ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTeam();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Our Team
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Meet the people working with communities to
            advance inclusive and sustainable development.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">
            Loading team...
          </p>
        ) : members.length === 0 ? (
          <p className="text-sm text-slate-500">
            No team members available at the moment.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <article key={member.id}>
                <div className="aspect-4/5 overflow-hidden rounded-xl bg-slate-100">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  {member.name}
                </h2>

                {member.role && (
                  <p className="mt-1 text-sm font-medium text-[#00843D]">
                    {member.role}
                  </p>
                )}

                {member.bio && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {member.bio}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}