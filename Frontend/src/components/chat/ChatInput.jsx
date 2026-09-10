import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendIcon, Paperclip, Command, LoaderIcon, FileText,
  MonitorIcon, Sparkles, Code2, XIcon,
} from "lucide-react";
import { cn } from "../../lib/utils.js";

// ── Auto-resize textarea hook ─────────────────────────────────────────────────
function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback((reset) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (reset) { ta.style.height = `${minHeight}px`; return; }
    ta.style.height = `${minHeight}px`;
    ta.style.height = Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity)) + "px";
  }, [minHeight, maxHeight]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) ta.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handler = () => adjustHeight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

// ── Animated typing dots ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", marginLeft: "4px" }}>
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          style={{
            width: "6px", height: "6px",
            background: "rgba(255,255,255,0.85)",
            borderRadius: "50%",
            margin: "0 2px",
            boxShadow: "0 0 4px rgba(255,255,255,0.25)",
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Command suggestions ───────────────────────────────────────────────────────
const COMMAND_SUGGESTIONS = [
  { icon: Code2,       label: "Generate Code", description: "Write code in any language",    prefix: "/code"    },
  { icon: Sparkles,    label: "Improve",       description: "Enhance and refine content",    prefix: "/improve" },
  { icon: MonitorIcon, label: "Create Page",   description: "Generate a new web page",       prefix: "/page"    },
  { icon: FileText,    label: "Summarize",     description: "Summarize long text/documents", prefix: "/summarize" },
];

export default function ChatInput({ prompt, setPrompt, onSend, loading, hasMessages = false, isMobile = false }) {
  const [attachments, setAttachments]         = useState([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion]     = useState(-1);
  const [inputFocused, setInputFocused]         = useState(false);
  const [mousePosition, setMousePosition]       = useState({ x: 0, y: 0 });
  const commandPaletteRef = useRef(null);

  const minH = hasMessages ? 36 : 60;
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: minH, maxHeight: 200 });

  // Mouse tracking for glow effect
  useEffect(() => {
    const handler = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Command palette logic
  useEffect(() => {
    if (prompt.startsWith("/") && !prompt.includes(" ")) {
      setShowCommandPalette(true);
      const idx = COMMAND_SUGGESTIONS.findIndex((c) => c.prefix.startsWith(prompt));
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [prompt]);

  // Close palette on outside click
  useEffect(() => {
    const handler = (e) => {
      const btn = document.querySelector("[data-command-button]");
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(e.target) && !btn?.contains(e.target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync textarea height when prompt changes; force-reset when it clears after a send
  useEffect(() => {
    if (prompt === "") {
      adjustHeight(true); // hard reset to minHeight after send
    } else {
      adjustHeight();
    }
  }, [prompt]);

  const selectCommand = (index) => {
    setPrompt(COMMAND_SUGGESTIONS[index].prefix + " ");
    setShowCommandPalette(false);
  };

  const handleKeyDown = (e) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown")          { e.preventDefault(); setActiveSuggestion((p) => (p < COMMAND_SUGGESTIONS.length - 1 ? p + 1 : 0)); }
      else if (e.key === "Arrow ")       { e.preventDefault(); setActiveSuggestion((p) => (p > 0 ? p - 1 : COMMAND_SUGGESTIONS.length - 1)); }
      else if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); if (activeSuggestion >= 0) selectCommand(activeSuggestion); }
      else if (e.key === "Escape")        { e.preventDefault(); setShowCommandPalette(false); }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleAttach = () => setAttachments((p) => [...p, `file-${Math.floor(Math.random() * 999)}.pdf`]);
  const removeAttachment = (i) => setAttachments((p) => p.filter((_, idx) => idx !== i));

  const canSend = prompt.trim() && !loading;

  return (
    <div style={{
      flexShrink: 0,
      padding: hasMessages
        ? (isMobile ? "4px 10px 10px" : "4px 16px 10px")
        : (isMobile ? "8px 12px 14px" : "10px 20px 20px"),
      width: "100%",
      transition: "padding 300ms ease",
    }}>
      <div style={{
        maxWidth: isMobile ? "100%" : "760px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        boxSizing: "border-box",
        minWidth: 0,
      }}>

        {/* ── Quick command chips — hidden when chatting ─────────────────── */}
        <AnimatePresence initial={false}>
          {!hasMessages && (
            <motion.div
              key="chips"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                overflow: "hidden",
                width: "100%",
              }}
            >
              {COMMAND_SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.prefix}
                    onClick={() => selectCommand(i)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 11px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 200ms",
                    }}
                    whileHover={{
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.8)",
                      borderColor: "rgba(255,255,255,0.10)",
                    }}
                  >
                    <Icon size={12} />
                    {s.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main card — AnimatedAIChat style ─────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "relative",
            zIndex: 10,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            transition: "border-color 250ms, box-shadow 250ms",
          }}
          className="animated-ai-card"
        >
          {/* ── Command palette ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {showCommandPalette && (
              <motion.div
                ref={commandPaletteRef}
                style={{
                  position: "absolute",
                  left: "12px", right: "12px",
                  bottom: "calc(100% + 8px)",
                  zIndex: 50,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(10,10,12,0.95)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
                  overflow: "hidden",
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <div style={{ padding: "4px" }}>
                  {COMMAND_SUGGESTIONS.map((s, i) => {
                    const Icon = s.icon;
                    const active = activeSuggestion === i;
                    return (
                      <motion.div
                        key={s.prefix}
                        onClick={() => selectCommand(i)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: active ? "rgba(255,255,255,0.08)" : "transparent",
                          color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.5)",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = active ? "rgba(255,255,255,0.08)" : "transparent";
                          e.currentTarget.style.color = active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.5)";
                        }}
                      >
                        <div style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>
                          <Icon size={14} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>{s.label}</span>
                        {!isMobile && (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "2px" }}>{s.prefix}</span>
                        )}
                        {!isMobile && (
                          <span style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(255,255,255,0.22)" }}>{s.description}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Textarea ────────────────────────────────────────────────────── */}
          <div style={{ padding: hasMessages ? "6px 14px 0" : "16px 18px 0", transition: "padding 300ms" }}>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask Nexora AI anything… (type / for commands)"
              disabled={loading}
              aria-label="Chat message input"
              rows={1}
              style={{
                width: "100%",
                minHeight: hasMessages ? "36px" : "60px",
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                fontFamily: "inherit",
                /* 16px on mobile prevents iOS auto-zoom on focus */
                fontSize: isMobile ? "16px" : (hasMessages ? "13.5px" : "14.5px"),
                fontWeight: 400,
                color: "rgba(255,255,255,0.90)",
                lineHeight: 1.5,
                overflow: "hidden",
                caretColor: "#a5b4fc",
                transition: "font-size 200ms, min-height 300ms",
              }}
            />
          </div>

          {/* ── Attachments ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                style={{ padding: "0 16px 10px", display: "flex", gap: "6px", flexWrap: "wrap" }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {attachments.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.60)",
                    }}
                  >
                    <span>{file}</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 0 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                    >
                      <XIcon size={11} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div style={{
            padding: hasMessages ? "4px 8px 8px" : "10px 14px 14px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px",
            transition: "padding 300ms",
          }}>
            {/* Left: attach + command */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* <motion.button
                type="button"
                onClick={handleAttach}
                whileTap={{ scale: 0.93 }}
                aria-label="Attach file"
                style={{
                  width: hasMessages ? "28px" : "36px",
                  height: hasMessages ? "28px" : "36px",
                  borderRadius: "8px",
                  border: "none", background: "transparent",
                  color: "rgba(255,255,255,0.38)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                }}
              >
                <Paperclip size={hasMessages ? 13 : 15} />
              </motion.button> */}

              <motion.button
                type="button"
                data-command-button
                onClick={(e) => { e.stopPropagation(); setShowCommandPalette((p) => !p); }}
                whileTap={{ scale: 0.93 }}
                aria-label="Commands"
                style={{
                  width: hasMessages ? "28px" : "36px",
                  height: hasMessages ? "28px" : "36px",
                  borderRadius: "8px",
                  border: "none",
                  background: showCommandPalette ? "rgba(255,255,255,0.09)" : "transparent",
                  color: showCommandPalette ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms",
                }}
                onMouseEnter={(e) => {
                  if (!showCommandPalette) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.82)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showCommandPalette) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                  }
                }}
              >
                <Command size={hasMessages ? 13 : 15} />
              </motion.button>
            </div>

            {/* Right: send button */}
            <motion.button
              type="button"
              id="send-btn"
              onClick={() => { if (canSend) onSend(); }}
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              aria-label="Send message"
              style={{
                display: "flex", alignItems: "center",
                gap: hasMessages ? "0" : "7px",
                padding: hasMessages ? "6px 10px" : "8px 18px",
                borderRadius: hasMessages ? "9px" : "11px",
                border: "none",
                background: canSend ? "linear-gradient(135deg, #a855f7, #6366f1)" : "rgba(255,255,255,0.05)",
                color: canSend ? "#ffffff" : "rgba(255,255,255,0.25)",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                cursor: canSend ? "pointer" : "not-allowed",
                transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: canSend ? "0 4px 20px rgba(168,85,247,0.4), inset 0 1px 1px rgba(255,255,255,0.2)" : "none",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Add a shimmer on the button */}
              {canSend && (
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0, width: "30%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    transform: "skewX(-20deg)",
                  }}
                  animate={{ left: ["-50%", "150%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
              )}
              {loading
                ? <LoaderIcon size={13} style={{ animation: "spin 1.5s linear infinite", position: "relative", zIndex: 1 }} />
                : <SendIcon size={13} style={{ position: "relative", zIndex: 1 }} />
              }
              {!hasMessages && <span style={{ position: "relative", zIndex: 1 }}>Send</span>}
            </motion.button>
          </div>
        </motion.div>

        {/* Footer — only shown on hero/new chat */}
        {!hasMessages && (
          <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "8px 0 0" }}>
            Nexora AI can make mistakes. Verify important information.
          </p>
        )}
      </div>

      {/* Mouse glow when input is focused — desktop only (no cursor on touch devices) */}
      <AnimatePresence>
        {inputFocused && !isMobile && (
          <motion.div
            style={{
              position: "fixed",
              width: "640px", height: "640px",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
              opacity: 0.025,
              background: "radial-gradient(circle, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.5) 50%, transparent 70%)",
              filter: "blur(72px)",
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{ x: mousePosition.x, y: mousePosition.y }}
            transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Global spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animated-ai-card:focus-within {
          border-color: rgba(167,139,250,0.5) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            0 24px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 45px rgba(167,139,250,0.3) !important;
        }
      `}</style>
    </div>
  );
}
