import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import PostForm from "./pages/PostForm";
import EditPost from "./pages/EditPost";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <Router>
        <NavBar />

        {/* Main content with grow */}
        <main className="flex-grow px-4 py-8 max-w-5xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/new" element={<PostForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post/post/:id" element={<EditPost />} />
          </Routes>
        </main>

        <footer className="bg-white text-sm text-center text-gray-500 py-4 border-t">
          © 2025 Kevin Ren · Powered by AWS & Docker
        </footer>
      </Router>
    </div>
  );
}

export default App;
