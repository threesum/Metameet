import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  // Hide navbar on room page
  if (location.pathname === "/room") {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-between items-center px-6 py-4 border-b border-theme bg-theme-surface backdrop-blur-md w-full"
    >
      <h1 className="text-2xl font-bold text-accent-gradient">MetaMeet</h1>
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-theme-surface border border-theme hover:opacity-80 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ color: 'var(--accent-start)' }}
          >
            {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
          </motion.div>
        </motion.button>

        {/* Auth Buttons */}
        <button 
          onClick={() => navigate("/signin")} 
          className="px-4 py-1 rounded bg-accent-gradient text-white hover:opacity-90 transition"
        >
          Login
        </button>
        <button 
          onClick={() => navigate("/signup")} 
          className="px-4 py-1 rounded border-2 border-theme bg-theme-surface text-theme-primary hover:bg-theme-primary hover:text-theme-surface transition-all duration-200"
        >
          Sign Up
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;