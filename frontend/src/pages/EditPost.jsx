import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    postTitle: "",
    postContent: "",
    status: "Draft",
    tagsCsv: ""
  });
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/post/postsingle/${id}?includeDeleted=true`);
        const p = res.data || {};
        setForm({
          postTitle: p.postTitle ?? "",
          postContent: p.postContent ?? "",
          status: p.status ?? "Draft",
          tagsCsv: p.tags ?? ""
        });
        setIsDeleted(Boolean(p.isDeleted));
      } catch (err) {
        alert(err.response?.data || "Failed to fetch post.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toTagsArray = (csv) => csv.split(",").map(t => t.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDeleted) {
      alert("This post is soft-deleted. Restore it before saving.");
      return;
    }
    setSaving(true);
    try {
      await axiosClient.put("/post/post", {
        postId: Number(id),
        postTitle: form.postTitle,
        postContent: form.postContent,
        status: form.status,
        tags: toTagsArray(form.tagsCsv)
      });
      alert("Post updated");
      navigate("/");
    } catch (err) {
      alert(err.response?.data || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    try {
      await axiosClient.post(`/post/restore/${id}`);
      setIsDeleted(false);
      alert("Post restored");
    } catch (err) {
      alert(err.response?.data || "Failed to restore post.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-2xl w-full bg-white p-6 rounded shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Post</h2>

          {isDeleted && (
            <div className="text-sm text-amber-700">
              This post is soft-deleted.
              <button
                onClick={handleRestore}
                className="ml-3 bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
              >
                Restore
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1" htmlFor="postTitle">
              Post Title
            </label>
            <input
              id="postTitle"
              name="postTitle"
              type="text"
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
              value={form.postContent}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1" htmlFor="status">
                Status
              </label>
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
              <label className="block text-sm text-gray-600 mb-1" htmlFor="tagsCsv">
                Tags (comma separated)
              </label>
              <input
                id="tagsCsv"
                name="tagsCsv"
                type="text"
                placeholder="intro, edited"
                value={form.tagsCsv}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || isDeleted}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update Post"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
