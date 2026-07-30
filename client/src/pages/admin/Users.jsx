import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  async function load() {
    const { data } = await api.get("/admin/users", { params: { search } });
    setUsers(data.users);
    setTotal(data.total);
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function updateField(id, field, value) {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, [field]: value } : u)));
    await api.patch(`/admin/users/${id}`, { [field]: value });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Users ({total})</h2>
        <input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Name", "Email", "Plan", "Role", "Status", "Joined"].map((h) => (
              <th key={h} style={{ textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{u.name}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{u.email}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                <select value={u.plan} onChange={(e) => updateField(u._id, "plan", e.target.value)}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                <select value={u.role} onChange={(e) => updateField(u._id, "role", e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                <select value={u.status} onChange={(e) => updateField(u._id, "status", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 16, color: "var(--muted)" }}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
