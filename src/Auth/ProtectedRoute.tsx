import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";
import type { Role } from "./authContext";

type Props = {
  children: JSX.Element;
  role: Role | Role[]; // allow a single role or an array of roles
};

const ProtectedRoute = ({ children, role }: Props) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
