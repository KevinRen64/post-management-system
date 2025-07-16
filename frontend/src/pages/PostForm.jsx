import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const PostForm = () =>{
  const [form, setForm] = useState({
    postTitle:"",
    postContent: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/post/post", form);
      alert("Post Created successfully!");
      navigate("/");
    }catch(err) {
      alert(err.response?.data || "Failed to create post.")
    }
  }

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

  },[navigate]);

  return(
    <div> 
      <h2>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="postTitle"
          placeholder="Post Title"
          value={form.postTitle}
          onChange={handleChange}
          required
        />
        <textarea          
          name="postContent"
          placeholder="Post Content"
          value={form.postContent}
          onChange={handleChange}
          required
          ></textarea>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default PostForm;