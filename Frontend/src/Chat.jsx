import { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import HeroSection from "./components/chat/HeroSection.jsx";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";

const formatText = (text) =>
  text
    ?.replace(/\u202f/g, " ")
    ?.replace(/\n{3,}/g, "\n\n")
    ?.replace(/\n\s*\n/g, "\n\n")
    ?.trim();

// Highlight helper for visual search feedback (User messages)
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const words = highlight.split(/\s+/).filter(Boolean);
  if (words.length === 0) return <>{text}</>;
  const regexPattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(${regexPattern})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        words.some(w => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} style={{ background: "rgba(167,139,250,0.6)", color: "#fff", borderRadius: "3px", padding: "0 2px" }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

// Custom Rehype Plugin for highlighting in Markdown (AI messages)
const rehypeHighlightWords = (options) => {
  return (tree) => {
    if (!options || !options.query) return;
    const words = options.query.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    const regexPattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${regexPattern})`, 'gi');

    const walk = (node, parent, index) => {
      if (node.type === 'text' && parent && parent.tagName !== 'code' && parent.tagName !== 'mark') {
        const parts = node.value.split(regex);
        if (parts.length > 1) {
          const newNodes = parts.map((part) => {
            if (words.some(w => w.toLowerCase() === part.toLowerCase())) {
              return {
                type: 'element',
                tagName: 'mark',
                properties: { style: 'background: rgba(167,139,250,0.6); color: #fff; border-radius: 3px; padding: 0 2px;' },
                children: [{ type: 'text', value: part }]
              };
            }
            return { type: 'text', value: part };
          });
          parent.children.splice(index, 1, ...newNodes);
          return newNodes.length; // skip added nodes
        }
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const skip = walk(node.children[i], node, i);
          if (skip) i += skip - 1;
        }
      }
      return 0;
    };
    walk(tree, null, 0);
  };
};

// Typing indicator component
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "0 0 4px" }}
    >
      {/* AI Avatar */}
      <motion.div
        animate={{ boxShadow: ["0 0 10px rgba(139,92,246,0.3)", "0 0 25px rgba(139,92,246,0.7)", "0 0 10px rgba(139,92,246,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: "30px", height: "30px", borderRadius: "9px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: "2px",
        }}
      >
        <span style={{ color: "#fff", fontSize: "10px", fontWeight: 900, letterSpacing: "-0.04em" }}>Nx</span>
      </motion.div>
      <div className="msg-ai" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </motion.div>
  );
}

// Individual message component
function ChatMessage({ chat, index, isLast, isTyping, latestReply, isMobile, searchQuery, highlightQuery }) {
  const [copied, setCopied] = useState(false);
  const isUser = chat.role === "user";

  const handleCopy = () => {
    const content = isLast && isTyping ? latestReply : chat.content;
    navigator.clipboard.writeText(content || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayContent = isLast && isTyping ? latestReply : chat.content;

  return (
    <motion.div
      id={`msg-${index}`}
      layout
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "6px",
      }}
    >
      {/* Message row */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        flexDirection: isUser ? "row-reverse" : "row",
        width: "100%",
      }}>
        {/* Avatar */}
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "9px",
          background: isUser
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: "2px",
          border: isUser
            ? "1px solid rgba(139,92,246,0.28)"
            : "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: isUser
            ? "0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "none",
        }}>
          {isUser
            ? <span style={{ color: "#fff", fontSize: "11px", fontWeight: 800 }}>U</span>
            : <span style={{ color: "#fff", fontSize: "10px", fontWeight: 900, letterSpacing: "-0.04em" }}>Nx</span>
          }
        </div>

        {/* Bubble */}
        {isUser ? (
          <div className="msg-user">
            <HighlightText text={chat.content} highlight={highlightQuery} />
          </div>
        ) : (
          <div className="msg-ai">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, [rehypeHighlightWords, { query: highlightQuery }]]}
            >
              {formatText(displayContent) || ""}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Action buttons for AI messages */}
      {!isUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", gap: "4px", marginLeft: isMobile ? "28px" : "40px" }}
        >
          {[
            { id: `copy-${index}`, Icon: copied ? Check : Copy,  label: copied ? "Copied!" : "Copy",        action: handleCopy, active: copied },
            { id: `like-${index}`,   Icon: ThumbsUp,              label: "Helpful",                           action: () => {} },
            { id: `dislike-${index}`,Icon: ThumbsDown,            label: "Not helpful",                       action: () => {} },
          ].map(({ id, Icon, label, action, active }) => (
            <motion.button
              key={id} id={id}
              whileHover={{ scale: 1.08, backgroundColor: active ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.92 }}
              onClick={action}
              aria-label={label}
              title={label}
              style={{
                width: "28px", height: "28px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: active ? "rgba(239,68,68,0.10)" : "rgba(255,255,255,0.03)",
                color: active ? "#EF4444" : "rgba(255,255,255,0.32)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 150ms",
              }}
            >
              <Icon size={11} />
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function Chat({ isMobile, searchQuery = "", highlightQuery = "", isSearchOpen = false }) {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const bottomRef = useRef(null);

  // ── Existing typing animation logic ──────────────────────────────────────
  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }
    if (!prevChats.length) return;

    const content = reply.split(" ");
    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, reply]);
  // ─────────────────────────────────────────────────────────────────────────

  // Auto scroll logic (to search result or bottom)
  useEffect(() => {
    if (highlightQuery && !isSearchOpen) {
      const queryWords = highlightQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const matchIndex = prevChats.findIndex(chat => {
        if (!chat.content) return false;
        const text = chat.content.toLowerCase();
        return queryWords.every(word => text.includes(word));
      });

      if (matchIndex !== -1) {
        setTimeout(() => {
          const el = document.getElementById(`msg-${matchIndex}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats, latestReply, highlightQuery, isSearchOpen]);

  // Show hero when new chat with no messages
  if (newChat && prevChats.length === 0) {
    return <HeroSection />;
  }

  return (
    <div
      className="chat-messages-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: isMobile ? "14px 12px 8px" : "20px 24px 8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{
        maxWidth: isMobile ? "100%" : "820px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "20px" : "28px",
        paddingBottom: "8px",
        boxSizing: "border-box",
      }}>
        <AnimatePresence>
          {prevChats
            .map((chat, originalIndex) => ({ chat, originalIndex }))
            .map(({ chat, originalIndex }) => {
              const isLast = originalIndex === prevChats.length - 1;
              const isTyping = isLast && latestReply !== null;

              const activeHighlight = isSearchOpen ? searchQuery : highlightQuery;

              return (
                <ChatMessage
                  key={originalIndex}
                  chat={chat}
                  index={originalIndex}
                  isLast={isLast}
                  isTyping={isTyping}
                  latestReply={latestReply}
                  isMobile={isMobile}
                  searchQuery={searchQuery}
                  highlightQuery={activeHighlight}
                />
              );
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default Chat;
