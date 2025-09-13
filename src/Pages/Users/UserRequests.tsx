import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RequestData {
  _id: string;
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  departmentManager?: { firstname?: string; lastname?: string } | null;
  assetType?: string;
  quantity?: number;
  description?: string;
  status?: string;
}

// ----------- CONFIG: use HTTPS in prod, localhost in dev -----------
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta.env.PROD
    ? "https://asset-backend-1976da1bf0ad.herokuapp.com" // <-- your HTTPS backend
    : "http://localhost:5000");

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // match your backend
    config.headers["x-auth-token"] = token;
    // or: config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// safe date -> "—" if invalid
function fmtDate(v?: string) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

const UserRequests: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const fetchUserRequests = async () => {
    setLoading(true);
    setErrMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      const msg = "No authentication token found. Please log in.";
      toast.error(msg);
      setErrMsg(msg);
      setLoading(false);
      return;
    }

    try {
      // ✅ only-my-data endpoint
      const res = await api.get("/api/request/my-requests", {
        validateStatus: () => true,
      });

      if (res.status !== 200) {
        const msg =
          res.data?.message || res.data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const msg = err?.message || "Error fetching requests";
      console.error("Error fetching user requests:", err?.response?.data || msg);
      toast.error(msg);
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  if (loading) return <div>Loading your requests...</div>;
  if (errMsg) return <div className="text-danger">Error: {errMsg}</div>;
  if (requests.length === 0) return <div>No requests found.</div>;

  return (
    <>
      <ToastContainer />
      <div className="card mt-4">
        <div className="card-header bg-primary text-white">
          <h3>Your Asset &amp; Stationery Requests</h3>
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
              {requests.map((req) => {
                const mgr =
                  (req.departmentManager?.firstname || "") +
                  (req.departmentManager?.lastname
                    ? ` ${req.departmentManager.lastname}`
                    : "");
                return (
                  <tr key={req._id}>
                    <td>{fmtDate(req.date)}</td>
                    <td>{req.assetType ?? "—"}</td>
                    <td>{req.quantity ?? "—"}</td>
                    <td>{req.status ?? "—"}</td>
                    <td>{req.department ?? "—"}</td>
                    <td>{mgr.trim() || "—"}</td>
                    <td>{req.description ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserRequests;
