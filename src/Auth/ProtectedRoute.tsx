import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const ProtectedRoute = ({ children, role }: { children: JSX.Element; role: "admin" | "superadmin" | "user" }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;



// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "../../Components/Sidebar";
// import Navbar from "../../Components/Navbar";
// import Footer from "../../Components/Footer";
// import Dashboard from "./Dashboard";

// const AdminLayout = () => {
//   const location = useLocation(); // Get current route

//   return (
//     <div className="wrapper">
//       {/* Navbar */}
//       <Navbar />

//       {/* Sidebar */}
//       <Sidebar />

//       {/* Content Wrapper */}
//       <div className="content-wrapper">
//         <section className="content">
//           <div className="container-fluid">
//             {/* Load Dashboard if at /admin, otherwise load requested page */}
//             {location.pathname === "/admin" ? <Dashboard /> : <Outlet />}
//           </div>
//         </section>
//       </div>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };
// export default AdminLayout;

// import "admin-lte/dist/js/adminlte.min.js";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "jquery/dist/jquery.min.js";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./Auth/authContext";
// import Login from "./Pages/Login";
// import SuperAdminDashboard from "./Pages/SuperAdmin/SuperAdminDashboard";
// import UserDashboard from "./Pages/Users/UserDashboard";
// import Unauthorized from "./Components/Unauthorized";
// import ProtectedRoute from "./Auth/ProtectedRoute";
// import DashboardRedirect from "./Auth/DashboardRedirect";
// import AssetForm from "./Components/AssetForm";
// import AdminLayout from "./Pages/Admin/AdminLayout";

// const App = () => {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Redirect to Admin Dashboard */}
//           <Route path="/" element={<Navigate to="/admin" />} />
//           <Route path="/dashboard" element={<DashboardRedirect />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />

//           {/* Authentication Routes */}
//           <Route path="/login" element={<Login />} />

//           {/* Admin Routes (Dashboard & AssetForm inside AdminLayout) */}
//           <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
//             <Route path="add-asset" element={<AssetForm />} /> {/* ✅ FIXED: Correct path */}
//           </Route>

//           {/* Super Admin Routes */}
//           <Route path="/superadmin" element={<ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />

//           {/* User Routes */}
//           <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// };

// export default App;
