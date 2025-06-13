import { useAuth } from "../Auth/authContext";

const Navbar = () => {
  const { user, logout, isAuthenticated  } = useAuth();
  console.log("Current User:", user);

  return (
    <>
    <nav className="fixed-top main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <a href="#" className="nav-link">Silentocean</a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <a href="#" className="nav-link">Contact{}</a>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        {/* Display Logged-in User Name */}
        {isAuthenticated() && user && (
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i className="fas fa-user"></i> {user.role}
            </a>
            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
              <a className="dropdown-item" href="#">Profile</a>
              <a className="dropdown-item" href="#">Settings</a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={logout}>Logout</button>
            </div>
          </li>
        )}
      </ul>
    </nav>
    <br></br><br></br><br></br>
    </>
  );
};

export default Navbar;
