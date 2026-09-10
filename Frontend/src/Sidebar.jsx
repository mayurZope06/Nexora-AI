import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { Crown, MessageSquare } from "lucide-react";
import { AuthContext } from "./context/AuthContext.jsx";

function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed, isMobile }) {
  const {
    allThreads, setAllThreads, currThreadId,
    setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats,
  } = useContext(MyContext);
  const { token, logout } = useContext(AuthContext);

  const [hoveredThread, setHoveredThread] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  });

  // ── Fetch all threads ──────────────────────────────────────────────────────
  const getAllThreads = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thread`, { headers: getAuthHeaders() });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setAllThreads(data.map((t) => ({ threadId: t.threadId, title: t.title })));
    } catch (e) { console.error("Error fetching threads:", e); }
  };

  useEffect(() => { getAllThreads(); }, [currThreadId]);

  // ── New chat ───────────────────────────────────────────────────────────────
  const createNewChat = () => {
    setNewChat(true); setPrompt(""); setReply(null);
    setCurrThreadId(uuidv1()); setPrevChats([]);
    if (onClose) onClose();
  };

  // ── Switch thread ──────────────────────────────────────────────────────────
  const changeThread = async (id) => {
    setCurrThreadId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${id}`, { headers: getAuthHeaders() });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setPrevChats(data); setNewChat(false); setReply(null);
    } catch (e) { console.error("Error changing thread:", e); }
    if (onClose) onClose();
  };

  // ── Delete thread from DB ──────────────────────────────────────────────────
  const deleteThread = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.status === 401) { logout(); return; }
      setAllThreads((p) => p.filter((t) => t.threadId !== id));
      if (id === currThreadId) createNewChat();
    } catch (e) { console.error("Error deleting thread:", e); }
    setDeletingId(null);
  };

  return (
    <motion.section
      className={`sidebar-root${isOpen ? " mobile-open" : ""}`}
      initial={false}
      animate={isMobile ? {} : {
        width: isCollapsed ? 0 : 256,
        minWidth: isCollapsed ? 0 : 256,
        borderRightWidth: isCollapsed ? 0 : 1,
        opacity: isCollapsed ? 0 : 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      aria-label="Sidebar navigation"
    >
      {/* ── Ambient background effects ──────────────────────────────────────── */}

      {/* Top violet glow — sits behind the logo/header area */}
      <div className="sidebar-glow sidebar-glow-top" aria-hidden="true" />

      {/* Bottom indigo glow — rises behind the footer card */}
      <div className="sidebar-glow sidebar-glow-bottom" aria-hidden="true" />

      {/* Shimmer line along the right border */}
      <div className="sidebar-shimmer-border" aria-hidden="true" />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ width: "256px", display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>

        {/* ── Header: Logo + New Chat + Mobile Close ─────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 16px 14px", flexShrink: 0,
        }}>
          {/* Logo and Collapse */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* ── Desktop only: premium sidebar collapse button ─────────────── */}
            {!isMobile && (
              <motion.button
                onClick={() => setIsCollapsed(true)}
                whileHover="hovered"
                whileTap={{ scale: 0.90 }}
                initial="idle"
                style={{
                  width: "32px", height: "32px",
                  borderRadius: "9px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  padding: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
                title="Collapse Sidebar"
              >
                {/* Hover glow fill */}
                <motion.span
                  variants={{
                    idle:    { opacity: 0 },
                    hovered: { opacity: 1 },
                  }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 75%)",
                    borderRadius: "9px",
                    pointerEvents: "none",
                  }}
                />
                {/* Animated 3-line icon */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <motion.rect
                    x="0" y="0" width="16" height="1.8" rx="0.9"
                    fill="rgba(255,255,255,0.55)"
                    variants={{
                      idle:    { width: 16, x: 0 },
                      hovered: { width: 10, x: 0, fill: "rgba(167,139,250,0.9)" },
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                  <motion.rect
                    x="0" y="5.1" width="16" height="1.8" rx="0.9"
                    fill="rgba(255,255,255,0.55)"
                    variants={{
                      idle:    { fill: "rgba(255,255,255,0.55)" },
                      hovered: { fill: "rgba(167,139,250,0.9)" },
                    }}
                    transition={{ duration: 0.22 }}
                  />
                  <motion.rect
                    x="0" y="10.2" width="16" height="1.8" rx="0.9"
                    fill="rgba(255,255,255,0.55)"
                    variants={{
                      idle:    { width: 16, x: 0 },
                      hovered: { width: 10, x: 0, fill: "rgba(167,139,250,0.9)" },
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                </svg>
              </motion.button>
            )}

            <span style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.01em",
              userSelect: "none",
            }}>
              Nexora <span style={{
                background: "linear-gradient(90deg, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>AI</span>
            </span>
          </div>

          {/* Right side: New Chat button + Mobile close */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* New Chat / Compose Button */}
            <motion.button
              id="new-chat-btn"
              onClick={createNewChat}
              whileHover="hovered"
              whileTap={{ scale: 0.90 }}
              initial="idle"
              aria-label="New chat"
              title="New Chat"
              style={{
                width: "32px", height: "32px",
                borderRadius: "9px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Hover radial violet glow */}
              <motion.span
                variants={{
                  idle:    { opacity: 0 },
                  hovered: { opacity: 1 },
                }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.20) 0%, transparent 75%)",
                  borderRadius: "9px",
                  pointerEvents: "none",
                }}
              />
              {/* Animated compose/pencil SVG */}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <motion.path
                  d="M10.5 1.5 L13.5 4.5 L5 13 L2 13 L2 10 Z"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                  variants={{
                    idle:    { stroke: "rgba(255,255,255,0.55)" },
                    hovered: { stroke: "rgba(167,139,250,0.95)" },
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.path
                  d="M9 3 L12 6"
                  strokeWidth="1.5" strokeLinecap="round"
                  variants={{
                    idle:    { stroke: "rgba(255,255,255,0.35)" },
                    hovered: { stroke: "rgba(196,181,253,0.85)" },
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.line
                  x1="2" y1="14.5" x2="2" y2="14.5"
                  strokeWidth="1.5" strokeLinecap="round"
                  variants={{
                    idle:    { x2: 2,  stroke: "rgba(139,92,246,0)" },
                    hovered: { x2: 13, stroke: "rgba(139,92,246,0.7)" },
                  }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                />
              </svg>
            </motion.button>

            {/* ── Mobile only: Close sidebar button ───────────────────────── */}
            {isMobile && (
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                aria-label="Close sidebar"
                title="Close"
                style={{
                  width: "32px", height: "32px",
                  borderRadius: "9px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  padding: 0,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────────────────── */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 14px 10px" }} />

        {/* ── Chat History List ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
          {allThreads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: "32px 12px", textAlign: "center" }}
            >
              <MessageSquare size={24} style={{ color: "rgba(255,255,255,0.12)", margin: "0 auto 10px", display: "block" }} />
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
                No chats yet.<br />Start a conversation!
              </p>
            </motion.div>
          ) : (
            <ul role="list" aria-label="Chat history" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <AnimatePresence initial={false}>
                {allThreads.map((thread, idx) => {
                  const isActive = thread.threadId === currThreadId;
                  const isHovered = hoveredThread === thread.threadId;
                  const isDeleting = deletingId === thread.threadId;

                  return (
                    <motion.li
                      key={thread.threadId}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2, delay: idx < 10 ? idx * 0.025 : 0 }}
                      style={{ marginBottom: "2px" }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Open chat: ${thread.title || "Untitled"}`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => changeThread(thread.threadId)}
                        onKeyDown={(e) => e.key === "Enter" && changeThread(thread.threadId)}
                        onMouseEnter={() => setHoveredThread(thread.threadId)}
                        onMouseLeave={() => setHoveredThread(null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(99,102,241,0.10)"
                            : isHovered ? "rgba(255,255,255,0.04)" : "transparent",
                          borderLeft: isActive
                            ? "2px solid rgba(139,92,246,0.80)"
                            : "2px solid transparent",
                          boxShadow: isActive
                            ? "inset 0 0 20px rgba(99,102,241,0.05)"
                            : "none",
                          transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          position: "relative",
                        }}
                      >
                        {/* Active indicator glow */}
                        {isActive && (
                          <motion.div
                            layoutId="active-thread-glow"
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: "10px",
                              background: "linear-gradient(90deg, rgba(99,102,241,0.08) 0%, transparent 100%)",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* Title */}
                        <span style={{
                          flex: 1,
                          fontSize: "13.5px",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.58)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: 1.4,
                          transition: "color 180ms",
                        }}>
                          {thread.title || "Untitled Chat"}
                        </span>

                        {/* Delete button — premium animated SVG */}
                        <AnimatePresence>
                          {(isHovered || isActive) && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.65 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.65 }}
                              transition={{ duration: 0.15, ease: "backOut" }}
                              whileHover="hovered"
                              whileTap={{ scale: 0.88 }}
                              initial2="idle"
                              aria-label={`Delete "${thread.title}"`}
                              onClick={(e) => deleteThread(e, thread.threadId)}
                              disabled={isDeleting}
                              style={{
                                width: "26px", height: "26px",
                                borderRadius: "7px",
                                border: "1px solid rgba(255,255,255,0.06)",
                                background: "rgba(255,255,255,0.03)",
                                cursor: isDeleting ? "wait" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                padding: 0,
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {isDeleting ? (
                                /* Spinner */
                                <span style={{
                                  width: "10px", height: "10px",
                                  border: "1.5px solid rgba(239,68,68,0.35)",
                                  borderTopColor: "rgba(239,68,68,0.85)",
                                  borderRadius: "50%", display: "block",
                                  animation: "spin 0.7s linear infinite",
                                }} />
                              ) : (
                                <>
                                  {/* Red radial glow on hover */}
                                  <motion.span
                                    variants={{
                                      idle:    { opacity: 0 },
                                      hovered: { opacity: 1 },
                                    }}
                                    transition={{ duration: 0.16 }}
                                    style={{
                                      position: "absolute", inset: 0,
                                      background: "radial-gradient(circle at 50% 60%, rgba(239,68,68,0.18) 0%, transparent 75%)",
                                      borderRadius: "7px",
                                      pointerEvents: "none",
                                    }}
                                  />
                                  {/* Animated trash SVG */}
                                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    {/* Lid — rotates open on hover */}
                                    <motion.path
                                      d="M2 3.5 L11 3.5"
                                      strokeWidth="1.4" strokeLinecap="round"
                                      variants={{
                                        idle:    { stroke: "rgba(255,255,255,0.45)", rotate: 0, originX: "6.5px", originY: "3.5px" },
                                        hovered: { stroke: "rgba(239,68,68,0.9)",   rotate: -12 },
                                      }}
                                      transition={{ duration: 0.2 }}
                                    />
                                    {/* Handle on lid */}
                                    <motion.path
                                      d="M4.5 3.5 L4.5 2.2 Q4.5 1.5 5.2 1.5 L7.8 1.5 Q8.5 1.5 8.5 2.2 L8.5 3.5"
                                      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                      variants={{
                                        idle:    { stroke: "rgba(255,255,255,0.45)" },
                                        hovered: { stroke: "rgba(239,68,68,0.85)" },
                                      }}
                                      transition={{ duration: 0.2 }}
                                    />
                                    {/* Body */}
                                    <motion.path
                                      d="M3 4.5 L3.6 11 Q3.65 11.5 4.2 11.5 L8.8 11.5 Q9.35 11.5 9.4 11 L10 4.5"
                                      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                      variants={{
                                        idle:    { stroke: "rgba(255,255,255,0.45)" },
                                        hovered: { stroke: "rgba(239,68,68,0.85)" },
                                      }}
                                      transition={{ duration: 0.2 }}
                                    />
                                    {/* Inner lines */}
                                    <motion.path
                                      d="M5.5 6 L5.5 9.5 M7.5 6 L7.5 9.5"
                                      strokeWidth="1.2" strokeLinecap="round"
                                      variants={{
                                        idle:    { stroke: "rgba(255,255,255,0.25)", pathLength: 0 },
                                        hovered: { stroke: "rgba(239,68,68,0.65)", pathLength: 1 },
                                      }}
                                      transition={{ duration: 0.22 }}
                                    />
                                  </svg>
                                </>
                              )}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* ── Divider ────────────────────────────────────────────────────────── */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "6px 14px" }} />

        {/* ── Premium Footer Branding ────────────────────────────────────────── */}
        <div style={{ padding: "12px 14px 18px", flexShrink: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover="hover"
            style={{
              padding: "1.5px", // Border thickness
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Spinning gradient border effect */}
            <motion.div
              style={{
                position: "absolute",
                inset: "-100%", // large enough to cover corners while spinning
                background: "conic-gradient(from 0deg, transparent 0 280deg, #818cf8 320deg, #c084fc 360deg)",
                zIndex: 0,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Content Card */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px",
              borderRadius: "14.5px",
              background: "linear-gradient(135deg, rgba(14,14,20,0.95), rgba(18,18,24,0.95))",
              position: "relative",
              zIndex: 1,
            }}>
              {/* Ambient Glow behind the whole inner card on hover */}
              <motion.div
                variants={{ hover: { opacity: 1 } }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "14.5px",
                  background: "radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 80%)",
                  pointerEvents: "none",
                }}
              />

              {/* Icon Container */}
              <motion.div
                style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  flexShrink: 0,
                  position: "relative",
                }}
                variants={{
                  hover: { scale: 1.08, rotate: 6, boxShadow: "0 6px 20px rgba(168,85,247,0.5)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Crown size={18} color="#fff" fill="rgba(255,255,255,0.2)" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
              </motion.div>

              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>
                    Nexora
                  </p>
                  <motion.span
                    style={{
                      fontSize: "9.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      background: "linear-gradient(135deg, #a855f7, #6366f1)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      color: "#fff",
                      fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(168,85,247,0.4)"
                    }}
                    variants={{
                      hover: { filter: "brightness(1.2)" }
                    }}
                  >
                    PRO
                  </motion.span>
                </div>
                <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.45)", marginTop: "2px", letterSpacing: "0.1px" }}>
                  Powered by <span style={{ color: "rgba(255,255,255,0.7)" }}>gpt-oss-20b</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.section>
  );
}

export default Sidebar;
