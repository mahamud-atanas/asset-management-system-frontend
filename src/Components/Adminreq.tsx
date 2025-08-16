import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Request {
  _id: string;
  firstName: string;
  lastName: string;
  date: string;
  department: string;
  assetType: string;
  quantity: number;
  description: string;
  status: string;
}

const Adminreq: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch requests from backend
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://asset-backend-1976da1bf0ad.herokuapp.com/api/request", {
        headers: { "x-auth-token": token },
      });

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res.data.requests)) {
        setRequests(res.data.requests);
      } else {
        console.error("Unexpected API format:", res.data);
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Update status (Approve / Reject)
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        return;
      }

      await axios.put(
        `https://asset-backend-1976da1bf0ad.herokuapp.com/${id}/status`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating request:", error.response?.data || error.message);
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter & search logic
  const filteredRequests = requests
    .filter((req) => (filterStatus === "All" ? true : req.status === filterStatus))
    .filter((req) =>
      `${req.firstName} ${req.lastName} ${req.department} ${req.assetType}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container p-4">
      <ToastContainer />
      <h2 className="mb-4">Admin Request Approval</h2>

      {/* Filter & Search */}
      <div className="d-flex mb-3">
        <select
          className="form-select w-auto me-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="All">All</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          className="form-control w-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <div className="card">
          <div className="card-body table-responsive p-0">
            <table className="table table-hover text-nowrap">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Asset Type</th>
                  <th>Quantity</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((req) => (
                    <tr key={req._id}>
                      <td>{req.firstName} {req.lastName}</td>
                      <td>{new Date(req.date).toLocaleDateString()}</td>
                      <td>{req.department}</td>
                      <td>{req.assetType}</td>
                      <td>{req.quantity}</td>
                      <td>{req.description}</td>
                      <td>
                        <span className={`badge ${
                          req.status === "Approved"
                            ? "bg-success"
                            : req.status === "Rejected"
                            ? "bg-danger"
                            : "bg-warning"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleStatusChange(req._id, "Approved")}
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleStatusChange(req._id, "Rejected")}
                            >
                              <FontAwesomeIcon icon={faTimes} /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer d-flex justify-content-center">
              <button
                className="btn btn-secondary btn-sm me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              <span className="align-self-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm ms-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Adminreq;




