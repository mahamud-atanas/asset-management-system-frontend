import { useState } from "react";
import { useAuth } from "../Auth/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import "./Login.css"; // Import custom styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Show loading state

    try {
      const response = await axios.post("http://localhost:3000/api/auth", { email, password });
      login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      setError("Invalid credentials.");
    } finally {
      setLoading(false); // Stop loading after request is done
    }
  };

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="login-box"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="card card-outline">
          <div className="card-header text-center text-secondary">
            <h2>Please Login Here</h2>
          </div>
          <div className="card-body">
            <p className="login-box-msg text-secondary">Sign in to start your session</p>

            {error && <motion.div className="alert alert-danger text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              {error}
            </motion.div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <motion.button
                    type="submit"
                    className="btn btn-block text-light"
                    style={{ backgroundColor: "#200a71" }}
                    whileHover={!loading ? { scale: 1.05 } : {}}
                    whileTap={!loading ? { scale: 0.95 } : {}}
                    disabled={loading} // Disable button while loading
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {" Processing..."}
                      </>
                    ) : (
                      "Submit"
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
