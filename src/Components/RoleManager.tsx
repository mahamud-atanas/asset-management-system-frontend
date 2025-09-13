import { useEffect, useMemo, useState } from "react";
import axios, { Method } from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Auth/authContext";

type Role = "user" | "admin" | "superadmin" | string;

type UserRow = {
  _id: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role: Role;
  createdAt?: string;
};

const API = "http://asset-backend-1976da1bf0ad.herokuapp";

// ---- LocalStorage keys for runtime override (no rebuild needed)
const LS_URL_KEY = "roleUpdate.url";
const LS_METHOD_KEY = "roleUpdate.method";

const defaultUrl =
  (import.meta.env.VITE_ROLE_UPDATE_URL as string) || `${API}/api/users/updateRole`;
const defaultMethod =
  ((import.meta.env.VITE_ROLE_UPDATE_METHOD as string) || "PATCH").toUpperCase();

export default function RoleManager() {
  const { user: me, isAuthenticated } = useAuth();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, Role>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // CLIENT-SIDE pagination state (AdminLTE-friendly)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // runtime-configurable endpoint/method (env -> localStorage -> defaults)
  const [updateUrl, setUpdateUrl] = useState(
    localStorage.getItem(LS_URL_KEY) || defaultUrl
  );
  const [updateMethod, setUpdateMethod] = useState<Method>(
    (localStorage.getItem(LS_METHOD_KEY) as Method) || (defaultMethod as Method)
  );

  useEffect(() => {
    localStorage.setItem(LS_URL_KEY, updateUrl);
  }, [updateUrl]);
  useEffect(() => {
    localStorage.setItem(LS_METHOD_KEY, updateMethod as string);
  }, [updateMethod]);

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const roleOptions = useMemo(() => {
    const set = new Set<Role>(["user", "admin", "superadmin"]);
    rows.forEach((u) => u.role && set.add(u.role));
    return Array.from(set);
  }, [rows]);

  // ------- Fetch ALL users once (no server pagination) -------
  async function fetchUsersOnce() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/users`, {
        headers: { "x-auth-token": token },
        validateStatus: () => true,
      });
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Failed to load users");
      }
      // If server returns array or wrapper, normalize to array
      const payload = res.data;
      const list: UserRow[] = Array.isArray(payload) ? payload : payload?.data || [];
      setRows(list);
      // reset pagination if current page overflows new data
      setPage(1);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated() || !me || (me.role !== "admin" && me.role !== "superadmin")) {
      toast.error("Not authorized");
      setLoading(false);
      return;
    }
    fetchUsersOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, me]);

  // ------- Client-side pagination helpers -------
  const total = rows.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  // ensure page is in bounds whenever dependencies change
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const setLocalRole = (id: string, role: Role) =>
    setEditing((prev) => ({ ...prev, [id]: role }));

  async function updateRoleRequest(userId: string, role: Role) {
    const headers = { "Content-Type": "application/json", "x-auth-token": token };
    const url =
      updateUrl.includes(":id") || updateUrl.includes("{id}")
        ? updateUrl.replace(":id", userId).replace("{id}", userId)
        : updateUrl;
    const body = { role: String(role).toLowerCase(), userId, id: userId, _id: userId };

    const res = await axios.request({
      method: updateMethod,
      url,
      data: body,
      headers,
      validateStatus: () => true,
    });

    if (![200, 201, 204].includes(res.status)) {
      throw new Error(
        res.data?.message ||
          res.data?.error ||
          `${res.status} ${res.statusText} — ${updateMethod} ${url}`
      );
    }
  }

  const saveRole = async (id: string, role: Role) => {
    setSavingId(id);
    if (id === me?._id && role === "user") {
      toast.warn("You cannot downgrade your own account here.");
      setSavingId(null);
      return;
    }
    try {
      await updateRoleRequest(id, role);
      setRows((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: String(role).toLowerCase() } : u))
      );
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role. Check server route.");
    } finally {
      setSavingId(null);
    }
  };

  const unassignToUser = async (id: string, currentRole: Role) => {
    if (currentRole === "user") return;
    await saveRole(id, "user");
    setEditing((prev) => ({ ...prev, [id]: "user" }));
  };

  if (loading) {
    return (
      <section className="content">
        <div className="container-fluid">
          <div className="card card-outline card-warning">
            <div className="card-body">Loading users…</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content">
      <div className="container-fluid">
        <div className="card card-outline card-warning">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
            <h3 className="card-title mb-2">Role Management</h3>

            {/* Inline endpoint config */}
            <div className="d-flex align-items-center gap-2 mb-2" style={{ maxWidth: 700 }}>
              <select
                className="form-control form-control-sm mr-2"
                style={{ maxWidth: 120 }}
                value={updateMethod}
                onChange={(e) => setUpdateMethod(e.target.value as Method)}
              >
                <option>PATCH</option>
                <option>PUT</option>
                <option>POST</option>
              </select>
              <input
                className="form-control form-control-sm mr-2"
                placeholder="Update role URL (e.g. /api/users/:id/role)"
                value={updateUrl}
                onChange={(e) => setUpdateUrl(e.target.value)}
              />
              <small className="text-muted ml-2">
                Use <code>:id</code> or <code>{'{id}'}</code> for user id in the path,
                or leave it out if your API takes the id in the body.
              </small>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Names</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th style={{ width: 380 }}>Set Role</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((u, idx) => {
                    const pendingRole = editing[u._id] ?? u.role;
                    const saving = savingId === u._id;
                    const names = [u.firstname, u.lastname].filter(Boolean).join(" ") || "—";
                    const isSelf = u._id === me?._id;
                    const rowNumber = (page - 1) * pageSize + (idx + 1);

                    return (
                      <tr key={u._id} className={idx % 2 ? "bg-light" : ""}>
                        <td>{rowNumber}</td>
                        <td>{names}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge badge-secondary text-uppercase">
                            {String(u.role).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className="form-control form-control-sm mr-2"
                              value={pendingRole}
                              onChange={(e) => setLocalRole(u._id, e.target.value)}
                              disabled={saving}
                              style={{ maxWidth: 180 }}
                            >
                              {roleOptions.map((r) => (
                                <option key={r} value={r}>
                                  {String(r).charAt(0).toUpperCase() + String(r).slice(1)}
                                </option>
                              ))}
                            </select>

                            <button
                              className="btn btn-primary btn-sm mr-2"
                              onClick={() => saveRole(u._id, pendingRole)}
                              disabled={saving || pendingRole === u.role}
                              title="Save selected role"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>

                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => unassignToUser(u._id, u.role)}
                              disabled={saving || u.role === "user" || isSelf}
                              title={isSelf ? "Cannot unassign your own role here" : "Set role to 'user'"}
                            >
                              Unassign
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pagedRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AdminLTE-style footer with rows-per-page + pagination */}
          <div className="card-footer d-flex flex-wrap justify-content-between align-items-center">
            {/* Left: rows per page + info */}
            <div className="d-flex align-items-center">
              <label className="mb-0 mr-2 text-muted">Rows per page:</label>
              <select
                className="form-control form-control-sm"
                style={{ width: 90 }}
                value={pageSize}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  setPageSize(next);
                  setPage(1); // reset to first page when size changes
                }}
              >
                {[5, 10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <small className="text-muted ml-3">
                {total > 0
                  ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`
                  : "0"}
              </small>
            </div>

            {/* Right: pagination */}
            <nav aria-label="User pagination" className="ml-auto">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    aria-label="Previous"
                  >
                    &laquo;
                  </button>
                </li>

                {/* compact window of pages */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const num = idx + 1;

                  // show first, last, current, and neighbors; hide others for compactness
                  const isEdge = num === 1 || num === totalPages;
                  const isNear = Math.abs(num - page) <= 1;
                  const shouldShow = isEdge || isNear;

                  if (!shouldShow) {
                    // show ellipsis once per gap
                    const showLeftDots = num === 2 && page > 3;
                    const showRightDots = num === totalPages - 1 && page < totalPages - 2;
                    if (showLeftDots || showRightDots) {
                      return (
                        <li key={`dots-${num}`} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      );
                    }
                    return null;
                  }

                  return (
                    <li key={num} className={`page-item ${num === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(num)}>
                        {num}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    aria-label="Next"
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="card-footer">
            <small className="text-muted">
              Configure your server route above. Examples:
              <code> PATCH /api/users/:id/role</code>, <code>PUT /api/users/:id</code>,
              <code> POST /api/users/role</code>. The id is also sent in body (<code>_id</code>/<code>id</code>/<code>userId</code>).
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
