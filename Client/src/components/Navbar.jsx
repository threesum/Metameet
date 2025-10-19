import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const DropdownPortal = ({ isOpen, position, user, onLogout, onMouseEnter, onMouseLeave }) => {
  if (!isOpen || !position) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed w-48 rounded-xl shadow-2xl z-[1000] p-4 text-sm pointer-events-auto bg-white dark:bg-black border border-secondary/60"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="font-semibold text-text mb-1 truncate">
        {user?.displayName || user?.username || user?.email || "User"}
      </div>
      <div className="text-xs text-gray-500 mb-3 capitalize truncate">
        {user?.role || "User"}
      </div>
      <button
        onClick={onLogout}
        className="w-full text-left px-3 py-2 rounded-md bg-accent text-background hover:opacity-90 transition"
      >
        Logout
      </button>
    </motion.div>,
    document.body
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (menuOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  const userInitial = (() => {
    const source = (user?.displayName || user?.username || user?.email || "").trim();
    return source ? source[0].toUpperCase() : "U";
  })();

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="glass-panel glow-border soft-shadow w-full max-w-6xl flex items-center justify-between px-6 py-4 rounded-2xl">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-accent-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] rounded-md"
            aria-label="Go to landing page"
          >
            MetaMeet
          </button>

          {isAuthenticated ? (
            <div
              ref={profileRef}
              className="relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background text-lg font-bold cursor-pointer">
                {userInitial}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="btn-base btn-primary btn-shine"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="btn-base btn-outline btn-shine"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {isAuthenticated && (
        <AnimatePresence>
          <DropdownPortal
            isOpen={menuOpen}
            position={dropdownPosition}
            user={user}
            onLogout={handleLogout}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          />
        </AnimatePresence>
      )}
    </>
  );
};

export default Navbar;
