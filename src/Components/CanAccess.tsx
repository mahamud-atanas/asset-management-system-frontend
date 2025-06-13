import { useAuth } from "../Auth/authContext";

interface CanAccessProps {
  roles: ("admin" | "superadmin" | "user")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const CanAccess = ({ roles, children, fallback = null }: CanAccessProps) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default CanAccess;
