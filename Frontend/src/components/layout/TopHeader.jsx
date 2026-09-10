import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Menu, Settings, LogOut, TrendingUp } from "lucide-react";

const MODELS = [
  { id: "lite",  label: "Nexora Lite",  dot: "rgba(100,116,139,0.8)" },
  { id: "pro",   label: "Nexora Pro",   dot: "rgba(99,102,241,0.9)"   },
  { id: "ultra", label: "Nexora Ultra", dot: "rgba(139,92,246,0.9)"  },
];

function ModelPill() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(MODELS[1]);

  return (
    <div style={{ position: "relative" }}>
      <button
        id="model-selector"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "5px 12px 5px 10px",
          borderRadius: "9px", border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.04)", cursor: "pointer",
          color: "rgba(255,255,255,0.75)", fontFamily: "inherit",
          fontSize: "12.5px", fontWeight: 600, transition: "all 200ms",
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
      >
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: selected.dot, flexShrink: 0 }} />
        {selected.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, width: "190px", zIndex: 100, padding: "5px" }}
          >
            {MODELS.map((m) => (
              <button key={m.id} onClick={() => { setSelected(m); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  width: "100%", padding: "9px 10px", borderRadius: "8px", border: "none",
                  background: selected.id === m.id ? "rgba(255,255,255,0.07)" : "transparent",
                  color: selected.id === m.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                  fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", transition: "all 150ms", textAlign: "left",
                }}
                onMouseEnter={(e) => { if (selected.id !== m.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (selected.id !== m.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
                {m.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TopHeader({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="top-header" role="banner">
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="icon-btn"
          aria-label="Toggle sidebar"
          style={{ display: "none" }}
        >
          <Menu size={16} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", marginRight: "2px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Workspace</span>
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>Nexora AI</span>
        </div>

        <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.07)", margin: "0 2px" }} />
        <ModelPill />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={15} />
        </button>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.07)", margin: "0 4px" }} />

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button
            id="user-profile-btn"
            onClick={() => setProfileOpen((p) => !p)}
            aria-label="User profile"
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "4px 8px 4px 6px",
              borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 200ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
          >
            <div style={{
              width: "26px", height: "26px", borderRadius: "7px",
              background: "linear-gradient(135deg, #EF4444, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "11px", fontWeight: 800,
            }}>N</div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)", lineHeight: 1.2 }}>NexoraUser</p>
              <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.3)", lineHeight: 1.2 }}>Free Plan</p>
            </div>
            <motion.span animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
            </motion.span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="dropdown-menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: "185px", zIndex: 100, padding: "5px" }}
              >
                {[
                  { Icon: TrendingUp, label: "Upgrade Plan", color: "rgba(239,68,68,0.7)" },
                  { Icon: Settings,   label: "Settings",     color: "rgba(255,255,255,0.4)" },
                  { Icon: LogOut,     label: "Log Out",      color: "rgba(239,68,68,0.7)" },
                ].map(({ Icon, label, color }) => (
                  <button key={label}
                    style={{
                      display: "flex", alignItems: "center", gap: "9px",
                      width: "100%", padding: "9px 10px", borderRadius: "8px", border: "none",
                      background: "transparent", cursor: "pointer",
                      color: "rgba(255,255,255,0.6)", fontFamily: "inherit",
                      fontSize: "13px", fontWeight: 500, textAlign: "left", transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                  >
                    <Icon size={13} style={{ color }} />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

