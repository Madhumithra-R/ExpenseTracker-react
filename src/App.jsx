import { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"];

const CAT_STYLES = {
  Food:          { bg: "#FFF3E0", color: "#633806" },
  Transport:     { bg: "#E3F2FD", color: "#0C447C" },
  Shopping:      { bg: "#F3E5F5", color: "#6A1B9A" },
  Bills:         { bg: "#FFEBEE", color: "#A32D2D" },
  Health:        { bg: "#E8F5E9", color: "#27500A" },
  Entertainment: { bg: "#FFF8E1", color: "#633806" },
  Other:         { bg: "#F1EFE8", color: "#5F5E5A" },
};

function CategoryBadge({ cat }) {
  const s = CAT_STYLES[cat] || CAT_STYLES.Other;
  return (
    <span className="cat-badge" style={{ background: s.bg, color: s.color }}>
      {cat}
    </span>
  );
}

function ExpenseItem({ expense, onDelete }) {
  const date = new Date(expense.ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
  return (
    <div className="item">
      <CategoryBadge cat={expense.cat} />
      <div className="item-info">
        <div className="item-title">{expense.title}</div>
        <div className="item-date">{date}</div>
      </div>
      <div className="item-amt">₹{Number(expense.amount).toFixed(2)}</div>
      <button className="del-btn" onClick={() => onDelete(expense.id)}>✕</button>
    </div>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xp2") || "[]"); }
    catch { return []; }
  });
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("Food");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState(false);

  useEffect(() => {
    localStorage.setItem("xp2", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) { setError(true); return; }
    setError(false);
    setExpenses(prev => [
      ...prev,
      { id: Date.now().toString(), title: title.trim(), amount: amt, cat, ts: Date.now() }
    ]);
    setTitle(""); setAmount("");
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const clearAll = () => {
    if (window.confirm("Clear all expenses?")) setExpenses([]);
  };

  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.ts);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0);
  const filtered = filter === "All" ? expenses : expenses.filter(e => e.cat === filter);

  return (
    <div className="app">
      <div className="top-header">
        <div className="app-icon">₹</div>
        <div>
          <div className="app-title">Expense Tracker</div>
          <div className="app-sub">Stay on top of your spending</div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="sum-card total">
          <div className="sum-label">Total Spent</div>
          <div className="sum-value">₹{total.toFixed(2)}</div>
        </div>
        <div className="sum-card month">
          <div className="sum-label">This Month</div>
          <div className="sum-value">₹{monthTotal.toFixed(2)}</div>
        </div>
        <div className="sum-card count-card">
          <div className="sum-label">Entries</div>
          <div className="sum-value">{expenses.length}</div>
        </div>
      </div>

      <div className="form-wrap">
        <div className="form-row">
          <div className="field full">
            <label>Title</label>
            <input
              type="text" placeholder="e.g. Groceries, Uber…" maxLength={50}
              value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addExpense()}
            />
          </div>
          <div className="field">
            <label>Amount (₹)</label>
            <input
              type="number" placeholder="0.00" min="0" step="0.01"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addExpense()}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="err-msg">Please enter a title and a valid amount.</p>}
        <button className="add-btn" onClick={addExpense}>+ Add Expense</button>
      </div>

      <div className="cat-chips">
        {["All", ...CATEGORIES].map(c => {
          const s = CAT_STYLES[c] || { bg: "#E3F2FD", color: "#0C447C" };
          const active = filter === c;
          return (
            <button
              key={c}
              className={`chip${active ? " active" : ""}`}
              style={active ? {
                background: c === "All" ? "#6C63FF" : s.bg,
                color: c === "All" ? "#fff" : s.color,
                borderColor: c === "All" ? "#6C63FF" : s.color,
              } : {}}
              onClick={() => setFilter(c)}
            >{c}</button>
          );
        })}
      </div>

      <div className="sec-row">
        <span className="sec-label">Recent expenses</span>
        <button className="clear-btn" onClick={clearAll}>Clear all</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {expenses.length === 0
            ? "No expenses yet — add your first one above!"
            : "No expenses in this category."}
        </div>
      ) : (
        <div className="list">
          {[...filtered].reverse().map(e => (
            <ExpenseItem key={e.id} expense={e} onDelete={deleteExpense} />
          ))}
        </div>
      )}
    </div>
  );
}