import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const googleBtnRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleResponse = async (response) => {
    try {
      const res = await api.post("/auth/google", { credential: response.credential });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed");
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
        width: Math.min(320, googleBtnRef.current.offsetWidth || 320),
        text: "continue_with",
        logo_alignment: "left",
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
      const res = await api.post("/auth/login", form);
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
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to your account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
                    <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="link-row" style={{ marginTop: 10 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <div className="divider">OR</div>
        <div id="googleBtn" ref={googleBtnRef}></div>

        <div className="link-row">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}