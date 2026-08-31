import { useEffect, useState } from "react";
import {
  getPublications,
  type Publication,
} from "../../api/publications";
import { getMediaUrl } from "../../api/media";
import { Link } from "react-router-dom";

export default function Publications() {
  const [items, setItems] = useState<
    Publication[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublications()
      .then((result) => {
        setItems(result.data?.items || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-700 font-semibold">
            RESOURCES
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Publications
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p>Loading publications...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">
              No publications have been published yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {items.map((publication) => (
                <article
                  key={publication.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {publication.image_url && (
                    <img
                      src={getMediaUrl(
                        publication.image_url,
                      )}
                      alt={publication.title}
                      className="w-full h-52 object-cover"
                    />
                  )}

                  <div className="p-6">
                    <h2 className="text-xl font-semibold">
                      {publication.title}
                    </h2>

                    <p className="mt-3 text-gray-600">
                      {publication.excerpt ||
                        publication.description}
                    </p>

                    <Link
                      to={`/publications/${publication.id}`}
                      className="inline-block mt-5 text-green-700 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}