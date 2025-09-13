import { useAuth } from "./authContext";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    case "user":
      return <Navigate to="/admin/viewAsset" replace />; // or keep /user if you have UserLayout
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default DashboardRedirect;
