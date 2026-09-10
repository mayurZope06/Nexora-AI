import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="icon-btn"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {isDark ? (
          <i className="fa-solid fa-sun" style={{ color: "#F97316" }} />
        ) : (
          <i className="fa-solid fa-moon" />
        )}
      </motion.div>
    </button>
  );
}
