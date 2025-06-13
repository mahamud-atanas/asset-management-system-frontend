import { useAuth } from "./authContext";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin" />;
    case "superadmin":
      return <Navigate to="/superadmin" />;
    case "user":
      return <Navigate to="/user" />;
    default:
      return <Navigate to="/unauthorized" />;
  }
};

export default DashboardRedirect;
