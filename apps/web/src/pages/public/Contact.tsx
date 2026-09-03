import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] =
    useState<ContactForm>(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title =
      "Contact | Shantytown Empowerment Foundation";
  }, []);

  function handleChange(
    field: keyof ContactForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const response = await api.post("/contact", form);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to send your message.",
        );
      }

      setSuccess(
        "Thank you. Your message has been received. We will get back to you soon.",
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20">
        {/* HEADER */}
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Contact Us
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            Reach out to the Shantytown Empowerment
            Foundation (SHEF). We welcome partnerships,
            research collaboration, donations, and community
            engagement.
          </p>
        </div>

        {/* CONTENT */}
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          {/* CONTACT DETAILS */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Office Address
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                13 Bashiru Street (1st Floor)
                <br />
                Ojodu Berger
                <br />
                Lagos, Nigeria
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Phone
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                +234 805 559 6821
                <br />
                +234 708 102 2172
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Email
              </h2>

              <a
                href="mailto:info@shefempower.org"
                className="mt-2 inline-block text-green-700 hover:underline"
              >
                info@shefempower.org
              </a>
            </div>

            {/* SUPPORT */}
            <div className="rounded-lg border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-green-700">
                Support Us
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                SHEF's work is sustained through
                partnerships, grants, and individual
                contributions. Your support helps strengthen
                community savings, advocacy, research, and
                inclusive development initiatives.
              </p>

              <p className="mt-6 font-medium text-gray-800">
                For donations, funding support, or
                institutional partnerships, please contact us
                directly.
              </p>

              <Link
                to="/donate"
                className="mt-5 inline-block rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Donate or Partner with Us
              </Link>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Send us a message
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Fill out the form and our team will get back to
              you.
            </p>

            {success && (
              <div
                role="status"
                className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="080..."
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(event) =>
                    handleChange(
                      "subject",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(event) =>
                    handleChange(
                      "message",
                      event.target.value,
                    )
                  }
                  className="w-full resize-y rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Write your message..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Sending..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}