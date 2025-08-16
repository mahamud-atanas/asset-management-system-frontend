import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RequestData {
  _id: string;
  firstName: string;
  lastName: string;
  date: string;
  department: string;
  departmentManager: { firstname: string; lastname: string };
  assetType: string;
  quantity: number;
  description: string;
  status: string;
}

const UserRequests: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/request/my-requests", {
        headers: {
          "x-auth-token": token,
        },
      });
      setRequests(response.data);
    } catch (err: any) {
      console.error("Error fetching user requests:", err.response?.data || err.message);
      toast.error(`Error fetching requests: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  if (loading) return <div>Loading your requests...</div>;

  if (requests.length === 0) return <div>No requests found.</div>;

  return (
    <>
      <ToastContainer />
      <div className="card mt-4">
        <div className="card-header bg-primary text-white">
          <h3>Your Asset & Stationery Requests</h3>
        </div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Asset Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Department</th>
                <th>Manager</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{new Date(req.date).toLocaleDateString()}</td>
                  <td>{req.assetType}</td>
                  <td>{req.quantity}</td>
                  <td>{req.status}</td>
                  <td>{req.department}</td>
                  <td>{req.departmentManager?.firstname} {req.departmentManager?.lastname}</td>
                  <td>{req.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserRequests;
