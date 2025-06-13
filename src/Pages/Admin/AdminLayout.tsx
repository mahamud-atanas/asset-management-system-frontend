import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import Dashboard from "./Dashboard";

const AdminLayout = () => {
  const location = useLocation(); // Get current path

  return (
    <div className="wrapper">
      {/* Navbar & Sidebar Always Visible */}
      <Navbar />
      <Sidebar />

      {/* Content Wrapper */}
      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid">
            {/* Show Dashboard when at "/admin" */}
            {location.pathname === "/admin" && <Dashboard />}
            <Outlet /> {/* Dynamically loads nested routes */}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
