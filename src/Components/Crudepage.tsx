// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import DataTable from "react-data-table-component";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "bootstrap/dist/css/bootstrap.min.css";

// interface Asset {
//   _id: string;
//   tagNumber: string;
//   itemDescription: string;
//   quantity: number;
//   department: string;
//   physicalLocation: string;
//   assetCondition: string;
//   category: string;
//   costPerItem: number;
//   totalAmount: number;
//   depreciationRate: number;
//   usefulLifeMonths: number;
//   numberOfMonthsInUse: number;
//   numberOfRemainingMonths: number;
//   monthlyDepreciation: number;
//   accumulatedDepreciation: number;
//   departmentManager: string;
//   user: string;
//   __v?: number;
// }

// const ViewAssets: React.FC = () => {
//   const [assets, setAssets] = useState<Asset[]>([]);
//   const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

//   useEffect(() => {
//     toast.info("Fetching assets...");
//     const fetchAssets = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           throw new Error("No authentication token found. Please log in again.");
//         }
//         const response = await axios.get("http://localhost:3000/api/asset", {
//           headers: { "x-auth-token": token },
//         });
//         setAssets(response.data);
//         setFilteredAssets(response.data);
//         toast.success("Assets loaded successfully!");
//       } catch (err: any) {
//         setError(err.message);
//         toast.error(`Error: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAssets();
//   }, []);

//   // ✅ Improved Search Filtering in useEffect
//   useEffect(() => {
//     const lowerCaseSearch = search.toLowerCase();

//     const filtered = assets.filter((asset) =>
//       Object.values(asset).some((value) =>
//         value?.toString().toLowerCase().includes(lowerCaseSearch)
//       )
//     );

//     setFilteredAssets(filtered);
//   }, [search, assets]);

//   const handleDelete = async (id: string) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:3000/api/asset/${id}`, {
//         headers: { "x-auth-token": token },
//       });
//       const updatedAssets = assets.filter((asset) => asset._id !== id);
//       setAssets(updatedAssets);
//       setFilteredAssets(updatedAssets);
//       toast.success("Asset deleted successfully!");
//     } catch (err) {
//       toast.error("Error deleting asset!");
//       console.error("Error deleting asset", err);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editingAsset) return;
//     try {
//       const token = localStorage.getItem("token");
//       const { _id, __v, ...assetData } = editingAsset;
//       await axios.put(`http://localhost:3000/api/asset/${_id}`, assetData, {
//         headers: { "x-auth-token": token },
//       });

//       const updatedAssets = assets.map((asset) =>
//         asset._id === _id ? { ...asset, ...assetData } : asset
//       );

//       setAssets(updatedAssets);
//       setFilteredAssets(updatedAssets);
//       setEditingAsset(null);
//       toast.success("Asset updated successfully!");
//     } catch (err) {
//       toast.error("Error updating asset!");
//       console.error("Error updating asset", err);
//     }
//   };

//   const columns = [
//     { name: "Tag Number", selector: (row: Asset) => row.tagNumber, sortable: true },
//     { name: "Description", selector: (row: Asset) => row.itemDescription, sortable: true },
//     { name: "Quantity", selector: (row: Asset) => row.quantity, sortable: true },
//     {
//       name: "Actions",
//       cell: (row: Asset) => (
//         <div>
//           <button className="btn btn-warning btn-sm me-2" onClick={() => setEditingAsset(row)}>Edit</button>
//           <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">Asset List</h2>
//       <input
//         type="text"
//         className="form-control mb-3"
//         placeholder="Search assets..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       {loading && <div className="spinner-border text-primary" role="status"></div>}
//       {error && <div className="alert alert-danger">{error}</div>}
//       {!loading && !error && <DataTable columns={columns} data={filteredAssets} pagination />}
      
//       {editingAsset && (
//         <div className="modal show d-block" tabIndex={-1}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Edit Asset</h5>
//                 <button type="button" className="btn-close" onClick={() => setEditingAsset(null)}></button>
//               </div>
//               <div className="modal-body">
//                 {Object.keys(editingAsset).map((key) => (
//                   key !== "_id" && key !== "__v" && (
//                     <div className="mb-2" key={key}>
//                       <label className="form-label">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
//                       <input
//                         type={typeof editingAsset[key as keyof Asset] === "number" ? "number" : "text"}
//                         className="form-control"
//                         value={editingAsset[key as keyof Asset] as string | number}
//                         onChange={(e) => setEditingAsset({
//                           ...editingAsset, 
//                           [key]: typeof editingAsset[key as keyof Asset] === "number" 
//                             ? Number(e.target.value) 
//                             : e.target.value
//                         })}
//                       />
//                     </div>
//                   )
//                 ))}
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={() => setEditingAsset(null)}>Cancel</button>
//                 <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewAssets;

import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";


interface Asset {
  _id: string;
  tagNumber: string;
  category: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
  };
  departmentManager: {
    _id: string;
    firstname: string;
    lastname: string;
  };
  __v?: number;
}

const Crudepage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get<Asset[]>("http://localhost:3000/api/asset")
      .then((res) => setAssets(res.data))
      .catch((err) => console.error("Error fetching assets:", err));
  }, []);

  const handleEdit = (asset: Asset) => {
    setEditingAsset({ ...asset });
    setShowModal(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setEditingAsset((prev) => {
      if (!prev) return null;

      if (name.startsWith("user.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          user: {
            ...prev.user,
            [field]: value,
          },
        };
      }

      if (name.startsWith("departmentManager.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          departmentManager: {
            ...prev.departmentManager,
            [field]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleUpdate = async () => {
    if (!editingAsset) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User might not be authenticated.");
      return;
    }

    try {
      const { _id, __v, user, departmentManager, ...rest } = editingAsset;

      const updateData = {
        ...rest,
        user: user._id,
        departmentManager: departmentManager._id,
      };

      await axios.put(`http://localhost:3000/api/asset/${_id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset._id === _id ? { ...asset, ...editingAsset } : asset
        )
      );

      setShowModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Asset List</h2>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Tag Number</th>
            <th>User</th>
            <th>Category</th>
            <th>Manager</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset._id}>
              <td>{asset.tagNumber}</td>
              <td>{asset.user.firstname} {asset.user.lastname}</td>
              <td>{asset.category}</td>
              <td>{asset.departmentManager.firstname} {asset.departmentManager.lastname}</td>
              <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(asset)}
                  >
                    Edit
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showModal && editingAsset && (
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Asset</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Tag Number</label>
                    <input
                      type="text"
                      name="tagNumber"
                      className="form-control"
                      value={editingAsset.tagNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">User Firstname</label>
                    <input
                      type="text"
                      name="user.firstname"
                      className="form-control"
                      value={editingAsset.user.firstname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">User Lastname</label>
                    <input
                      type="text"
                      name="user.lastname"
                      className="form-control"
                      value={editingAsset.user.lastname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Department Manager Firstname</label>
                    <input
                      type="text"
                      name="departmentManager.firstname"
                      className="form-control"
                      value={editingAsset.departmentManager.firstname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Department Manager Lastname</label>
                    <input
                      type="text"
                      name="departmentManager.lastname"
                      className="form-control"
                      value={editingAsset.departmentManager.lastname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      value={editingAsset.category}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Crudepage;
