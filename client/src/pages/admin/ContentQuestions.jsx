import { useEffect, useState } from "react";
import api from "../../api/client.js";

const EMPTY_FORM = { tool: "", category: "", question: "", answer: "", difficulty: "easy" };

export default function ContentQuestions() {
  const [tools, setTools] = useState([]);
  const [filterTool, setFilterTool] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get("/content/tools").then(({ data }) => setTools(data.tools));
  }, []);

  async function loadQuestions() {
    const params = {};
    if (filterTool) params.tool = filterTool;
    if (filterCategory) params.category = filterCategory;
    const { data } = await api.get("/admin/questions", { params });
    setQuestions(data.questions);
    setTotal(data.total);
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTool, filterCategory]);

  const filterCategories = tools.find((t) => t.id === filterTool)?.categories || [];
  const formCategories = tools.find((t) => t.id === form.tool)?.categories || [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.tool || !form.category || !form.question || !form.answer) return;
    if (editingId) {
      await api.patch(`/admin/questions/${editingId}`, form);
    } else {
      await api.post("/admin/questions", form);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    loadQuestions();
  }

  function startEdit(q) {
    setEditingId(q._id);
    setForm({ tool: q.tool._id, category: q.category._id, question: q.question, answer: q.answer, difficulty: q.difficulty });
  }

  async function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/admin/questions/${id}`);
    loadQuestions();
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Content — Questions ({total})</h2>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={form.tool} onChange={(e) => setForm({ ...form, tool: e.target.value, category: "" })} required>
            <option value="">Select tool…</option>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required disabled={!form.tool}>
            <option value="">Select category…</option>
            {formCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="easy">Easy · Free</option>
            <option value="medium">Medium · Pro</option>
            <option value="hard">Hard · Premium</option>
          </select>
        </div>
        <input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
        <textarea placeholder="Answer" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary">{editingId ? "Save Changes" : "Add Question"}</button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <select value={filterTool} onChange={(e) => { setFilterTool(e.target.value); setFilterCategory(""); }}>
          <option value="">All tools</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} disabled={!filterTool}>
          <option value="">All categories</option>
          {filterCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Question", "Tool / Category", "Difficulty", ""].map((h) => (
              <th key={h} style={{ textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", maxWidth: 340 }}>{q.question}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                {q.tool?.name} / {q.category?.name}
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>{q.difficulty}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => startEdit(q)}>Edit</button>{" "}
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12, color: "var(--locked)" }} onClick={() => deleteQuestion(q._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 16, color: "var(--muted)" }}>No questions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
