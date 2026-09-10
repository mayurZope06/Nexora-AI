import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const url = isLogin ? `${import.meta.env.VITE_API_URL}/api/auth/login` : `${import.meta.env.VITE_API_URL}/api/auth/register`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      position: "relative",
      zIndex: 10,
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background: "linear-gradient(145deg, rgba(20, 20, 28, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "3rem 2.5rem",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative background glow inside the card */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Logo Area */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)"
            }}
          >
            <Sparkles size={28} color="white" />
          </motion.div>

          <h2 style={{ 
            color: "white", 
            marginBottom: "0.5rem", 
            fontSize: "1.75rem", 
            fontWeight: "800",
            letterSpacing: "-0.02em",
            textAlign: "center"
          }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "2rem",
            fontSize: "0.95rem",
            textAlign: "center"
          }}>
            {isLogin ? "Enter your details to access Nexora AI" : "Sign up to start exploring Nexora AI"}
          </p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                style={{ 
                  color: "#ff8a8a", 
                  background: "rgba(255, 59, 48, 0.1)",
                  border: "1px solid rgba(255, 59, 48, 0.2)",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem", 
                  fontSize: "0.85rem",
                  width: "100%",
                  textAlign: "center",
                  boxSizing: "border-box"
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}>
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.2)",
                  color: "white",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(168, 85, 247, 0.5)";
                  e.target.style.background = "rgba(0,0,0,0.4)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(0,0,0,0.2)";
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.2)",
                  color: "white",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(168, 85, 247, 0.5)";
                  e.target.style.background = "rgba(0,0,0,0.4)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(0,0,0,0.2)";
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "0.9rem",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
                transition: "box-shadow 0.2s ease",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 size={20} />
                </motion.div>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#a78bfa",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.color = "#c4b5fd"}
              onMouseLeave={(e) => e.target.style.color = "#a78bfa"}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
