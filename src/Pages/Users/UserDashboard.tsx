import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RequestFormData {
  firstName: string;
  lastName: string;
  date: string;
  department: string;
  departmentManager: string;
  assetType: string;
  quantity: number | "";
  description: string;
}

const AssetStationeryRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<RequestFormData>({
    firstName: "",
    lastName: "",
    date: new Date().toISOString().split("T")[0],
    department: "",
    departmentManager: "",
    assetType: "",
    quantity: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<{ _id: string; firstname: string }[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get("https://asset-backend-1976da1bf0ad.herokuapp.com/api/users");
        setManagers(res.data);
      } catch (err) {
        console.error("Error fetching managers:", err);
        toast.error("Failed to load department managers.");
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption: any, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    try {
      const response = await axios.post("https://asset-backend-1976da1bf0ad.herokuapp.com/api/request", formData, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Request submitted successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          date: new Date().toISOString().split("T")[0],
          department: "",
          departmentManager: "",
          assetType: "",
          quantity: "",
          description: "",
        });
      } else {
        toast.error("Failed to submit request.");
      }
    } catch (error: any) {
      console.error("Error submitting request:", error.response?.data || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="card card-primary mt-4">
        <div
          className="card-header"
          style={{ background: "linear-gradient(90deg, #007bff, #0056b3)" }}
        >
          <h3 className="card-title">
            <i className="fas fa-box-open mr-2"></i> Asset & Stationery Request Form
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="row">
              {/* First Name */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-user mr-2"></i> First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
              {/* Last Name */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-user mr-2"></i> Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
              {/* Date */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-calendar-alt mr-2"></i> Date
                </label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Department */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-building mr-2"></i> Department
                </label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  required
                />
              </div>
              {/* Department Manager (Dropdown) */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-user-tie mr-2"></i> Department Manager
                </label>
                <Select
                  options={managers.map((m) => ({
                    value: m._id,
                    label: m.firstname,
                  }))}
                  isSearchable
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, "departmentManager")
                  }
                  placeholder="Search and Select Manager"
                />
              </div>
              {/* Asset Type */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-cogs mr-2"></i> Asset Type
                </label>
                <select
                  name="assetType"
                  className="form-control"
                  value={formData.assetType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select asset type</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Laptop">Desktop</option>
                  <option value="Printer">Printer</option>
                  <option value="Stationery">Stationery items</option>
                  <option value="Furniture">Cartriedge</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>
              {/* Quantity */}
              <div className="col-md-6 mb-3">
                <label>
                  <i className="fas fa-sort-numeric-up mr-2"></i> Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>
              {/* Description */}
              <div className="col-12 mb-3">
                <label>
                  <i className="fas fa-align-left mr-2"></i> Description
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter additional details"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="card-footer text-right">
  <button type="submit" className="btn btn-primary" disabled={loading}>
    {loading ? (
      <>
        <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
      </>
    ) : (
      <>
        <i className="fas fa-paper-plane mr-2"></i> Submit Request
      </>
    )}
  </button>
</div>

        </form>
      </div>
    </>
  );
};

export default AssetStationeryRequestForm;
