import { Link } from "react-router-dom";

const NavBar = () =>{

  return(
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 hover:underline">
        UserManager
      </Link>
      <nav className="space-x-4">
        <Link to = "/login" className="text-blue-600 hover:underline">Login</Link>
        <Link to = "/register" className="text-blue-600 hover:underline">Register</Link>
        <Link to = "/post/new" className="text-blue-600 hover:underline">New Post</Link>
      </nav>
    </header>
  );
}

export default NavBar;