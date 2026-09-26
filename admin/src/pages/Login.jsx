import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";

import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, loading } =
    useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-logo">
          <img src="/logo/AxelPath-icon.png" alt="AxelPath" />
        </div>

        <span className="admin-login-eyebrow">
          AxelPath Administration
        </span>

        <h1>Welcome back</h1>
        <p>Sign in to manage AxelPath content.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <span className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@AxelPath.com"
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="input-with-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </span>
          </label>

          {error && (
            <p className="admin-form-error">{error}</p>
          )}

          <button
            type="submit"
            className="admin-primary-button"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}