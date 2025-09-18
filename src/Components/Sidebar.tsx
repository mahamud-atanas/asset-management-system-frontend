import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Auth/authContext'; // role from your auth

const API = 'https://asset-backend-1976da1bf0ad.herokuapp.com';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const role = isAuthenticated() && user ? user.role : null;

  const isSuper = role === 'superadmin';
  const isAdmin = role === 'admin' || isSuper;
  const isUser = role === 'user';

  const [isAssetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'user',
  });

  const toggleAssetDropdown = () => setAssetDropdownOpen((s) => !s);
  const toggleUserDropdown = () => setUserDropdownOpen((s) => !s);

  const openUserModal = () => {
    if (!isAdmin) {
      toast.error('Only admin or superadmin can add users');
      return;
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      role: 'user',
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Not authorized');
      return;
    }
    setIsSubmitting(true);

    const { firstname, lastname, email, password, role } = formData;

    // quick client-side checks (align to your backend rules)
    if (!firstname || !lastname || !email || !password || !role) {
      toast.error('All fields are required!');
      setIsSubmitting(false);
      return;
    }
    if (firstname.length < 2 || lastname.length < 2) {
      toast.error('First and last names must be at least 2 characters');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 5) {
      toast.error('Password must be at least 5 characters');
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/users`,
        { firstname, lastname, email, password, role },
        { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } }
      );

      if (response.status === 201) {
        toast.success('User added successfully!');
        closeUserModal();
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || 'Failed to add user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <aside className="main-sidebar sidebar-dark-warning elevation-4 position-fixed top-0 left-0 vh-100">
        <a href="#" className="brand-link" onClick={(e) => e.preventDefault()}>
          <span className="brand-text font-weight-light">Asset Management System</span>
        </a>

        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" role="menu">

              {/* Dashboard (admins only) */}
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    <i className="nav-icon fas fa-tachometer-alt"></i>
                    <p>Dashboard</p>
                  </Link>
                </li>
              )}

              {/* Asset Dropdown */}
              <li className={`nav-item has-treeview ${isAssetDropdownOpen ? 'menu-open' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAssetDropdown();
                  }}
                >
                  <i className="nav-icon fas fa-cogs"></i>
                  <p>
                    Asset Management
                    <i className={`right fas fa-angle-${isAssetDropdownOpen ? 'down' : 'left'}`}></i>
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isAssetDropdownOpen ? 'd-block' : 'd-none'}`}>
                  {/* Add Asset (admins only) */}
                  {isAdmin && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/assetForm">
                        <i className="fas fa-plus nav-icon"></i>
                        <p>Add Asset</p>
                      </Link>
                    </li>
                  )}

                  {/* View Assets (everyone) — users will see only their own on the page */}
                  <li className="nav-item">
                    <Link className="nav-link" to={isUser ? "/user/assets" : "/admin/viewAsset"}>
                        <i className="fas fa-list nav-icon"></i>
                        <p>{isUser ? "My Assets" : "View All Assets"}</p>
                    </Link>


                  </li>
                </ul>
              </li>

              {/* User Management (admins only) */}
              {isAdmin && (
                <li className={`nav-item has-treeview ${isUserDropdownOpen ? 'menu-open' : ''}`}>
                  <a
                    href="#"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleUserDropdown();
                    }}
                  >
                    <i className="nav-icon fas fa-users"></i>
                    <p>
                      User Management
                      <i className={`right fas fa-angle-${isUserDropdownOpen ? 'down' : 'left'}`}></i>
                    </p>
                  </a>
                  <ul className={`nav nav-treeview ${isUserDropdownOpen ? 'd-block' : 'd-none'}`}>
                    <li className="nav-item">
                      <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); openUserModal(); }}>
                        <i className="fas fa-plus nav-icon"></i>
                        <p>Add User</p>
                      </a>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/viewUsers">
                        <i className="fas fa-list nav-icon"></i>
                        <p>View All Users</p>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Role Management (admins only) */}
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/roles">
                    <i className="nav-icon fas fa-user-shield"></i>
                    <p>Role Management</p>
                  </Link>
                </li>
              )}

              {/* Department & KPI (admins only) */}
              {isAdmin && (
                <>
                  <li className="nav-item">
                    <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
                      <i className="nav-icon fas fa-building"></i>
                      <p>Add Department</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
                      <i className="nav-icon fas fa-book"></i>
                      <p>KPI Management</p>
                    </a>
                  </li>
                </>
              )}

              {/* Approvals (admins only) */}
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/adminreq">
                    <i className="fas fa-list nav-icon"></i>
                    <p>Approve Requests</p>
                  </Link>
                </li>
              )}

              {/* Notifications (everyone) */}
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
                  <i className="nav-icon fas fa-bell"></i>
                  <p>Notifications</p>
                </a>
              </li>

              {/* Reports (admins only) */}
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/reportPage">
                    <i className="nav-icon fas fa-chart-line"></i>
                    <p>Reports</p>
                  </Link>
                </li>
              )}

              {/* Superadmin area link (optional) */}
              {isSuper && (
                <li className="nav-item">
                  <Link className="nav-link" to="/superadmin">
                    <i className="nav-icon fas fa-user-shield"></i>
                    <p>Super Admin</p>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Add User Modal (admins only) */}
      {showUserModal && isAdmin && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form onSubmit={handleSubmit} className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="close" onClick={closeUserModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeUserModal}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
