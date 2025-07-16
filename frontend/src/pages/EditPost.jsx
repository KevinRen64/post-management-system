import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditPost = () =>{
  const [form, setForm] = useState({
    postTitle:"",
    postContent: ""
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
    try {
      const res = await axiosClient.get(`/post/postsingle/${id}`);
      setForm({
        postTitle: res.data.postTitle,
        postContent: res.data.postContent
      });
    } catch {
      alert("Failed to fetch post.");
    }
  };  

  fetchPost();

  },[id, navigate]);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      await axiosClient.put("/post/post", {
        postId: id,
        ...form
      });
      alert("Post updated");
      navigate("/");
    }catch {
      alert("Update failed");
    }
  }

  return(
    <div> 
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="postTitle"
          value={form.postTitle}
          onChange={handleChange}
          required
        />
        <textarea          
          name="postContent"
          value={form.postContent}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}

export default EditPost;