import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MODELS = [
  { id: "lite",  label: "Nexora Lite",  badge: "Fast",    icon: "fa-bolt",   color: "#64748B" },
  { id: "pro",   label: "Nexora Pro",   badge: "Popular", icon: "fa-star",   color: "#6366f1" },
  { id: "ultra", label: "Nexora Ultra", badge: "New",     icon: "fa-rocket", color: "#8b5cf6" },
];

export default function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(MODELS[1]);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        id="model-selector"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 14px",
          borderRadius: "12px",
          border: "1px solid var(--surface-border)",
          background: "var(--surface-bg)",
          backdropFilter: "blur(12px)",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontFamily: "inherit",
          fontSize: "13.5px",
          fontWeight: "600",
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(99,102,241,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--surface-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <i
          className={`fa-solid ${selected.icon}`}
          style={{ color: selected.color, fontSize: "12px" }}
        />
        <span>{selected.label}</span>
        <motion.i
          className="fa-solid fa-chevron-down"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: "11px", color: "var(--text-muted)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="dropdown-menu"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              width: "220px",
              zIndex: 100,
              padding: "6px",
            }}
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                role="option"
                aria-selected={selected.id === m.id}
                onClick={() => { setSelected(m); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: selected.id === m.id ? "var(--thread-active-bg)" : "transparent",
                  cursor: "pointer",
                  color: selected.id === m.id ? "#6366f1" : "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: "13.5px",
                  fontWeight: "500",
                  textAlign: "left",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => {
                  if (selected.id !== m.id) e.currentTarget.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  if (selected.id !== m.id) e.currentTarget.style.background = "transparent";
                }}
              >
                <i className={`fa-solid ${m.icon}`} style={{ color: m.color, width: "16px" }} />
                <span style={{ flex: 1 }}>{m.label}</span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  padding: "2px 7px",
                  borderRadius: "6px",
                  background: m.id === "pro" ? "rgba(99,102,241,0.1)" : "rgba(100,116,139,0.1)",
                  color: m.id === "pro" ? "#6366f1" : "var(--text-muted)",
                }}>
                  {m.badge}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
