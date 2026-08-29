import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ title: "", content: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/posts/${editingId}`, form);
        setPosts(posts.map((p) => (p._id === editingId ? res.data.post : p)));
      } else {
        const res = await api.post("/posts", form);
        setPosts([res.data.post, ...posts]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setForm({ title: post.title, content: post.content });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  return (
    <div className="posts-page">
      <header className="posts-header">
        <div className="user-info">
          {user?.avatar ? (
            <img className="avatar-sm" src={user.avatar} alt="avatar" />
          ) : (
            <div className="avatar-fallback">{user?.name?.[0]?.toUpperCase()}</div>
          )}
          <div className="welcome-text">
            <span>Welcome back</span>
            <strong>{user?.name}</strong>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="posts-toolbar">
        <div className="posts-count">
          {loading ? "Loading..." : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
        </div>
        {!showForm && (
          <button className="btn-primary btn-new" onClick={() => setShowForm(true)}>
            + New Post
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Post title"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={3}
              placeholder="What's on your mind?"
              required
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Post" : "Add Post"}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="posts-grid">
          {[1, 2, 3].map((i) => (
            <div className="post-card skeleton" key={i}></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-title">No posts yet</p>
          <p className="empty-text">Create your first post to get started.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div className="post-footer">
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <div className="post-actions">
                  <button className="btn-edit" onClick={() => handleEdit(post)} title="Edit">
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(post._id)} title="Delete">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}