import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";

const getJwtClaim = (token, keys) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    for (const k of keys) if (payload[k]) return payload[k];
  } catch {}
  return undefined;
};

const Home = () => {
  const navigate = useNavigate();
  const postSectionRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // NEW: filters
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "", "Draft", "Published", "Archived"
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // If you also want text search, call /Post/PostsBySearch/{term}?status=&includeDeleted=
      // Here we use /Post/Posts with optional includeDeleted, then filter by status client-side
      const res = await axiosClient.get(`/post/posts?includeDeleted=${includeDeleted}`);
      const data = Array.isArray(res.data) ? res.data : [];

      const filtered =
        statusFilter ? data.filter(p => (p.status || "").toLowerCase() === statusFilter.toLowerCase()) : data;

      setPosts(filtered);
    } catch {
      alert("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Handle .NET’s namespaced email claim too
    const email =
      getJwtClaim(token, [
        "email",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ]) || "User";

    setUserEmail(email);
    setIsLoggedIn(true);
  }, []);

  // refetch when filters change (and logged in)
  useEffect(() => {
    if (isLoggedIn) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, includeDeleted, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/login");
  };

  const handleDelete = async (postId) => {
    const ok = window.confirm("Soft-delete this post? You can restore it later.");
    if (!ok) return;

    try {
      await axiosClient.delete(`/post/delete/${postId}`);
      alert("Post soft-deleted");
      fetchPosts();
    } catch {
      alert("Failed to delete post");
    }
  };

  const handleRestore = async (postId) => {
    try {
      await axiosClient.post(`/post/restore/${postId}`);
      alert("Post restored");
      fetchPosts();
    } catch {
      alert("Failed to restore post");
    }
  };

  const scrollToPosts = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      JSON.parse(atob(token.split(".")[1])); // just test decode
      postSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const StatusBadge = ({ status }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
      bg-gray-100 text-gray-700">
      {status || "Draft"}
    </span>
  );

  const TagsLine = ({ tags }) => {
    const csv = tags || "";
    const arr = csv.split(",").map(t => t.trim()).filter(Boolean);
    if (arr.length === 0) return null;
    return (
      <div className="text-xs text-gray-500 mt-1">
        {arr.map((t, i) => (
          <span key={i} className="inline-block mr-2">#{t}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Full Stack User Management System</h1>
        {isLoggedIn && (
          <p className="text-sm text-gray-500 mb-2">Welcome, {userEmail}</p>
        )}
        <p className="text-gray-600 mb-6">
          Built with React, ASP.NET Core, MySQL, Docker, ECS Fargate, and S3. JWT-secured authentication and cloud-native CI/CD pipeline.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          {!isLoggedIn ? (
            <button
              onClick={scrollToPosts}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          ) : (
            <>
              <Link
                to="/post/new"
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
              >
                Create Post
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </section>

      {/* Filters (only show if logged in) */}
      {isLoggedIn && (
        <div className="flex items-center gap-4 mb-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Include deleted
          </label>

          <div className="text-sm">
            <span className="mr-2 text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All</option>
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>

          <button
            onClick={fetchPosts}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      )}

      {/* Post Feed (only show if logged in) */}
      {isLoggedIn && (
        <section ref={postSectionRef}>
          <h2 className="text-2xl font-semibold mb-4">All Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts found.</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li
                  key={post.postId}
                  className={`border rounded-lg p-4 shadow-sm bg-white ${post.isDeleted ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{post.postTitle}</h3>
                      <p className="text-gray-600 mt-1">{post.postContent}</p>
                      <TagsLine tags={post.tags} />
                      <p className="text-xs text-gray-400 mt-2">
                        Posted on: {new Date(post.postCreated).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <StatusBadge status={post.status} />
                      {post.isDeleted && (
                        <div className="text-[10px] text-amber-700 mt-1">soft-deleted</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {!post.isDeleted ? (
                      <>
                        <button
                          onClick={() => navigate(`/post/post/${post.postId}`)}
                          className="text-sm bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.postId)}
                          className="text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(post.postId)}
                        className="text-sm bg-amber-600 text-white px-4 py-1 rounded hover:bg-amber-700 transition"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
