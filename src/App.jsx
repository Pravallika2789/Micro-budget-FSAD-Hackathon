  // ============================================================
  // Micro-Budget — Fintech-Grade Micro-Budgeting Dashboard
  // Full React SPA with Auth, Dashboard, Expenses, Goals
  // ============================================================

  import { useState, useEffect, useCallback, useMemo } from "react";

  // ─── Utility helpers ────────────────────────────────────────
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const pct = (v, t) => (t === 0 ? 0 : Math.min(100, Math.round((v / t) * 100)));

  const uid = () => Math.random().toString(36).slice(2, 9);

  const today = () => new Date().toISOString().split("T")[0];

  // ─── Seed Data ──────────────────────────────────────────────
  const SEED_EXPENSES = [
    { id: uid(), title: "Swiggy Order", category: "Food", amount: 420, date: "2026-03-27", notes: "Dinner" },
    { id: uid(), title: "Uber Ride", category: "Transport", amount: 180, date: "2026-03-26", notes: "" },
    { id: uid(), title: "Netflix", category: "Entertainment", amount: 649, date: "2026-03-25", notes: "Monthly sub" },
    { id: uid(), title: "Grocery", category: "Food", amount: 1200, date: "2026-03-24", notes: "Big Basket" },
    { id: uid(), title: "Electricity Bill", category: "Utilities", amount: 850, date: "2026-03-23", notes: "" },
    { id: uid(), title: "Gym Membership", category: "Health", amount: 1500, date: "2026-03-22", notes: "Monthly" },
    { id: uid(), title: "Coffee", category: "Food", amount: 160, date: "2026-03-21", notes: "Starbucks" },
    { id: uid(), title: "Books", category: "Education", amount: 499, date: "2026-03-20", notes: "" },
    { id: uid(), title: "Movie Tickets", category: "Entertainment", amount: 700, date: "2026-03-19", notes: "" },
    { id: uid(), title: "Medicine", category: "Health", amount: 340, date: "2026-03-18", notes: "" },
    { id: uid(), title: "Internet Bill", category: "Utilities", amount: 799, date: "2026-03-17", notes: "" },
    { id: uid(), title: "Zomato", category: "Food", amount: 380, date: "2026-03-16", notes: "" },
  ];

  const SEED_GOALS = [
    { id: uid(), title: "Emergency Fund", target: 50000, saved: 32000, deadline: "2026-08-01", icon: "🛡️" },
    { id: uid(), title: "Trip to Goa", target: 25000, saved: 10500, deadline: "2026-06-15", icon: "✈️" },
    { id: uid(), title: "New Laptop", target: 80000, saved: 45000, deadline: "2026-12-01", icon: "💻" },
  ];
  const FAMILY_USERS = [
  { id: 1, name: "Father", password: "1234" },
  { id: 2, name: "Mother", password: "1234" },
  { id: 3, name: "You", password: "1234" }
];

  const CATEGORIES = ["Food", "Transport", "Entertainment", "Utilities", "Health", "Education", "Shopping", "Other"];

  const CATEGORY_COLORS = {
    Food: "#4F46E5",
    Transport: "#06B6D4",
    Entertainment: "#8B5CF6",
    Utilities: "#F59E0B",
    Health: "#22C55E",
    Education: "#EC4899",
    Shopping: "#F97316",
    Other: "#6B7280",
  };

  const MONTHLY_DATA = [
    { month: "Oct", income: 52000, expense: 38000 },
    { month: "Nov", income: 52000, expense: 41000 },
    { month: "Dec", income: 60000, expense: 49000 },
    { month: "Jan", income: 52000, expense: 35000 },
    { month: "Feb", income: 52000, expense: 33000 },
    { month: "Mar", income: 52000, expense: 37677 },
  ];

  const BADGES_CONFIG = [
    { id: "saver", label: "Saver", icon: "🏦", desc: "Saved 20%+ this month", condition: (s) => s >= 20 },
    { id: "budget_master", label: "Budget Master", icon: "🎯", desc: "Stayed within budget", condition: (_, e, b) => e <= b },
    { id: "smart_spender", label: "Smart Spender", icon: "🧠", desc: "Spent less on non-essentials", condition: (_, e, b) => e <= b * 0.85 },
    { id: "streak", label: "7-Day Streak", icon: "🔥", desc: "Tracked expenses 7 days", condition: () => true },
  ];

  // ─── CSS via style tag injected once ──────────────────────
  const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    background: #F0F2F8;
    color: #111827;
    min-height: 100vh;
  }

  :root {
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --primary-dark: #3730A3;
    --cyan: #06B6D4;
    --cyan-light: #ECFEFF;
    --bg: #F0F2F8;
    --card: #FFFFFF;
    --text1: #111827;
    --text2: #6B7280;
    --text3: #9CA3AF;
    --success: #22C55E;
    --success-light: #DCFCE7;
    --warning: #F59E0B;
    --warning-light: #FEF3C7;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --border: #E5E7EB;
    --radius: 14px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.06);
    --shadow-lg: 0 4px 24px rgba(0,0,0,0.10);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }

  /* Animations */
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes progressFill { from { width: 0%; } to { width: var(--target-width); } }
  @keyframes toastIn { from { opacity:0; transform:translateY(16px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-in { animation: fadeIn 0.35s ease both; }
  .slide-in { animation: slideIn 0.3s ease both; }
  .scale-in { animation: scaleIn 0.25s ease both; }

  /* Card */
  .card {
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    border: 1px solid rgba(229,231,235,0.6);
  }

  /* Button base */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px; font-weight: 600;
    font-size: 14px; cursor: pointer; transition: all 0.18s ease;
    border: none; font-family: inherit;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--bg); color: var(--text1); }
  .btn-danger { background: var(--danger-light); color: var(--danger); border: 1px solid #FECACA; }
  .btn-danger:hover { background: #FECACA; }
  .btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
  .btn-icon { padding: 8px; border-radius: 8px; }

  /* Input */
  .input {
    width: 100%; padding: 10px 14px; border: 1.5px solid var(--border);
    border-radius: 10px; font-size: 14px; font-family: inherit;
    color: var(--text1); background: #FAFAFA; transition: border-color 0.15s;
    outline: none;
  }
  .input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px var(--primary-light); }
  .input::placeholder { color: var(--text3); }

  /* Select */
  select.input { cursor: pointer; }

  /* Label */
  .label {
    font-size: 12px; font-weight: 600; color: var(--text2);
    letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6px; display: block;
  }

  /* Form group */
  .form-group { display: flex; flex-direction: column; gap: 4px; }

  /* Badge */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  }
  .badge-success { background: var(--success-light); color: #15803D; }
  .badge-warning { background: var(--warning-light); color: #92400E; }
  .badge-danger { background: var(--danger-light); color: #B91C1C; }
  .badge-primary { background: var(--primary-light); color: var(--primary); }

  /* Progress bar */
  .progress-track {
    height: 8px; background: #F3F4F6; border-radius: 99px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.4,0,0.2,1);
  }

  /* Sidebar */
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--card);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; z-index: 50;
    box-shadow: 2px 0 16px rgba(0,0,0,0.04);
  }

  /* Main content */
  .main-content {
    margin-left: 240px; min-height: 100vh; padding: 28px 32px;
  }

  /* Nav item */
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: var(--text2);
    transition: all 0.15s ease; text-decoration: none; border: none;
    background: transparent; width: 100%; font-family: inherit;
  }
  .nav-item:hover { background: var(--bg); color: var(--text1); }
  .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
  .nav-item .nav-icon { font-size: 18px; width: 22px; text-align: center; }

  /* Stat card */
  .stat-card {
    background: var(--card); border-radius: var(--radius);
    padding: 20px 24px; box-shadow: var(--shadow); border: 1px solid rgba(229,231,235,0.6);
    position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 100px; height: 100px; border-radius: 50%;
    background: currentColor; opacity: 0.05;
  }

  /* Toast */
  .toast-container {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    display: flex; flex-direction: column; gap: 10px; pointer-events: none;
  }
  .toast {
    padding: 14px 18px; border-radius: 12px; font-size: 14px; font-weight: 500;
    box-shadow: var(--shadow-lg); pointer-events: all; display: flex; align-items: center; gap: 10px;
    animation: toastIn 0.3s ease both; backdrop-filter: blur(8px);
    max-width: 320px; min-width: 240px;
  }
  .toast-success { background: #fff; border-left: 4px solid var(--success); color: var(--text1); }
  .toast-error { background: #fff; border-left: 4px solid var(--danger); color: var(--text1); }
  .toast-warning { background: #fff; border-left: 4px solid var(--warning); color: var(--text1); }
  .toast-info { background: #fff; border-left: 4px solid var(--primary); color: var(--text1); }

  /* Modal overlay */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: var(--card); border-radius: 18px; padding: 28px;
    width: min(520px, calc(100vw - 40px)); box-shadow: var(--shadow-lg);
    animation: scaleIn 0.25s ease;
  }

  /* Category dot */
  .cat-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main-content { margin-left: 0; padding: 16px; }
  }

  /* Pie chart SVG tooltip area */
  .pie-segment { cursor: pointer; transition: opacity 0.15s; }
  .pie-segment:hover { opacity: 0.8; }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 48px 24px;
    color: var(--text3); font-size: 15px;
  }
  .empty-state .emoji { font-size: 40px; margin-bottom: 12px; }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  `;

  // ─── Inject styles once ──────────────────────────────────────
  function StyleProvider() {
    useEffect(() => {
      const el = document.createElement("style");
      el.textContent = STYLES;
      document.head.appendChild(el);
      return () => document.head.removeChild(el);
    }, []);
    return null;
  }

  // ─── Toast system ────────────────────────────────────────────
  function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = useCallback((msg, type = "info") => {
      const id = uid();
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    }, []);
    return { toasts, add };
  }

  function ToastContainer({ toasts }) {
    const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
    return (
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{icons[t.type]}</span>
            {t.msg}
          </div>
        ))}
      </div>
    );
  }

  // ─── Simple SVG Pie Chart ────────────────────────────────────
  function PieChart({ data }) {
    const [hovered, setHovered] = useState(null);
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <div className="empty-state"><div className="emoji">📊</div>No data yet</div>;

    let angle = -90;
    const slices = data.map((d) => {
      const sweep = (d.value / total) * 360;
      const start = angle;
      angle += sweep;
      return { ...d, start, sweep };
    });

    const polarToXY = (cx, cy, r, deg) => {
      const rad = (deg * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const describeArc = (cx, cy, r, start, sweep) => {
      if (sweep >= 360) sweep = 359.99;
      const s = polarToXY(cx, cy, r, start);
      const e = polarToXY(cx, cy, r, start + sweep);
      const large = sweep > 180 ? 1 : 0;
      return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`;
    };

    const cx = 110, cy = 110, r = 90, ir = 55;

    return (
      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <svg viewBox="0 0 220 220" style={{ width: 180, flexShrink: 0 }}>
          {slices.map((s) => (
            <path
              key={s.label}
              d={describeArc(cx, cy, r, s.start, s.sweep)}
              fill={s.color}
              opacity={hovered && hovered !== s.label ? 0.55 : 1}
              className="pie-segment"
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
              style={{ filter: hovered === s.label ? "brightness(1.08)" : "none" }}
            />
          ))}
          <circle cx={cx} cy={cy} r={ir} fill="white" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#6B7280" fontFamily="inherit">Total</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827" fontFamily="inherit">
            {fmt(total)}
          </text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {slices.map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8,
                background: hovered === s.label ? "#F9FAFB" : "transparent",
                cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="cat-dot" style={{ background: s.color }} />
              <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{fmt(s.value)}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", minWidth: 32, textAlign: "right" }}>
                {pct(s.value, total)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Simple SVG Bar Chart ────────────────────────────────────
  function BarChart({ data }) {
    const [hovered, setHovered] = useState(null);
    const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]));
    const H = 160, W = 360, barW = 18, gap = 8, groupW = barW * 2 + gap + 20;

    return (
      <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: "100%", maxWidth: W }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = H - t * H;
          return (
            <g key={t}>
              <line x1={28} x2={W - 8} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4,4" />
              <text x={24} y={y + 4} textAnchor="end" fontSize={9} fill="#9CA3AF" fontFamily="inherit">
                {Math.round(maxVal * t / 1000)}k
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = 32 + i * groupW;
          const incH = (d.income / maxVal) * H;
          const expH = (d.expense / maxVal) * H;
          const isH = hovered === i;
          return (
            <g key={d.month} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              <rect x={x} y={H - incH} width={barW} height={incH} fill="#4F46E5" rx={3}
                opacity={hovered !== null && !isH ? 0.4 : 1} />
              <rect x={x + barW + gap} y={H - expH} width={barW} height={expH} fill="#06B6D4" rx={3}
                opacity={hovered !== null && !isH ? 0.4 : 1} />
              <text x={x + barW + gap / 2} y={H + 14} textAnchor="middle" fontSize={10} fill="#6B7280" fontFamily="inherit">
                {d.month}
              </text>
              {isH && (
                <g>
                  <rect x={x - 4} y={H - incH - 28} width={80} height={22} rx={4} fill="#1F2937" />
                  <text x={x + 36} y={H - incH - 13} textAnchor="middle" fontSize={9} fill="white" fontFamily="inherit">
                    In: {fmt(d.income)} / Ex: {fmt(d.expense)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <g>
          <circle cx={32 + data.length * groupW + 4} cy={H + 12} r={5} fill="#4F46E5" />
          <text x={32 + data.length * groupW + 12} y={H + 16} fontSize={10} fill="#6B7280" fontFamily="inherit">Income</text>
          <circle cx={32 + data.length * groupW + 64} cy={H + 12} r={5} fill="#06B6D4" />
          <text x={32 + data.length * groupW + 72} y={H + 16} fontSize={10} fill="#6B7280" fontFamily="inherit">Expense</text>
        </g>
      </svg>
    );
  }

  // ─── Mini sparkline ──────────────────────────────────────────
  function Sparkline({ values, color = "#4F46E5" }) {
    const max = Math.max(...values), min = Math.min(...values);
    const W = 80, H = 28;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * H;
      return `${x},${y}`;
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // ─── Auth Pages ──────────────────────────────────────────────
  function AuthPage({ onAuth }) {
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const FAMILY_USERS = [
    { id: 1, name: "Father", password: "1234" },
    { id: 2, name: "Mother", password: "1234" },
    { id: 3, name: "Vennela", password: "1234" }
  ];

  const handleSubmit = () => {
    setError("");

    if (!form.name || !form.password) {
      return setError("Please select user and enter password.");
    }

    setLoading(true);

    setTimeout(() => {
      const user = FAMILY_USERS.find(
        (u) => u.name === form.name && u.password === form.password
      );

      setLoading(false);

      if (!user) {
        setError("Invalid credentials");
        return;
      }

      onAuth(user); // ✅ login success
    }, 700);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      <div className="card" style={{ width: "min(420px, 100%)", padding: "36px 40px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>
            💰
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Micro-Budget</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Family Finance Tracker</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Family Login 👨‍👩‍👧</h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
          Select your role to continue
        </p>

        {/* 👇 USER SELECT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <select
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          >
            <option value="">Select Member</option>
            {FAMILY_USERS.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>

          {/* PASSWORD */}
          <input
            className="input"
            type="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#FEE2E2",
            color: "#B91C1C",
            fontSize: 13
          }}>
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 20 }}
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, marginTop: 12 }}>
          Demo Password: <b>1234</b>
        </p>

      </div>
    </div>
  );
}

  // ─── Sidebar ─────────────────────────────────────────────────
  function Sidebar({ page, setPage, user, onLogout }) {
    const nav = [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
      { id: "expenses", icon: "💸", label: "Expenses" },
      { id: "goals", icon: "🎯", label: "Goals" },
      { id: "insights", icon: "🧠", label: "Insights" },
    ];

    return (
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              💰
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-0.3px" }}>Micro-Budget</div>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>Finance Tracker</div>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: "0 16px 12px" }} />

        {/* Nav */}
        <nav style={{ padding: "0 12px", flex: 1 }}>
          {nav.map((n) => (
            <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)} style={{ marginBottom: 2 }}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 16px 20px" }}>
          <div className="divider" style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
            <button onClick={onLogout} className="btn btn-ghost btn-icon btn-sm" title="Logout">↩</button>
          </div>
        </div>
      </aside>
    );
  }

  // ─── Stat Card ───────────────────────────────────────────────
  function StatCard({ label, value, sub, icon, color, trend }) {
    return (
      <div className="stat-card fade-in" style={{ color }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", marginBottom: 4 }}>
              {value}
            </div>
            {sub && <div style={{ fontSize: 12, color: "#6B7280" }}>{sub}</div>}
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {icon}
          </div>
        </div>
        {trend && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkline values={trend.values} color={color} />
            <span style={{ fontSize: 12, color, fontWeight: 600 }}>{trend.label}</span>
          </div>
        )}
      </div>
    );
  }

  // ─── Dashboard Page ──────────────────────────────────────────
  function DashboardPage({ expenses, goals, toast, user }) {
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalBalance = 52000;
    const savings = totalBalance - totalExpenses;
    const budget = 40000;
    const savingsPct = pct(savings, totalBalance);
    const overBudget = totalExpenses > budget;

    // Category totals for pie
    const catMap = {};
    expenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
    const pieData = Object.entries(catMap).map(([label, value]) => ({
      label, value, color: CATEGORY_COLORS[label] || "#6B7280",
    }));

    // Badges
    const earnedBadges = BADGES_CONFIG.filter((b) =>
      b.condition(savingsPct, totalExpenses, budget)
    );

    // Daily budget
    const daysLeft = 3;
    const remaining = budget - totalExpenses;
    const dailyBudget = Math.max(0, Math.round(remaining / daysLeft));

    // Predictive
    const dailyAvgSpend = totalExpenses / 28;
    const predictedTotal = Math.round(dailyAvgSpend * 31);

    const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

    useEffect(() => {
      if (overBudget) {
        setTimeout(() => toast("⚠️ You've exceeded your monthly budget!", "warning"), 800);
      }
    }, []);

    return (
      <div className="fade-in">
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.4px" }}>
              Good morning, {user.name.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
              March 2026 · Here's your financial snapshot
            </p>
          </div>
          {overBudget && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              background: "#FEF3C7", borderRadius: 10, border: "1px solid #FDE68A" }}>
              <span>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>Over budget this month</span>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Monthly Income" value={fmt(totalBalance)} icon="💼" color="#4F46E5"
            sub="Fixed salary" trend={{ values: [50000, 50000, 52000, 52000, 52000, 52000], label: "+3.8%" }} />
          <StatCard label="Total Expenses" value={fmt(totalExpenses)} icon="💸" color={overBudget ? "#EF4444" : "#F59E0B"}
            sub={overBudget ? "Over budget" : `${pct(totalExpenses, budget)}% of budget`}
            trend={{ values: [38000, 41000, 49000, 35000, 33000, totalExpenses], label: overBudget ? "+12%" : "-8%" }} />
          <StatCard label="Net Savings" value={fmt(Math.max(0, savings))} icon="🏦" color="#22C55E"
            sub={`${savingsPct}% of income saved`}
            trend={{ values: [14000, 11000, 3000, 17000, 19000, savings], label: `${savingsPct}%` }} />
          <StatCard label="Daily Budget" value={fmt(dailyBudget)} icon="📅" color="#8B5CF6"
            sub={`${daysLeft} days remaining`} />
        </div>

        {/* Row: Charts */}
        {/* Financial Prediction */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700 }}>🔮 Financial Prediction</h2>

      <p style={{ marginTop: 10, fontSize: 14 }}>
        Predicted Spend: <b>{fmt(predictedTotal)}</b>
      </p>

      <p style={{
        marginTop: 8,
        color: predictedTotal > budget ? "#EF4444" : "#22C55E",
        fontWeight: 600
      }}>
        {predictedTotal > budget
          ? "⚠️ You may exceed your budget"
          : "✅ You are within budget"}
      </p>
    </div>

    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700 }}>💡 Smart Insights</h2>

      <p style={{ marginTop: 10 }}>
        Daily Avg Spend: {fmt(Math.round(totalExpenses / 28))}
      </p>

      <p style={{ marginTop: 8 }}>
        {predictedTotal > budget
          ? "Reduce daily expenses to stay safe"
          : "Great job managing your budget!"}
      </p>
    </div>

  </div>

        {/* Row: Predictions + Recent + Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Predictive */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>🔮 Predictions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px 14px", background: "#EEF2FF", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Predicted Month-End Spend</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4F46E5" }}>{fmt(predictedTotal)}</div>
                <div style={{ fontSize: 11, color: predictedTotal > budget ? "#EF4444" : "#22C55E", marginTop: 2 }}>
                  {predictedTotal > budget ? `₹${(predictedTotal - budget).toLocaleString()} over budget` : "Within budget 🎉"}
                </div>
              </div>
              <div style={{ padding: "12px 14px", background: "#ECFEFF", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Estimated Savings</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#06B6D4" }}>
                  {fmt(Math.max(0, totalBalance - predictedTotal))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Recent Transactions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentExpenses.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: (CATEGORY_COLORS[e.category] || "#6B7280") + "18",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {e.category === "Food" ? "🍔" : e.category === "Transport" ? "🚗" : e.category === "Entertainment" ? "🎬" : e.category === "Health" ? "💊" : "📦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{e.date}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>-{fmt(e.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14 }}>🏆 Achievements</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BADGES_CONFIG.map((b) => {
                const earned = earnedBadges.find((e) => e.id === b.id);
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: 10, background: earned ? "#F0FDF4" : "#F9FAFB",
                    border: `1px solid ${earned ? "#BBF7D0" : "#F3F4F6"}` }}>
                    <span style={{ fontSize: 20, filter: earned ? "none" : "grayscale(1) opacity(0.4)" }}>{b.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: earned ? "#15803D" : "#9CA3AF" }}>{b.label}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{b.desc}</div>
                    </div>
                    {earned && <span style={{ marginLeft: "auto", fontSize: 10 }} className="badge badge-success">Earned</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Savings progress */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>🎯 Goals Progress</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {goals.map((g) => {
              const p = pct(g.saved, g.target);
              return (
                <div key={g.id} style={{ padding: "16px", background: "#F9FAFB", borderRadius: 12, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{g.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{g.title}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>{p}%</span>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${p}%`, background: "linear-gradient(90deg,#4F46E5,#06B6D4)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280" }}>
                    <span>{fmt(g.saved)} saved</span>
                    <span>{fmt(g.target - g.saved)} left</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Expense Modal ───────────────────────────────────────────
  function ExpenseModal({ exp, onSave, onClose, user }) {
    const [form, setForm] = useState(
      exp || { title: "", category: "Food", amount: "", date: today(), notes: "" }
    );

    const save = () => {
      if (!form.title || !form.amount) return;

      onSave({
        ...form,
        amount: parseFloat(form.amount),
        id: form.id || uid(),
        addedBy: form.addedBy || "Unknown" || "Unknown" // ✅ NEW FEATURE
      });

      onClose();
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            {exp ? "✏️ Edit Expense" : "➕ Add Expense"}
          </h2>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
    className="input"
    value={form.addedBy || ""}
    onChange={(e) => setForm({ ...form, addedBy: e.target.value })}
  >
    <option value="">Select Member</option>
    <option>Father</option>
    <option>Mother</option>
    <option>Me</option>
  </select>

            <input
              className="input"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              className="input"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ─── Expenses Page ───────────────────────────────────────────
  function ExpensesPage({ expenses, setExpenses, toast, user }) {
    const [modal, setModal] = useState(null); // null | "add" | expense obj
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("date");

    const save = (e) => {
      if (e.id && expenses.find((x) => x.id === e.id)) {
        setExpenses((p) => p.map((x) => (x.id === e.id ? e : x)));
        toast("Expense updated ✓", "success");
      } else {
        setExpenses((p) => [e, ...p]);
        toast("Expense added ✓", "success");
      }
    };

    const del = (id) => {
      setExpenses((p) => p.filter((e) => e.id !== id));
      toast("Expense deleted", "info");
    };

    const filtered = expenses
      .filter((e) => filter === "All" || e.category === filter)
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === "date" ? b.date.localeCompare(a.date) : b.amount - a.amount);

    const total = filtered.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>💸 Expenses</h1>
            <p style={{ fontSize: 14, color: "#6B7280" }}>{filtered.length} transactions · {fmt(total)} total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal("add")}>+ Add Expense</button>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input className="input" placeholder="🔍 Search expenses..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 220, padding: "8px 12px" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {["All", ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid", borderColor: filter === c ? "#4F46E5" : "#E5E7EB",
                background: filter === c ? "#4F46E5" : "white", color: filter === c ? "white" : "#6B7280",
                transition: "all 0.15s",
              }}>
                {c}
              </button>
            ))}
          </div>
          <select className="input" style={{ maxWidth: 140, padding: "8px 12px" }}
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="emoji">💸</div>No expenses found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Expense", "Category", "Amount", "Date", "Notes", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11,
                        fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: "1px solid #F3F4F6",
                      background: i % 2 === 0 ? "white" : "#FAFAFA", transition: "background 0.1s" }}
                      onMouseEnter={(el) => { el.currentTarget.style.background = "#F0F9FF"; }}
                      onMouseLeave={(el) => { el.currentTarget.style.background = i % 2 === 0 ? "white" : "#FAFAFA"; }}>
                      <td style={{ padding: "14px 20px" }}>
    <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
      {e.title}
    </div>

    <div style={{ fontSize: 11, color: "#9CA3AF" }}>
      👤 {e.addedBy || "Unknown"}
    </div>
  </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className="badge" style={{
                          background: (CATEGORY_COLORS[e.category] || "#6B7280") + "18",
                          color: CATEGORY_COLORS[e.category] || "#6B7280",
                        }}>
                          <div className="cat-dot" style={{ background: CATEGORY_COLORS[e.category] || "#6B7280", width: 6, height: 6 }} />
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontWeight: 700, color: "#EF4444", fontSize: 14 }}>
                        -{fmt(e.amount)}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#6B7280", fontSize: 13 }}>{e.date}</td>
                      <td style={{ padding: "14px 20px", color: "#9CA3AF", fontSize: 13 }}>{e.notes || "—"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(e)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(e.id)} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modal && (
    <ExpenseModal
      exp={modal === "add" ? null : modal}
      onSave={save}
      onClose={() => setModal(null)}
      user={user} // ✅ IMPORTANT
    />
  )}
      </div>
    );
  }

  // ─── Goal Modal ──────────────────────────────────────────────
  function GoalModal({ goal, onSave, onClose }) {
    const icons = ["🛡️", "✈️", "💻", "🏠", "🚗", "💍", "🎓", "🏋️", "📱", "🎯"];
    const [form, setForm] = useState(goal || { title: "", target: "", saved: "", deadline: "", icon: "🎯" });

    const save = () => {
      if (!form.title || !form.target) return;
      onSave({ ...form, target: parseFloat(form.target), saved: parseFloat(form.saved || 0), id: form.id || uid() });
      onClose();
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
            {goal ? "✏️ Edit Goal" : "🎯 New Savings Goal"}
          </h2>
          {/* Icon picker */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="label">Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {icons.map((ic) => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  style={{ width: 36, height: 36, fontSize: 18, borderRadius: 8, border: `2px solid ${form.icon === ic ? "#4F46E5" : "#E5E7EB"}`,
                    background: form.icon === ic ? "#EEF2FF" : "white", cursor: "pointer", transition: "all 0.15s" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label className="label">Goal Name</label>
              <input className="input" placeholder="e.g. Emergency Fund" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Target Amount (₹)</label>
              <input className="input" type="number" placeholder="50000" value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Already Saved (₹)</label>
              <input className="input" type="number" placeholder="0" value={form.saved}
                onChange={(e) => setForm({ ...form, saved: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label className="label">Target Date</label>
              <input className="input" type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{goal ? "Save Changes" : "Create Goal"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Goals Page ──────────────────────────────────────────────
  function GoalsPage({ goals, setGoals, toast }) {
    const [modal, setModal] = useState(null);
    const [addSavings, setAddSavings] = useState(null); // goal id
    const [addAmt, setAddAmt] = useState("");

    const save = (g) => {
      if (goals.find((x) => x.id === g.id)) {
        setGoals((p) => p.map((x) => (x.id === g.id ? g : x)));
        toast("Goal updated ✓", "success");
      } else {
        setGoals((p) => [...p, g]);
        toast("Goal created! 🎯", "success");
      }
    };

    const del = (id) => {
      setGoals((p) => p.filter((g) => g.id !== id));
      toast("Goal deleted", "info");
    };

    const addToSavings = (id) => {
      const amt = parseFloat(addAmt);
      if (!amt || amt <= 0) return;
      setGoals((p) => p.map((g) => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amt) } : g));
      toast(`+${fmt(amt)} added to goal ✓`, "success");
      setAddSavings(null);
      setAddAmt("");
    };

    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

    return (
      <div className="fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>🎯 Savings Goals</h1>
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              {fmt(totalSaved)} saved of {fmt(totalTarget)} total target
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal("new")}>+ New Goal</button>
        </div>

        {/* Overall progress */}
        <div className="card" style={{ padding: 24, marginBottom: 20, background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 8 }}>Overall Savings Progress</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 12 }}>
            {fmt(totalSaved)} <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>/ {fmt(totalTarget)}</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct(totalSaved, totalTarget)}%`,
              background: "white", borderRadius: 99, transition: "width 1s ease" }} />
          </div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {pct(totalSaved, totalTarget)}% achieved · {fmt(totalTarget - totalSaved)} remaining
          </div>
        </div>

        {/* Goal cards */}
        {goals.length === 0 ? (
          <div className="card empty-state"><div className="emoji">🎯</div>No goals yet. Create your first one!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {goals.map((g) => {
              const p = pct(g.saved, g.target);
              const completed = p >= 100;
              const daysLeft = g.deadline
                ? Math.max(0, Math.round((new Date(g.deadline) - new Date()) / 86400000))
                : null;

              return (
                <div key={g.id} className="card fade-in" style={{ padding: 22, position: "relative",
                  border: completed ? "1.5px solid #86EFAC" : "1px solid rgba(229,231,235,0.6)" }}>
                  {completed && (
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                      <span className="badge badge-success">✓ Complete!</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: "#F0F9FF",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {g.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{g.title}</div>
                      {daysLeft !== null && (
                        <div style={{ fontSize: 12, color: daysLeft < 30 ? "#EF4444" : "#9CA3AF" }}>
                          {daysLeft === 0 ? "Due today!" : `${daysLeft} days left`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>Progress</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5" }}>{p}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${p}%`,
                        background: completed ? "linear-gradient(90deg,#22C55E,#16A34A)" : "linear-gradient(90deg,#4F46E5,#06B6D4)"
                      }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14 }}>
                    <span style={{ color: "#22C55E", fontWeight: 700 }}>{fmt(g.saved)} saved</span>
                    <span style={{ color: "#6B7280" }}>{fmt(g.target - g.saved)} left</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {!completed && (
                      addSavings === g.id ? (
                        <div style={{ display: "flex", gap: 6, flex: 1 }}>
                          <input className="input" type="number" placeholder="Amount" value={addAmt}
                            onChange={(e) => setAddAmt(e.target.value)} style={{ padding: "7px 10px" }} />
                          <button className="btn btn-primary btn-sm" onClick={() => addToSavings(g.id)}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setAddSavings(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                          onClick={() => { setAddSavings(g.id); setAddAmt(""); }}>
                          + Add Savings
                        </button>
                      )
                    )}
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(g)}>✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(g.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modal && (
          <GoalModal
            goal={modal === "new" ? null : modal}
            onSave={save}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    );
  }

  // ─── Insights Page ───────────────────────────────────────────
  function InsightsPage({ expenses }) {
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const budget = 40000;

    // Category breakdown
    const catMap = {};
    expenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    // Food comparison (simulated last week vs this week)
    const foodSpend = catMap["Food"] || 0;
    const foodLastWeek = 1600;
    const foodChange = Math.round(((foodSpend - foodLastWeek) / foodLastWeek) * 100);

    const insights = [
      {
        icon: "🍔", type: foodChange > 0 ? "warning" : "success",
        text: `You spent ${Math.abs(foodChange)}% ${foodChange > 0 ? "more" : "less"} on Food compared to last week.`,
      },
      {
        icon: "📉", type: "info",
        text: `Your top spending category is ${topCat[0]?.[0] || "—"} at ${fmt(topCat[0]?.[1] || 0)}.`,
      },
      {
        icon: "💰", type: totalExpenses > budget ? "danger" : "success",
        text: totalExpenses > budget
          ? `You're ₹${(totalExpenses - budget).toLocaleString()} over budget this month.`
          : `Great! You're ₹${(budget - totalExpenses).toLocaleString()} under budget.`,
      },
      {
        icon: "🔮", type: "info",
        text: `At this rate, your projected end-of-month spend is ${fmt(Math.round((totalExpenses / 28) * 31))}.`,
      },
      {
        icon: "🏦", type: "success",
        text: `You've maintained savings across 3 active goals. Keep it up!`,
      },
    ];

    const typeColor = { warning: "#F59E0B", success: "#22C55E", danger: "#EF4444", info: "#4F46E5" };
    const typeBg = { warning: "#FEF3C7", success: "#DCFCE7", danger: "#FEE2E2", info: "#EEF2FF" };

    return (
      <div className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>🧠 Smart Insights</h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>AI-powered analysis of your spending habits</p>
        </div>

        {/* Smart insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {insights.map((ins, i) => (
            <div key={i} className="card fade-in" style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14,
              borderLeft: `4px solid ${typeColor[ins.type]}`, animationDelay: `${i * 0.08}s` }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: typeBg[ins.type],
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {ins.icon}
              </div>
              <div>
                <p style={{ fontSize: 14, color: "#111827", fontWeight: 500, lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category analysis */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>📊 Category Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topCat.map(([cat, val]) => {
                const p = pct(val, totalExpenses);
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="cat-dot" style={{ background: CATEGORY_COLORS[cat] || "#6B7280" }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{cat}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{fmt(val)}</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF", minWidth: 30, textAlign: "right" }}>{p}%</span>
                      </div>
                    </div>
                    <div className="progress-track" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${p}%`, background: CATEGORY_COLORS[cat] || "#6B7280" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>📅 Spending Tips</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🎯", title: "Set category limits", desc: "Allocate max spend per category" },
                { icon: "📱", title: "Track daily", desc: "Log expenses same day" },
                { icon: "🚫", title: "Avoid impulse", desc: "Wait 24h before big purchases" },
                { icon: "🔄", title: "Review weekly", desc: "Check your progress every Sunday" },
                { icon: "💳", title: "Use cash more", desc: "Limit card spending on food" },
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main App ─────────────────────────────────────────────────
  export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("dashboard");
    const [expenses, setExpenses] = useState(SEED_EXPENSES);
    const [goals, setGoals] = useState(SEED_GOALS);
    const { toasts, add: toast } = useToast();

    if (!user) {
      return (
        <>
          <StyleProvider />
          <AuthPage onAuth={(u) => { setUser(u); toast(`Welcome, ${u.name.split(" ")[0]}! 🎉`, "success"); }} />
          <ToastContainer toasts={toasts} />
        </>
      );
    }

    const pageComp = {
      dashboard: <DashboardPage expenses={expenses} goals={goals} toast={toast} user={user} />,
      expenses: (
    <ExpensesPage
      expenses={expenses}
      setExpenses={setExpenses}
      toast={toast}
      user={user}   // 🔥 ADD THIS
    />
  ),
      goals: <GoalsPage goals={goals} setGoals={setGoals} toast={toast} />,
      insights: <InsightsPage expenses={expenses} />,
    };

    return (
      <>
        <StyleProvider />
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Sidebar page={page} setPage={setPage} user={user} onLogout={() => { setUser(null); setPage("dashboard"); }} />
          <main className="main-content">
            {pageComp[page]}
          </main>
        </div>
        <ToastContainer toasts={toasts} />
      </>
    );
  }
