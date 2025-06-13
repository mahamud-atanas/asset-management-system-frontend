import { useAuth } from "../../Auth/authContext";


const SuperAdminDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  console.log("Current User:", user); // Debugging Line

  return (
    <nav>
      {isAuthenticated() ? (
        <>
          <span>Welcome, {user?.role}!</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};


export default SuperAdminDashboard;
