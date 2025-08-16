import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const PostForm = () => {
  const [form, setForm] = useState({
    postTitle: "",
    postContent: "",
    status: "Draft",    // 🔹 NEW (already in your code)
    tagsCsv: ""         // 🔹 NEW (already in your code)
  });

  // NEW: convert CSV -> array
  const toTagsArray = (csv) =>         // 🔹 (you had this—keeping it)
    csv.split(",").map(t => t.trim()).filter(Boolean);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔹 CHANGED: send Status + Tags (array), not raw form
      await axiosClient.post("/post/post", {
        postTitle: form.postTitle,
        postContent: form.postContent,
        status: form.status,               // 🔹 NEW
        tags: toTagsArray(form.tagsCsv)    // 🔹 NEW
      });
      alert("Post created successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data || "Failed to create post.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1" htmlFor="postTitle">
              Post Title
            </label>
            <input
              id="postTitle"
              name="postTitle"
              type="text"
              placeholder="Enter post title"
              value={form.postTitle}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1" htmlFor="postContent">
              Post Content
            </label>
            <textarea
              id="postContent"
              name="postContent"
              placeholder="Write your post here..."
              value={form.postContent}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 🔹 NEW: Status select + Tags input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1" htmlFor="tagsCsv">Tags (comma separated)</label>
              <input
                id="tagsCsv"
                name="tagsCsv"
                type="text"
                placeholder="e.g. intro, first"
                value={form.tagsCsv}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* 🔹 END NEW */}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
