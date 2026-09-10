import { motion } from "framer-motion";

const FEATURES = [
  { icon: "⚡", text: "Faster Responses" },
  { icon: "🧠", text: "Advanced Models"  },
  { icon: "🎨", text: "Image Generation" },
  { icon: "∞",  text: "Unlimited Chats"  },
];

export default function UpgradeWidget() {
  return (
    <motion.div
      className="upgrade-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: "linear-gradient(135deg, #EF4444, #F97316)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: "13px" }}>✦</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "12.5px", color: "rgba(255,255,255,0.8)" }}>Sigma Pro</p>
          <p style={{ margin: 0, fontSize: "10.5px", color: "rgba(255,255,255,0.25)" }}>Unlock all features</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
        {FEATURES.map((f) => (
          <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
            <span style={{ fontSize: "11px", width: "14px", textAlign: "center" }}>{f.icon}</span>
            {f.text}
          </div>
        ))}
      </div>

      <motion.button
        id="upgrade-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%", padding: "9px",
          borderRadius: "10px",
          border: "1px solid rgba(239,68,68,0.3)",
          background: "transparent",
          color: "rgba(239,68,68,0.8)",
          fontFamily: "inherit", fontWeight: 700, fontSize: "12px",
          cursor: "pointer", transition: "all 250ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #EF4444, #F97316)";
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(239,68,68,0.8)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ✦ Upgrade to Sigma Pro
      </motion.button>
    </motion.div>
  );
}
