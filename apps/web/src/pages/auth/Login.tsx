import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        email,
        password,
      });

      if (!result.success) {
        setError(
          result.message || "Login failed.",
        );
        return;
      }

      localStorage.setItem(
        "shef_token",
        result.data.access_token,
      );

      localStorage.setItem(
        "shef_user",
        JSON.stringify(result.data.user),
      );

      navigate("/admin/dashboard");
    } catch {
      setError(
        "Unable to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center mb-8">
            <img
              src="/logo/SHEF.jpg"
              alt="SHEF"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Login
            </h1>

            <p className="text-gray-500 mt-2">
              Sign in to manage the SHEF website.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                placeholder="admin@shef.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-6">
            <a
              href="/"
              className="text-sm text-green-700 hover:underline"
            >
              ← Return to website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}