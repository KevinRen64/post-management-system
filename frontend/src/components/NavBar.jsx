import { Link } from "react-router-dom";

const NavBar = () =>{

  return(
    <nav style={{padding: "1rem", backgroundColor: "#eee"}}>
      <Link to = "/">Home</Link> | {" "}
      <Link to = "/post/new">New Post</Link> | {" "}
      <Link to = "/login">Login</Link> | {" "}
      <Link to = "/register">Register</Link>
      <Link to = "/register">test</Link>
    </nav>
  );
}

export default NavBar;
