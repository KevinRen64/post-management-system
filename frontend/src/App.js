import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import EditPost from './pages/EditPost'
import PostForm from './pages/PostForm'
import Login from './pages/Login'
import Register from './pages/Register'
import NavBar from './components/NavBar'

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/post/new" element = {<PostForm />} />
        <Route path = "/login" element = {<Login />} />
        <Route path = "/register" element = {<Register />} />
        <Route path="/post/post/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
