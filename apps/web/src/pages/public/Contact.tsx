import { useState } from "react";
import type { FormEvent } from "react";
import {
  submitContact,
} from "../../api/contacts";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  function update(
    field: keyof typeof form,
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

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await submitContact(form);

      setSuccess(
        "Thank you. Your message has been sent.",
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      setError(
        "We could not send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-700 font-semibold">
            GET IN TOUCH
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Contact us
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            <input
              required
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="Name"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value)
              }
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              value={form.subject}
              onChange={(e) =>
                update(
                  "subject",
                  e.target.value,
                )
              }
              placeholder="Subject"
              className="w-full border rounded-lg px-4 py-3"
            />

            <textarea
              required
              rows={7}
              value={form.message}
              onChange={(e) =>
                update(
                  "message",
                  e.target.value,
                )
              }
              placeholder="Your message"
              className="w-full border rounded-lg px-4 py-3"
            />

            <button
              disabled={loading}
              className="bg-green-600 text-white px-7 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}