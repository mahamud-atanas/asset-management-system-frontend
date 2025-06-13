import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Asset {
  _id: string;
  tagNumber: string;
  itemDescription: string;
  department: string;
  invoiceNumber?: string;
  category: string;
  dateOfRegister: string;
  departmentManager?: { _id: string; firstname: string; lastname: string };
  user?: { _id: string; firstname: string; lastname: string };
  quantity: number;
  costPerItem: number;
  totalAmount: number;
  depreciationRate: number;
  usefulLifeMonths: number;
  numberOfMonthsInUse: number;
  numberOfRemainingMonths: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  assetCondition: string;
  physicalLocation: string;
  __v?: number;
}





const ReportPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await axios.get("http://localhost:3000/api/asset", {
        headers: { "x-auth-token": token },
      });

      setAssets(response.data);
      setFilteredAssets(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => dateString.split("T")[0];

  useEffect(() => {
    let result = assets.filter((asset: Asset) => {
      const assetDate = formatDate(asset.dateOfRegister);
      return (
        (categoryFilter === "All" || asset.category === categoryFilter) &&
        (departmentFilter === "All" || asset.department === departmentFilter) &&
        (startDate === "" || assetDate >= startDate) &&
        (endDate === "" || assetDate <= endDate) &&
        Object.values(asset).join(" ").toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredAssets(result);
  }, [search, categoryFilter, departmentFilter, startDate, endDate, assets]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      await axios.delete(`http://localhost:3000/api/asset/${id}`, {
        headers: { "x-auth-token": token },
      });
      
      toast.success("Asset deleted successfully!");
      fetchAssets(); // Refresh the table
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset.");
    }
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };


  const handleUpdate = async () => {
    try {
        if (!selectedAsset) return;

        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found. Please log in again.");
        }

        // Ensure departmentManager is only sending the ID
        const { _id, __v, departmentManager, user, ...assetData } = selectedAsset;

        const updatedAsset = {
            ...assetData,
            departmentManager: departmentManager?._id || "",  // Send only the ID
            user: user?._id || ""  // If user is also required as a string
        };

        await axios.put(`http://localhost:3000/api/asset/${_id}`, updatedAsset, {
            headers: { "x-auth-token": token },
        });

        fetchAssets(); // Refresh the table
        setShowModal(false);
        toast.success("Asset updated successfully!");
    } catch (error) {
        console.error("Error updating asset:", error);
        toast.error("Failed to update asset.");
    }
};

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!selectedAsset) return;
    setSelectedAsset({ ...selectedAsset, [e.target.name]: e.target.value });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Full Asset Report", 14, 10);
  
    autoTable(doc, {
      head: [[
        "Tag","Invoice", "Desc", "Dept", "Cat", "Qty", "Cost", "Total",
        "Dep %", "Life (mo)", "Used (mo)", "Remain (mo)", "Monthly Dep.", "Accum. Dep.",
        "Condition", "Location", "Manager", "User", "Date"
      ]],
      body: assets.map((asset) => [
        asset.tagNumber,
        asset.invoiceNumber || "N/A",
        asset.itemDescription,
        asset.department,
        asset.category,
        asset.quantity,
        asset.costPerItem,
        asset.totalAmount,
        asset.depreciationRate,
        asset.usefulLifeMonths,
        asset.numberOfMonthsInUse,
        asset.numberOfRemainingMonths,
        asset.monthlyDepreciation,
        asset.accumulatedDepreciation,
        asset.assetCondition,
        asset.physicalLocation,
        asset.departmentManager ? `${asset.departmentManager.firstname} ${asset.departmentManager.lastname}` : "N/A",
        asset.user ? `${asset.user.firstname} ${asset.user.lastname}` : "N/A",
        formatDate(asset.dateOfRegister),
      ])
    });
  
    doc.save("Full_Asset_Report.pdf");
  };
  

  

  const columns = [
    { name: "Tag Number", selector: (row: Asset) => row.tagNumber, sortable: true },
    { name: "Invoice Number", selector: (row: Asset) => row.invoiceNumber || "N/A", sortable: true },
    { name: "Description", selector: (row: Asset) => row.itemDescription, sortable: true },
    { name: "Department", selector: (row: Asset) => row.department, sortable: true },
    { name: "Category", selector: (row: Asset) => row.category, sortable: true },
    { name: "Date Registered", selector: (row: Asset) => formatDate(row.dateOfRegister), sortable: true },
    {
      name: "Actions",
      cell: (row: Asset) => (
        <div className="d-flex justify-content-center">
          <button className="btn btn-warning btn-sm mx-1" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDelete(row._id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Asset Report</h2>

      <div className="row mb-3">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="col-md-3">
          <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {[...new Set(assets.map((asset: Asset) => asset.category))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select className="form-control" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {[...new Set(assets.map((asset: Asset) => asset.department))].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="col-md-3 mt-2">
          <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {loading && <div className="spinner-border text-primary"></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <DataTable columns={columns} data={filteredAssets} pagination highlightOnHover striped responsive fixedHeader />
      )}

      <div className="mt-3">
        <button className="btn btn-danger mr-2" onClick={generatePDF}>
          Export as PDF
        </button>
        <CSVLink
  data={assets.map((asset) => ({
    "Tag Number": asset.tagNumber,
    "Description": asset.itemDescription,
    "Department": asset.department,
    "Category": asset.category,
    "Quantity": asset.quantity,
    "Cost Per Item": asset.costPerItem,
    "Total Amount": asset.totalAmount,
    "Depreciation Rate": asset.depreciationRate,
    "Useful Life (Months)": asset.usefulLifeMonths,
    "Months in Use": asset.numberOfMonthsInUse,
    "Remaining Months": asset.numberOfRemainingMonths,
    "Monthly Depreciation": asset.monthlyDepreciation,
    "Accumulated Depreciation": asset.accumulatedDepreciation,
    "Condition": asset.assetCondition,
    "Location": asset.physicalLocation,
    "Department Manager": asset.departmentManager ? `${asset.departmentManager.firstname} ${asset.departmentManager.lastname}` : "N/A",
    "Assigned User": asset.user ? `${asset.user.firstname} ${asset.user.lastname}` : "N/A",
    "Date Registered": formatDate(asset.dateOfRegister),
  }))}
  filename="Full_Asset_Report.csv"
  className="btn btn-success"
>
  Export Full CSV
</CSVLink>


      </div>

      {showModal && selectedAsset && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Tag Number</label>
                    <input type="text" name="tagNumber" value={selectedAsset.tagNumber} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input type="text" name="itemDescription" value={selectedAsset.itemDescription} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input type="text" name="department" value={selectedAsset.department} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date"name="dateOfRegister" value={selectedAsset?.dateOfRegister?.split("T")[0] || ""}onChange={handleChange}className="form-control"/>
                  </div>
                  <div className="mb-3"><label className="form-label">Category</label>
                    <input type="text" name="category" value={selectedAsset.category} onChange={handleChange} className="form-control" />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;