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
  const dropdownRef = useRef(null); // wrapper of dropdown for outside click detection
  const profileBtnRef = useRef(null); // avatar button ref for positioning
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const user = JSON.parse(localStorage.getItem("metameet-user") || "{}");
  const isLoggedIn = user && user.username;

  const handleLogout = () => {
    localStorage.removeItem("metameet-user");
    navigate("/login");
  };

  // Close dropdown when clicking outside & reposition on resize/scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };

    const computePosition = () => {
      if (!profileBtnRef.current) return;
      const rect = profileBtnRef.current.getBoundingClientRect();
      // Desired dropdown width (matches w-48 -> 12rem -> 192px)
      const dropdownWidth = 192;
      const padding = 8; // gap below avatar
      let left = rect.left + rect.width - dropdownWidth; // right-align to avatar
      left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));
      const top = rect.bottom + padding; // place below avatar overlapping nav visually
      setDropdownPos({ top, left });
    };

    if (showUserDropdown) {
      computePosition();
      window.addEventListener('resize', computePosition);
      window.addEventListener('scroll', computePosition, true);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [showUserDropdown]);

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
            <button
              ref={profileBtnRef}
              onClick={() => setShowUserDropdown(prev => !prev)}
              className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] relative"
              aria-label="User menu"
            >
              {user.username?.[0]?.toUpperCase() || "U"}
            </button>
          ) : (
            <>
              {/* Auth Buttons */}
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
            </>
          )}
          </div>
        </div>
      </motion.nav>

      {showUserDropdown && isLoggedIn && (
        <motion.div
          ref={dropdownRef}
            // Using fixed & inline positioning so it doesn't affect navbar layout
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.16, ease: [0.4, 0.8, 0.3, 1] }}
          style={{ top: dropdownPos.top, left: dropdownPos.left, position: 'fixed' }}
          className="w-48 glass-panel glow-border soft-shadow rounded-xl py-2 z-[100] backdrop-blur-xl"
        >
          <div className="px-4 py-2 border-b border-theme-secondary/20">
            <p className="text-sm font-medium text-theme-primary truncate">{user.username || "User"}</p>
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
