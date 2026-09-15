import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import api from "../../api/client";

interface DonationForm {
  name: string;
  email: string;
  phone: string;
  amount: string;
  currency: string;
  message: string;
}

interface ApiErrorResponse {
  message?: string;
}

const initialForm: DonationForm = {
  name: "",
  email: "",
  phone: "",
  amount: "",
  currency: "NGN",
  message: "",
};

export default function Donate() {
  const [form, setForm] =
    useState<DonationForm>(initialForm);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError(
        "Please enter a valid donation amount.",
      );
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/donations", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        amount,
        currency: form.currency,
        message: form.message.trim(),
      });

      setSuccess(
        "Thank you for your willingness to support SHEF. Our team will contact you with the next steps for your donation.",
      );

      setForm(initialForm);
    } catch (err: unknown) {
      const axiosError =
        err as AxiosError<ApiErrorResponse>;

      const errorResponse =
        axiosError.response?.data?.message;

      setError(
        errorResponse ||
          "Unable to submit your donation request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-green-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-semibold text-green-700">
            SUPPORT OUR WORK
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
            Support SHEF
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Your support helps communities organise,
            strengthen local leadership and develop
            solutions to challenges affecting their
            settlements.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          {/* Information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Make a difference
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Support community-led change
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              SHEF works with communities to strengthen
              local leadership, savings groups and
              community-led solutions around housing,
              water, sanitation, health and economic
              empowerment.
            </p>

            <p className="mt-5 leading-7 text-gray-600">
              Complete the form and let us know how you
              would like to support the work. A member of
              our team will contact you with the donation
              process and next steps.
            </p>

            <div className="mt-8 rounded-xl border border-green-100 bg-green-50 p-6">
              <h3 className="font-semibold text-gray-900">
                How it works
              </h3>

              <ol className="mt-4 space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                    1
                  </span>

                  <span>
                    Submit your donation details.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                    2
                  </span>

                  <span>
                    Our team contacts you to confirm the
                    donation.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                    3
                  </span>

                  <span>
                    We provide the appropriate donation
                    and payment instructions.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Donation Request
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Tell us how you would like to support SHEF.
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="donation-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="donation-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  required
                  maxLength={255}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="donation-email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="donation-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  required
                  maxLength={255}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="donation-phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="donation-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+234..."
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Amount / Currency */}
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div>
                  <label
                    htmlFor="donation-amount"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Donation Amount
                  </label>

                  <input
                    id="donation-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="50000"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="donation-currency"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Currency
                  </label>

                  <select
                    id="donation-currency"
                    value={form.currency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currency:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="NGN">
                      NGN
                    </option>

                    <option value="USD">
                      USD
                    </option>

                    <option value="GBP">
                      GBP
                    </option>

                    <option value="EUR">
                      EUR
                    </option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="donation-message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message
                </label>

                <textarea
                  id="donation-message"
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Tell us anything you would like us to know about your donation or support."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Donation Request"}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Submitting this form does not charge
                your account. Our team will contact you
                with the next steps.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
