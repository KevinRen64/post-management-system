import {useState } from "react"
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Register = () =>{
  const  navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "Male",
  });

const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }

const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      await axiosClient.post("/auth/register", form);
      alert("Registration successful!");
      navigate("/login");
    } catch(err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return(
    <div> 
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder = "First Name" onChange={handleChange} required />
      <input name="lastName" placeholder = "Last Name" onChange={handleChange} required />
      <input name="email" placeholder = "Email" type = "email"  onChange={handleChange} required />
      <input name="password" placeholder = "Password" type = "password"  onChange={handleChange} required />
      <select name="gender" onChange={handleChange}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;