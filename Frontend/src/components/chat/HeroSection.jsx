import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "../../MyContext.jsx";
import { Code2, Sparkles, MonitorIcon, ImageIcon, BarChart3, GraduationCap } from "lucide-react";

const PROMPT_CARDS = [
  { Icon: Code2,         title: "Code",       sample: "Write a React custom hook for debouncing" },
  { Icon: Sparkles,      title: "Research",   sample: "Explain quantum computing in simple terms" },
  { Icon: MonitorIcon,   title: "Write",      sample: "Write a product description for my SaaS app" },
  { Icon: BarChart3,     title: "Analyze",    sample: "Help me interpret this sales dataset" },
  { Icon: GraduationCap, title: "Learn",      sample: "Teach me the fundamentals of machine learning" },
  { Icon: ImageIcon,     title: "Create",     sample: "Design a landing page wireframe concept" },
];

export default function HeroSection() {
  const { setPrompt } = useContext(MyContext);
  const [vw, setVw] = useState(window.innerWidth);

  // Track viewport width reactively (not just at mount)
  useEffect(() => {
    const handler = () => setVw(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = vw <= 640;
  const isSmall  = vw <= 420;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      // Removed justifyContent: "center" to avoid top-clipping on small screens
      padding: isSmall ? "20px 12px 12px" : isMobile ? "24px 16px 16px" : "40px 24px 20px",
      position: "relative",
      overflowY: "auto", // Allow scrolling instead of clipping
      width: "100%",
      boxSizing: "border-box",
    }}>

      {/* Dark radial overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 50% 42%, rgba(6,4,10,0.62) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center",
          width: "100%",
          maxWidth: "680px",
          gap: "12px",
          boxSizing: "border-box",
          margin: "auto 0", // Vertically center safely (doesn't clip top)
          paddingBottom: "20px", // Extra padding at bottom for scroll clearance
        }}
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ display: "inline-block", width: "100%" }}
        >
          <motion.h1 
            initial={{ backgroundPosition: "200% center" }}
            animate={{ backgroundPosition: "-200% center" }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{
              fontSize: isSmall ? "24px" : isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(32px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.25,
              background: "linear-gradient(90deg, #fff 0%, #c084fc 25%, #818cf8 50%, #fff 75%, #c084fc 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingBottom: "4px",
              filter: "drop-shadow(0 0 25px rgba(139,92,246,0.4))",
            }}
          >
            How can Nexora AI help today?
          </motion.h1>
          {/* Underline */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.20), transparent)" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            margin: 0,
            fontSize: isMobile ? "12.5px" : "13.5px",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.01em",
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            // Prevent text from overflowing
            width: "100%",
          }}
        >
          {/* Type a message, use a command, or pick a suggestion below */}
        </motion.p>

        {/* ── Suggestion chips ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: "grid",
            // On mobile: 2 equal columns that together never exceed the container
            // On desktop: 3 auto-sized columns centered
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))",
            gap: isSmall ? "6px" : "8px",
            width: "100%",
            marginTop: "12px",
            // This is critical — prevent grid from bleeding outside the parent
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          {PROMPT_CARDS.map(({ Icon, title, sample }, i) => (
            <motion.button
              key={title}
              onClick={() => setPrompt(sample)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.07, duration: 0.5, ease: "easeOut" }}
              aria-label={`Try: ${sample}`}
              whileHover="hover"
              whileTap={{ scale: 0.97 }}
              style={{
                minWidth: 0,
                overflow: "hidden",
                flexDirection: "row", // Keep it row on mobile for compact height
                alignItems: "center",
                gap: "10px", // consistent gap
                padding: isSmall ? "10px 12px" : isMobile ? "12px 14px" : "16px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                display: "flex",
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)"
              }}
            >
              {/* Inner ambient glow on hover */}
              <motion.div
                variants={{
                  hover: { opacity: 1 }
                }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at center, rgba(139,92,246,0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              
              <motion.div
                variants={{ hover: { borderColor: "rgba(167,139,250,0.5)" } }}
                style={{
                  position: "absolute", inset: 0, borderRadius: "18px",
                  border: "1px solid transparent", pointerEvents: "none",
                  transition: "border-color 0.3s"
                }}
              />

              {/* Icon Container */}
              <motion.div
                variants={{
                  hover: { scale: 1.1, rotate: 6, color: "#c084fc", background: "rgba(139,92,246,0.15)", boxShadow: "0 0 15px rgba(139,92,246,0.3)" }
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, width: "34px", height: "34px",
                  borderRadius: "10px", background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "all 0.3s"
                }}
              >
                  <Icon size={18} color="currentColor" />
              </motion.div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, width: "100%", zIndex: 1 }}>
                <span style={{
                  fontSize: isSmall ? "12.5px" : "13.5px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  whiteSpace: "nowrap",
                }}>
                  {title}
                </span>

                {/* Sample text */}
                {!isSmall && (
                  <span style={{
                    fontSize: "11.5px",
                    color: "rgba(255,255,255,0.45)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    display: "block",
                    minWidth: 0,
                  }}>
                    {sample}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
