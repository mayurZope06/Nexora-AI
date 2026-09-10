import { useContext, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "./MyContext.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import Chat from "./Chat.jsx";
import ChatInput from "./components/chat/ChatInput.jsx";
import { Menu, Search, X, LogOut } from "lucide-react";

function ChatWindow({ onMenuClick, isSidebarCollapsed, setIsSidebarCollapsed, isMobile }) {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
  } = useContext(MyContext);
  const { token, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [highlightQuery, setHighlightQuery] = useState("");
  const [clockTime, setClockTime] = useState(() => new Date());

  // Live clock — ticks every 30s
  useEffect(() => {
    const tick = () => setClockTime(new Date());
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const isLandingPage = newChat && prevChats.length === 0;

  useEffect(() => {
    const fetchGlobalSearch = async () => {
      if (!isLandingPage || !searchQuery.trim()) {
        setGlobalSearchResults([]);
        return;
      }
      setIsSearchingGlobal(true);
      try {
        const response = await fetch(`http://localhost:8080/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) { logout(); return; }
        const data = await response.json();
        setGlobalSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search error:", error);
      }
      setIsSearchingGlobal(false);
    };

    const timeoutId = setTimeout(fetchGlobalSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, isLandingPage]);

  const handleSelectThread = async (id) => {
    setIsSearchOpen(false);
    setGlobalSearchResults([]);
    setHighlightQuery(searchQuery);
    setSearchQuery("");
    setCurrThreadId(id);
    try {
      const res = await fetch(`http://localhost:8080/api/thread/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setPrevChats(data);
      setNewChat(false);
      setReply(null);
    } catch (e) {
      console.error(e);
    }
  };

  const localSearchResults = useMemo(() => {
    if (isLandingPage || !searchQuery.trim()) return [];
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (queryWords.length === 0) return [];

    return prevChats
      .map((chat, index) => ({ chat, index }))
      .filter(({ chat }) => {
        if (!chat.content) return false;
        const text = chat.content.toLowerCase();
        return queryWords.every(word => text.includes(word));
      });
  }, [searchQuery, isLandingPage, prevChats]);

  // ── Existing API call (preserved exactly) ────────────────────────────────
  const getReply = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNewChat(false);

    const options = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: prompt, threadId: currThreadId }),
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      if (response.status === 401) { logout(); return; }
      const res = await response.json();
      console.log(res);
      setReply(res.reply);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  // ── Existing useEffect (preserved exactly) ────────────────────────────────
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }
    setPrompt("");
  }, [reply]);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      minWidth: 0,
    }}>

      {/* ── Top header bar ────────────────────────────────────────────────── */}
      <div style={{
        height: "56px", // Slightly taller for premium feel
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "linear-gradient(180deg, rgba(10,10,12,0.8) 0%, rgba(10,10,12,0.4) 100%)",
        position: "relative",
        zIndex: 10,
        gap: "10px",
        boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
      }}>

        {/* ── Mobile: hamburger menu button (always visible on mobile) ────── */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {isMobile && (
          <motion.button
            id="mobile-menu-btn"
            onClick={onMenuClick}
            whileTap={{ scale: 0.90 }}
            aria-label="Open sidebar menu"
            title="Open Menu"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
              color: "rgba(255,255,255,0.65)",
              transition: "all 200ms",
            }}
          >
            <Menu size={17} />
          </motion.button>
        )}

        {/* ── Desktop: Expand sidebar button (only shown when collapsed) ─── */}
        {!isMobile && (
          <AnimatePresence>
            {isSidebarCollapsed && (
              <motion.button
                key="expand-btn"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover="hovered"
                whileTap={{ scale: 0.90 }}
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Sidebar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Hover glow */}
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
                {/* 3-line expand SVG — lines grow right on hover */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <motion.rect
                    x="0" y="0" width="10" height="1.8" rx="0.9"
                    fill="rgba(255,255,255,0.55)"
                    variants={{
                      idle:    { width: 10, fill: "rgba(255,255,255,0.55)" },
                      hovered: { width: 16, fill: "rgba(167,139,250,0.9)" },
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
                    x="0" y="10.2" width="10" height="1.8" rx="0.9"
                    fill="rgba(255,255,255,0.55)"
                    variants={{
                      idle:    { width: 10, fill: "rgba(255,255,255,0.55)" },
                      hovered: { width: 16, fill: "rgba(167,139,250,0.9)" },
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        )}
        </div>

        {/* Center — live clock on landing, chat title in conversation */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {isLandingPage || !prevChats.find(c => c.role === "user") ? (
              // ── Live clock ──────────────────────────────────────────────
              <motion.div
                key="clock"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", alignItems: "baseline", gap: "7px", userSelect: "none" }}
              >
                <span style={{
                  fontSize: "14px", fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.02em",
                }}>
                  {clockTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.03em",
                }}>
                  {clockTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </motion.div>
            ) : (
              // ── Chat title ──────────────────────────────────────────────
              (() => {
                const firstUserMsg = prevChats.find(c => c.role === "user")?.content ?? "";
                const title = firstUserMsg.length > 38
                  ? firstUserMsg.slice(0, 38).trimEnd() + "…"
                  : firstUserMsg;
                return (
                  <motion.span
                    key={title}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.22 }}
                    style={{
                      fontSize: "13px", fontWeight: 600,
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "0.01em", userSelect: "none",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", maxWidth: "360px",
                    }}
                  >
                    {title}
                  </motion.span>
                );
              })()
            )}
          </AnimatePresence>
        </div>



        {/* Right tools (Search, Status Orb & Logout) */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
          
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            title="Search Chat"
            style={{
              width: "32px", height: "32px",
              borderRadius: "9px", border: "none",
              background: "transparent", color: "rgba(255,255,255,0.65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "color 0.2s",
              padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
          >
            <Search size={16} />
          </motion.button>

          <motion.div
            style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: loading ? "#c084fc" : "#34d399",
              boxShadow: loading ? "0 0 10px #c084fc" : "0 0 8px #34d399",
            }}
            animate={{
              scale: loading ? [1, 1.4, 1] : [1, 1.1, 1],
              opacity: loading ? [0.6, 1, 0.6] : [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: loading ? 1.2 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            title={loading ? "AI is generating..." : "Connected & Ready"}
          />

          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.15)", borderRadius: "1px" }} />

          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            title="Log Out"
            style={{
              width: "32px", height: "32px",
              borderRadius: "9px", border: "none",
              background: "transparent", color: "rgba(255,255,255,0.65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "color 0.2s",
              padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ff4d4d"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
          >
            <LogOut size={16} />
          </motion.button>
        </div>

        {/* ── Search Overlay ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              key="search-overlay"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "6px", left: "16px", right: "16px",
                minHeight: "44px",
                background: "rgba(10,10,12,0.95)",
                backdropFilter: "blur(24px)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                zIndex: 50,
                display: "flex", flexDirection: "column",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", height: "44px", padding: "0 12px", gap: "10px", width: "100%", boxSizing: "border-box" }}>
                <Search size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
                <input 
                  autoFocus
                  placeholder={isLandingPage ? "Global search in past conversations..." : "Search in current chat..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "#fff", fontSize: "14px", fontWeight: 500
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    } else if (e.key === "Enter") {
                      if (isLandingPage && globalSearchResults.length > 0) {
                        handleSelectThread(globalSearchResults[0].threadId);
                      } else if (!isLandingPage && localSearchResults.length > 0) {
                        setIsSearchOpen(false);
                        setHighlightQuery(searchQuery);
                        setSearchQuery("");
                        setTimeout(() => {
                          const el = document.getElementById(`msg-${localSearchResults[0].index}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  style={{ 
                    background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "6px",
                    color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Unified Search Dropdown */}
              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", width: "100%" }}
                  >
                     <div style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}>
                        {isLandingPage ? (
                          // GLOBAL RESULTS
                          isSearchingGlobal ? (
                            <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Searching across all chats...</div>
                          ) : globalSearchResults.length > 0 ? (
                             globalSearchResults.map(t => (
                               <div 
                                 key={t.threadId}
                                 onClick={() => handleSelectThread(t.threadId)}
                                 style={{ padding: "10px 12px", cursor: "pointer", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}
                                 onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                 onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                               >
                                  <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t.title || "Untitled Chat"}</span>
                                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{new Date(t.updatedAt).toLocaleDateString()} - Click to view</span>
                               </div>
                             ))
                          ) : (
                            <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No past chats contain "{searchQuery}"</div>
                          )
                        ) : (
                          // LOCAL RESULTS
                          localSearchResults.length > 0 ? (
                            localSearchResults.map(({ chat, index }) => {
                              const snippet = chat.content.length > 60 ? chat.content.substring(0, 60) + "..." : chat.content;
                              return (
                               <div 
                                 key={index}
                                 onClick={() => {
                                   setIsSearchOpen(false);
                                   setHighlightQuery(searchQuery);
                                   setSearchQuery("");
                                   setTimeout(() => {
                                      const el = document.getElementById(`msg-${index}`);
                                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                   }, 100);
                                 }}
                                 style={{ padding: "10px 12px", cursor: "pointer", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}
                                 onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                 onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                               >
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(167,139,250,0.9)", textTransform: "uppercase" }}>{chat.role}</span>
                                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{snippet}</span>
                               </div>
                              )
                            })
                          ) : (
                            <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No matches in this chat</div>
                          )
                        )}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat area (messages + hero) ──────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}>

        <Chat 
          isMobile={isMobile} 
          searchQuery={searchQuery} 
          highlightQuery={highlightQuery} 
          isSearchOpen={isSearchOpen} 
        />

        {/* Loading indicator — floating toast */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                padding: "1.5px", // For gradient border
                borderRadius: "99px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.01))",
                overflow: "hidden",
                boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
              }}
            >
              {/* Spinning inner gradient border */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: "-100%",
                  background: "conic-gradient(from 0deg, transparent 0 280deg, #818cf8 320deg, #c084fc 360deg)",
                  zIndex: 0,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                borderRadius: "99px",
                background: "rgba(10,10,12,0.95)",
                backdropFilter: "blur(20px)",
                position: "relative",
                zIndex: 1,
                whiteSpace: "nowrap",
              }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 10px rgba(168,85,247,0.3)", "0 0 20px rgba(168,85,247,0.6)", "0 0 10px rgba(168,85,247,0.3)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: "26px", height: "26px", borderRadius: "8px",
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "10px", fontWeight: 900, letterSpacing: "-0.04em" }}>Nx</span>
                </motion.div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  <span>Thinking</span>
                  <div style={{ display: "flex", gap: "3px" }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <ChatInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={getReply}
        loading={loading}
        hasMessages={!newChat || prevChats.length > 0}
        isMobile={isMobile}
      />
    </div>
  );
}

export default ChatWindow;
