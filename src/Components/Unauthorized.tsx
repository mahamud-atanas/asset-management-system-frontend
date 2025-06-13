import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="hold-transition login-page">
      <div className="login-box">
        <div className="card card-danger">
          <div className="card-header text-center">
            <h1 className="card-title"><i className="fas fa-ban"></i> 403 - Unauthorized</h1>
          </div>
          <div className="card-body text-center">
            <p className="text-muted">You do not have permission to access this page.</p>
            
            {/* Alert Box */}
            <div className="alert alert-danger">
              <i className="icon fas fa-exclamation-triangle"></i> Access Denied!
            </div>

            <Link to="/dashboard" className="btn btn-primary btn-block">
              <i className="fas fa-home"></i> Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
