import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const ViewAssets: React.FC = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
        }

        const response = await axios.get("http://localhost:3000/api/asset", {
          headers: {
            "x-auth-token": token,
          },
        });
        setAssets(response.data);
        setFilteredAssets(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  useEffect(() => {
    const result = assets.filter((asset: any) => {
      return Object.values(asset).join(" ").toLowerCase().includes(search.toLowerCase());
    });
    setFilteredAssets(result);
  }, [search, assets]);

  const columns = [
    {
      name: "Tag Number",
      selector: (row: any) => row.tagNumber,
      sortable: true,
      cell: (row: any) => (
        <span title={row.tagNumber} style={{ cursor: "pointer" }}>
          {truncateText(row.tagNumber, 10)}
        </span>
      ),
    },
    {
      name: "Invoice Number",
      selector: (row: any) => row.invoiceNumber,
      sortable: true,
      cell: (row: any) => (
        <span title={row.invoiceNumber} style={{ cursor: "pointer" }}>
          {truncateText(row.invoiceNumber || "N/A", 15)}
        </span>
      ),
    },
    {
      name: "Date of Register",
      selector: (row: any) => formatDate(row.dateOfRegister),
      sortable: true,
      cell: (row: any) => (
        <span title={formatDate(row.dateOfRegister)} style={{ cursor: "pointer" }}>
          {formatDate(row.dateOfRegister)}
        </span>
      ),
    },
    {
      name: "Description",
      selector: (row: any) => row.itemDescription,
      sortable: true,
      cell: (row: any) => (
        <span title={row.itemDescription} style={{ cursor: "pointer" }}>
          {truncateText(row.itemDescription, 20)}
        </span>
      ),
    },
    {
      name: "Department",
      selector: (row: any) => row.department,
      sortable: true,
      cell: (row: any) => (
        <span title={row.department} style={{ cursor: "pointer" }}>
          {truncateText(row.department, 15)}
        </span>
      ),
    },
    {
      name: "Physical Location",
      selector: (row: any) => row.physicalLocation,
      sortable: true,
      cell: (row: any) => (
        <span title={row.physicalLocation} style={{ cursor: "pointer" }}>
          {truncateText(row.physicalLocation, 15)}
        </span>
      ),
    },
    {
      name: "Condition",
      selector: (row: any) => row.assetCondition,
      sortable: true,
      cell: (row: any) => (
        <span title={row.assetCondition} style={{ cursor: "pointer" }}>
          {row.assetCondition}
        </span>
      ),
    },
    {
      name: "Quantity",
      selector: (row: any) => row.quantity,
      sortable: true,
      cell: (row: any) => (
        <span title={row.quantity} style={{ cursor: "pointer" }}>
          {row.quantity}
        </span>
      ),
    },
    {
      name: "Category",
      selector: (row: any) => row.category,
      sortable: true,
      cell: (row: any) => (
        <span title={row.category} style={{ cursor: "pointer" }}>
          {truncateText(row.category, 15)}
        </span>
      ),
    },
    {
      name: "Cost Per Item",
      selector: (row: any) => row.costPerItem,
      sortable: true,
      cell: (row: any) => (
        <span title={row.costPerItem.toString()} style={{ cursor: "pointer" }}>
          {truncateText(row.costPerItem.toString(), 10)}
        </span>
      ),
    },
    {
      name: "Total Amount",
      selector: (row: any) => row.totalAmount,
      sortable: true,
      cell: (row: any) => (
        <span title={row.totalAmount.toString()} style={{ cursor: "pointer" }}>
          {truncateText(row.totalAmount.toString(), 10)}
        </span>
      ),
    },
    {
      name: "Depreciation Rate",
      selector: (row: any) => `${row.depreciationRate}%`,
      sortable: true,
      cell: (row: any) => (
        <span title={`${row.depreciationRate}%`} style={{ cursor: "pointer" }}>
          {row.depreciationRate}%
        </span>
      ),
    },
    { name: "Useful Life (Months)", selector: (row: any) => row.usefulLifeMonths, sortable: true },
    { name: "Months in Use", selector: (row: any) => row.numberOfMonthsInUse, sortable: true },
    { name: "Remaining Months", selector: (row: any) => row.numberOfRemainingMonths, sortable: true },
    { name: "Monthly Depreciation", selector: (row: any) => row.monthlyDepreciation, sortable: true },
    { name: "Accumulated Depreciation", selector: (row: any) => row.accumulatedDepreciation, sortable: true },
    {
      name: "Department Manager",
      selector: (row: any) => row.departmentManager?.firstname + " " + row.departmentManager?.lastname || "N/A",
      sortable: true,
      cell: (row: any) => (
        <span title={row.departmentManager?.firstname} style={{ cursor: "pointer" }}>
          {truncateText(row.departmentManager?.firstname + " " + row.departmentManager?.lastname, 15)}
        </span>
      ),
    },
    {
      name: "User",
      selector: (row: any) => row.user?.firstname + " " + row.user?.lastname || "N/A",
      sortable: true,
      cell: (row: any) => (
        <span title={row.user?.firstname} style={{ cursor: "pointer" }}>
          {truncateText(row.user?.firstname + " " + row.user?.lastname, 15)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="container mt-5">
        <h2 className="mb-4">Asset List</h2>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && (
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={filteredAssets}
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

export default ViewAssets;
