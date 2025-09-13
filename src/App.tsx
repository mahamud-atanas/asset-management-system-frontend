import "admin-lte/dist/js/adminlte.min.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "jquery/dist/jquery.min.js";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Auth/authContext";
import Login from "./Pages/Login";
import SuperAdminDashboard from "./Pages/SuperAdmin/SuperAdminDashboard";
import Unauthorized from "./Components/Unauthorized";
import ProtectedRoute from "./Auth/ProtectedRoute";
import DashboardRedirect from "./Auth/DashboardRedirect";
import AssetForm from "./Components/AssetForm";
import AdminLayout from "./Pages/Admin/AdminLayout";
// import Dashboard from "./Pages/Admin/Dashboard";
import ViewAsset from "./Components/ViewAsset";
import ReportPage from "./Components/ReportPage";
import { ToastContainer } from "react-toastify"; 
import ViewUsers from "./Components/ViewUsers";
import Crudepage from "./Components/Crudepage";
import UserLayout from "./Pages/Users/UserLayout";
import Adminreq from "./Components/Adminreq";
import RoleManager from "./Components/RoleManager";
import UserRequests from "./Pages/Users/UserRequests";

const App = () => {
  return (
    <AuthProvider>
      <Router>
      <ToastContainer />
        <Routes>
          {/* Redirect to Admin Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes (Nested inside AdminLayout) */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route path="assetForm" element={<AssetForm />} />
            <Route path="viewAsset" element={<ViewAsset />} />
            <Route path="reportPage" element={<ReportPage />} />
            <Route path="viewUsers" element={<ViewUsers />} />
            <Route path="crudePage" element={<Crudepage />} />
            <Route path="adminreq" element={<Adminreq />} />
             <Route path="roles" element={<RoleManager />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={<ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />

          {/* User Routes */}
           /* User (protected) + user assets route */
         <Route path="/user" element={ <ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}/>
         {/* ✅ Standalone match so /user/assets always works */}
         <Route path="/user"  element={ <ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
         <Route path="assets" element={<ViewAsset />} /> {/* now inside layout */}
         <Route path="userrequests" element={<UserRequests />} />
         </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
