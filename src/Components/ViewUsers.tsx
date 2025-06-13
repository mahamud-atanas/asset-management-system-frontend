import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const ViewUsers: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // ✅ Stores search results
  const [search, setSearch] = useState(""); // ✅ Search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
        }

        const response = await axios.get("http://localhost:3000/api/users", {
          headers: {
            "x-auth-token": token,
          },
        });
        setUsers(response.data);
        setFilteredUsers(response.data); // ✅ Initialize search data
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Search Function
  useEffect(() => {
    const result = users.filter((user: any) => {
      return Object.values(user).join(" ").toLowerCase().includes(search.toLowerCase());
    });
    setFilteredUsers(result);
  }, [search, users]);

  const columns = [
    { name: "User ID", selector: (row: any) => row.id, sortable: true },
    { name: "First Name", selector: (row: any) => row.firstname, sortable: true },
    { name: "Last Name", selector: (row: any) => row.lastname, sortable: true },
    { name: "Email", selector: (row: any) => row.email, sortable: true },
    { name: "Phone Number", selector: (row: any) => row.phone, sortable: true },
    { name: "Role", selector: (row: any) => row.role, sortable: true },
  ];

  return (
    <>
    <div className="container mt-5">
      <h2 className="mb-4">User List</h2>

      {/* ✅ Search Input */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={filteredUsers} // ✅ Displays filtered search results
          pagination
          highlightOnHover
          striped
          responsive
          fixedHeader
        />
      )}
    </div>
    </>
  );
};

export default ViewUsers;