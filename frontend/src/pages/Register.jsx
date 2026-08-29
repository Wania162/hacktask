import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleResponse = async (response) => {
    try {
      const res = await api.post("/auth/google", { credential: response.credential });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-up failed");
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google && googleBtnRef.current) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
            google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: Math.min(320, googleBtnRef.current.offsetWidth),
        text: "continue_with",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="subtitle">Sign up to get started</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="divider">OR</div>
        <div id="googleBtn" ref={googleBtnRef}></div>

        <div className="link-row">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}