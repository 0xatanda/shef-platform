import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublication,
  type Publication,
} from "../../api/publications";
import { getMediaUrl } from "../../api/media";

export default function PublicationDetails() {
  const { id } = useParams();

  const [publication, setPublication] =
    useState<Publication | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getPublication(id)
      .then((result) => {
        setPublication(result.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        Loading publication...
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        Publication not found.
      </div>
    );
  }

  return (
    <article>
      {publication.image_url && (
        <img
          src={getMediaUrl(
            publication.image_url,
          )}
          alt={publication.title}
          className="w-full h-105 object-cover"
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">
          {publication.title}
        </h1>

        {publication.author && (
          <p className="mt-3 text-green-700">
            By {publication.author}
          </p>
        )}

        <div className="mt-8 text-gray-700 leading-8 whitespace-pre-line">
          {publication.content ||
            publication.description}
        </div>
      </div>
    </article>
  );
}