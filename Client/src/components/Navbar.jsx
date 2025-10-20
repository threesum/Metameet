import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (menuOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        <div className="glass-panel glow-border soft-shadow w-full max-w-6xl flex items-center justify-between px-6 py-4 rounded-2xl overflow-visible">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-accent-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] rounded-md cursor-pointer"
            aria-label="Go to landing page"
          >
            MetaMeet
          </button>

          {isAuthenticated ? (
            <div
              ref={profileRef}
              className="relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background text-lg font-bold cursor-pointer hover:scale-105 transition-transform">
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

      {/* Dropdown Portal - Fixed positioning outside navbar */}
      {isAuthenticated && (
        <AnimatePresence>
          {menuOpen && dropdownPos && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed w-48 rounded-xl shadow-2xl z-[999] p-4 text-sm pointer-events-auto bg-white dark:bg-black border border-secondary/60"
              style={{
                top: `${dropdownPos.top}px`,
                right: `${dropdownPos.right}px`
              }}
            >
              <div className="font-semibold text-text mb-1 truncate">
                {user?.displayName || user?.username || user?.email || "User"}
              </div>
              <div className="text-xs text-gray-500 mb-3 capitalize truncate">
                {user?.role || "User"}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md bg-accent text-background hover:opacity-90 transition"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default Navbar;
