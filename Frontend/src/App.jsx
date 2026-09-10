import "./index.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect, useContext } from "react";
import { v1 as uuidv1 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContext } from "./context/AuthContext.jsx";
import Auth from "./components/auth/Auth.jsx";

function App() {
  const { token } = useContext(AuthContext);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  // Global mouse tracking for the 3D ambient glow effect
  useEffect(() => {
    const handler = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Responsive: track mobile breakpoint with resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      // Auto-close sidebar overlay when resizing up to desktop
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
  };

  return (
    <MyContext.Provider value={providerValues}>

      {/* ── AnimatedAIChat exact blob background ──────────────────────────── */}
      {/* Fixed layer sits at z-index 0, behind everything */}
      <div
        aria-hidden="true"
        className="ai-bg-layer"
      >
        {/* Violet — top-left, 0s delay */}
        <div className="ai-blob ai-blob-violet" />
        {/* Indigo — bottom-right, 0.7s delay */}
        <div className="ai-blob ai-blob-indigo" />
        {/* Fuchsia — mid-right, 1.0s delay */}
        <div className="ai-blob ai-blob-fuchsia" />
      </div>

      {!token ? (
        <Auth />
      ) : (
        <>
          {/* ── 3D ambient mouse-tracking glow (desktop only — no cursor on touch) */}
      {!isMobile && (
        <motion.div
          aria-hidden="true"
          className="ai-mouse-glow"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 120,
            mass: 0.8,
          }}
        />
      )}

      {/* ── App layout — sits above background ───────────────────────────── */}
      <div
        id="app-root"
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Mobile overlay — dark backdrop when sidebar is open */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(4,3,6,0.65)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 45,
              }}
              className="sidebar-overlay"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />

        {/* Main content */}
        <main
          id="main-content"
          role="main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
            position: "relative",
          }}
        >
          <ChatWindow
            onMenuClick={() => setSidebarOpen((p) => !p)}
            isSidebarCollapsed={isMobile ? false : isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            isMobile={isMobile}
          />
          </main>
        </div>
        </>
      )}
    </MyContext.Provider>
  );
}

export default App;
