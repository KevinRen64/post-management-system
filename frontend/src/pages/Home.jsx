import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const postSectionRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await axiosClient.get("/post/posts");
      setPosts(res.data);
    } catch {
      alert("Failed to load posts");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserEmail(payload.email || "User");
        setIsLoggedIn(true);
        fetchPost();
      } catch {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/login");
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axiosClient.delete(`/post/delete/${postId}`);
      alert("Post Deleted");
      fetchPost();
    } catch {
      alert("Failed to delete post");
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
                  className="border rounded-lg p-4 shadow-sm bg-white"
                >
                  <h3 className="text-xl font-semibold text-gray-800">
                    {post.postTitle}
                  </h3>
                  <p className="text-gray-600 mt-1">{post.postContent}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted on: {new Date(post.postCreated).toLocaleString()}
                  </p>
                  <div className="flex space-x-2 mt-4">
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
