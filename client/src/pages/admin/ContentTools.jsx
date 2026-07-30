import { useEffect, useState } from "react";
import api from "../../api/client.js";

const GROUPS = ["assistants", "agentic", "foundation"];

export default function ContentTools() {
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState({ name: "", slug: "", group: "assistants", description: "" });
  const [newCategory, setNewCategory] = useState({});

  async function load() {
    const { data } = await api.get("/content/tools");
    setTools(data.tools);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTool(e) {
    e.preventDefault();
    if (!newTool.name || !newTool.slug) return;
    await api.post("/admin/tools", newTool);
    setNewTool({ name: "", slug: "", group: "assistants", description: "" });
    load();
  }

  async function deleteTool(id) {
    if (!confirm("Delete this tool and all of its categories & questions?")) return;
    await api.delete(`/admin/tools/${id}`);
    load();
  }

  async function addCategory(toolId) {
    const name = newCategory[toolId];
    if (!name) return;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await api.post("/admin/categories", { tool: toolId, name, slug });
    setNewCategory((prev) => ({ ...prev, [toolId]: "" }));
    load();
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category and all of its questions?")) return;
    await api.delete(`/admin/categories/${id}`);
    load();
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Content — Tools & Categories</h2>

      <form onSubmit={addTool} className="card" style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Tool name (e.g. Perplexity)" value={newTool.name} onChange={(e) => setNewTool({ ...newTool, name: e.target.value })} />
        <input placeholder="slug (e.g. perplexity)" value={newTool.slug} onChange={(e) => setNewTool({ ...newTool, slug: e.target.value })} />
        <select value={newTool.group} onChange={(e) => setNewTool({ ...newTool, group: e.target.value })}>
          {GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input placeholder="Description" value={newTool.description} onChange={(e) => setNewTool({ ...newTool, description: e.target.value })} style={{ flex: 1, minWidth: 160 }} />
        <button className="btn btn-primary">Add Tool</button>
      </form>

      {tools.map((tool) => (
        <div key={tool.id} className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b>{tool.name}</b> <span style={{ color: "var(--muted)", fontSize: 12.5 }}>· {tool.group} · /{tool.slug}</span>
            </div>
            <button className="btn btn-ghost" onClick={() => deleteTool(tool.id)}>Delete Tool</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {tool.categories.map((cat) => (
              <span key={cat.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 10px", borderRadius: 8, background: "var(--paper)", border: "1px solid var(--line)" }}>
                {cat.name} <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{cat.questionCount}</span>
                <button onClick={() => deleteCategory(cat.id)} style={{ all: "unset", cursor: "pointer", color: "var(--locked)", fontWeight: 700 }}>×</button>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              placeholder="New category name"
              value={newCategory[tool.id] || ""}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, [tool.id]: e.target.value }))}
            />
            <button className="btn btn-ghost" onClick={() => addCategory(tool.id)}>Add Category</button>
          </div>
        </div>
      ))}
    </div>
  );
}
