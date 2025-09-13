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

const API = "https://asset-backend-1976da1bf0ad.herokuapp.com";

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

  useEffect(() => {
    if (!isAuthenticated() || !me || (me.role !== "admin" && me.role !== "superadmin")) {
      toast.error("Not authorized");
      return;
    }
    (async () => {
      try {
        const res = await axios.get<UserRow[]>(`${API}/api/users`, {
          headers: { "x-auth-token": token },
        });
        setRows(res.data || []);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, me, token]);

  const setLocalRole = (id: string, role: Role) =>
    setEditing((prev) => ({ ...prev, [id]: role }));

  async function updateRoleRequest(userId: string, role: Role) {
    const headers = { "Content-Type": "application/json", "x-auth-token": token };
    // Common server patterns: some expect path param, some expect body-only.
    // We’ll interpolate :id if present, else send id in body.
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
            {/* Small inline config so you can match your backend without code changes */}
            <div className="d-flex align-items-center gap-2 mb-2" style={{ maxWidth: 700 }}>
              <select
                className="form-control mr-2"
                style={{ maxWidth: 120 }}
                value={updateMethod}
                onChange={(e) => setUpdateMethod(e.target.value as Method)}
              >
                <option>PATCH</option>
                <option>PUT</option>
                <option>POST</option>
              </select>
              <input
                className="form-control mr-2"
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
                    <th>#</th>
                    <th>Names</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th style={{ width: 380 }}>Set Role</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => {
                    const pendingRole = editing[u._id] ?? u.role;
                    const saving = savingId === u._id;
                    const names = [u.firstname, u.lastname].filter(Boolean).join(" ") || "—";
                    const isSelf = u._id === me?._id;

                    return (
                      <tr key={u._id} className={idx % 2 ? "bg-light" : ""}>
                        <td>{idx + 1}</td>
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
                              className="form-control mr-2"
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
                              className="btn btn-primary mr-2"
                              onClick={() => saveRole(u._id, pendingRole)}
                              disabled={saving || pendingRole === u.role}
                              title="Save selected role"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>

                            <button
                              className="btn btn-outline-secondary"
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
                  {rows.length === 0 && (
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

          <div className="card-footer">
            <small className="text-muted">
              Configure your server route above. Examples:
              <code>PATCH /api/users/:id/role</code>, <code>PUT /api/users/:id</code>,
              <code>POST /api/users/role</code>. The id is sent in body too (<code>_id</code>/<code>id</code>/<code>userId</code>).
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
