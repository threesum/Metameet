import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("metameet-user") || "{}");
  const isLoggedIn = user && user.username;

  const handleLogout = () => {
    localStorage.removeItem("metameet-user");
    navigate("/signin");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div className="glass-panel glow-border soft-shadow w-full max-w-6xl flex justify-between items-center px-6 py-4 rounded-2xl">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-accent-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] rounded-md"
            aria-label="Go to landing page"
          >
            MetaMeet
          </button>
          <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
           <motion.button
            onClick={toggleTheme}
            className="icon-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.4, ease: [0.4, 0.8, 0.3, 1] }}
              style={{ color: 'var(--accent-start)' }}
            >
              {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
            </motion.div>
          </motion.button> 

          {/* Conditional Auth/User Section */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)]"
                aria-label="User menu"
              >
                {user.username?.[0]?.toUpperCase() || "U"}
              </button>
            </div>
          ) : (
            <>
              {/* Auth Buttons */}
              <button 
                onClick={() => navigate("/signin")} 
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
            </>
          )}
          </div>
        </div>
      </motion.nav>

      {/* Dropdown rendered outside navbar structure */}
      {showUserDropdown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed right-4 top-20 w-48 glass-panel glow-border soft-shadow rounded-xl py-2 z-50"
          ref={dropdownRef}
        >
          <div className="px-4 py-2 border-b border-theme-secondary/20">
            <p className="text-sm font-medium text-theme-primary">{user.username || "User"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50 transition-colors flex items-center space-x-2"
          >
            <FaSignOutAlt size={14} />
            <span>Logout</span>
          </button>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
