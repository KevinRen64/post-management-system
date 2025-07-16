import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Home = () =>{
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  const fetchPost = async () => {
    try {
      const res = await axiosClient.get("/post/posts")
      setPosts(res.data);
    } catch {
      alert("Failed to load posts")
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchPost();
  },[navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axiosClient.delete(`/post/delete/${postId}`);
      alert("Post Deleted");
      fetchPost();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return(
    <div> 
      <h2>All Posts</h2>
      <button onClick={handleLogout}>Logout</button>
      {posts.length === 0 && <p>No posts found.</p>}
      <ul>
        {posts.map(post => (
          <li key={post.postId}>
            <h3>{post.postTitle}</h3>
            <p>{post.postContent}</p>
            <small>Posted on: {new Date(post.postCreated).toLocaleString()}</small>
            <button onClick={() => handleDelete(post.postId)}>Delete</button>
            <button onClick={() => navigate(`/post/post/${post.postId}`)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;