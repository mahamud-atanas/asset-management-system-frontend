import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useAuth } from "../Auth/authContext";

const API = "https://asset-backend-1976da1bf0ad.herokuapp.com";

type Scope = "all" | "mine";

const ViewAssets: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? "user";
  const userId = user?._id ?? "";

  // users are always "mine"; admins/superadmins can toggle
  const [scope, setScope] = useState<Scope>(role === "user" ? "mine" : "all");

  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // when role changes (e.g., after login), reset default scope
  useEffect(() => {
    setScope(role === "user" ? "mine" : "all");
  }, [role]);

  const title = useMemo(() => {
    if (role === "user") return "My Assets";
    return scope === "mine" ? "My Assets" : "Asset List";
  }, [role, scope]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in again.");

        // Build URL: users always mine; admins can toggle mine/all
        let url = `${API}/api/asset`;
        const shouldFilterMine = role === "user" || scope === "mine";
        if (shouldFilterMine && userId) {
          url += `?ownerId=${encodeURIComponent(userId)}`;
        }

        const { data } = await axios.get(url, {
          headers: { "x-auth-token": token },
        });
        setAssets(data ?? []);
        setFilteredAssets(data ?? []);
      } catch (err: any) {
        setError(err?.message || "Failed to load assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [role, scope, userId]);

  const formatDate = (dateString: string) => (dateString ? dateString.split("T")[0] : "");
  const truncateText = (text: string, maxLength: number) =>
    text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  useEffect(() => {
    const term = search.toLowerCase();
    const result = assets.filter((asset: any) =>
      Object.values(asset).join(" ").toLowerCase().includes(term)
    );
    setFilteredAssets(result);
  }, [search, assets]);

  const columns = [
    { name: "Tag Number", selector: (row: any) => row.tagNumber, sortable: true,
      cell: (row: any) => <span title={row.tagNumber}>{truncateText(row.tagNumber, 10)}</span> },
    { name: "Invoice Num.", selector: (row: any) => row.invoiceNumber, sortable: true,
      cell: (row: any) => <span title={row.invoiceNumber || "N/A"}>{truncateText(row.invoiceNumber || "N/A", 15)}</span> },
    { name: "Date of Register", selector: (row: any) => formatDate(row.dateOfRegister), sortable: true,
      cell: (row: any) => <span title={formatDate(row.dateOfRegister)}>{formatDate(row.dateOfRegister)}</span> },
    { name: "Description", selector: (row: any) => row.itemDescription, sortable: true,
      cell: (row: any) => <span title={row.itemDescription}>{truncateText(row.itemDescription, 20)}</span> },
    { name: "Department", selector: (row: any) => row.department, sortable: true,
      cell: (row: any) => <span title={row.department}>{truncateText(row.department, 15)}</span> },
    { name: "Physical Location", selector: (row: any) => row.physicalLocation, sortable: true,
      cell: (row: any) => <span title={row.physicalLocation}>{truncateText(row.physicalLocation, 15)}</span> },
    { name: "Condition", selector: (row: any) => row.assetCondition, sortable: true,
      cell: (row: any) => <span title={row.assetCondition}>{row.assetCondition}</span> },
    { name: "Quantity", selector: (row: any) => row.quantity, sortable: true,
      cell: (row: any) => <span title={row.quantity}>{row.quantity}</span> },
    { name: "Category", selector: (row: any) => row.category, sortable: true,
      cell: (row: any) => <span title={row.category}>{truncateText(row.category, 15)}</span> },
    { name: "Cost Per Item", selector: (row: any) => row.costPerItem, sortable: true,
      cell: (row: any) => <span title={String(row.costPerItem)}>{truncateText(String(row.costPerItem), 10)}</span> },
    { name: "Total Amount", selector: (row: any) => row.totalAmount, sortable: true,
      cell: (row: any) => <span title={String(row.totalAmount)}>{truncateText(String(row.totalAmount), 10)}</span> },
    { name: "Depreciation Rate", selector: (row: any) => `${row.depreciationRate}%`, sortable: true,
      cell: (row: any) => <span title={`${row.depreciationRate}%`}>{row.depreciationRate}%</span> },
    { name: "Useful Life (Months)", selector: (row: any) => row.usefulLifeMonths, sortable: true },
    { name: "Months in Use", selector: (row: any) => row.numberOfMonthsInUse, sortable: true },
    { name: "Remaining Months", selector: (row: any) => row.numberOfRemainingMonths, sortable: true },
    { name: "Monthly Depreciation", selector: (row: any) => row.monthlyDepreciation, sortable: true },
    { name: "Accumulated Depreciation", selector: (row: any) => row.accumulatedDepreciation, sortable: true },
    { name: "Department Manager", selector: (row: any) => row.departmentManager?.firstname + " " + row.departmentManager?.lastname || "N/A", sortable: true,
      cell: (row: any) => <span title={row.departmentManager?.firstname}>{truncateText(row.departmentManager?.firstname + " " + row.departmentManager?.lastname, 15)}</span> },
    { name: "User", selector: (row: any) => row.user?.firstname + " " + row.user?.lastname || "N/A", sortable: true,
      cell: (row: any) => <span title={row.user?.firstname}>{truncateText(row.user?.firstname + " " + row.user?.lastname, 15)}</span> },
  ];

  return (
    <div className="container mt-5">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="mb-4">{title}</h2>

        {/* Admin/Superadmin scope toggle */}
        {role !== "user" && (
          <div className="btn-group mb-3" role="group" aria-label="scope toggle">
            <button
              type="button"
              className={`btn ${scope === "all" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setScope("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${scope === "mine" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setScope("mine")}
              title="Show only assets assigned to me"
            >
              Only my assets
            </button>
          </div>
        )}
      </div>

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
  );
};

export default ViewAssets;
