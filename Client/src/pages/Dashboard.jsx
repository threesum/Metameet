import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaSearch, FaCalendarAlt, FaStar, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import AuroraBackground from "../components/AuroraBackground";
import AnimatedGrid from "../components/AnimatedGrid";
import SpaceCard from "../components/SpaceCard";

const mockSpaces = [
  {
    id: 1,
    name: "GHS",
    thumbnail: "/api/placeholder/400/300",
    lastVisited: "today",
    isOwner: true,
    participants: 12,
    description: "School collaboration space"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Last Visited");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("metameet-user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("metameet-user");
    navigate("/login");
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

  const filteredSpaces = mockSpaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-theme-primary text-theme-primary overflow-hidden">
      {/* Background Elements */}
      <AuroraBackground />
      <AnimatedGrid />
      
      {/* Header */}
      <header className="relative z-10 glass-panel glow-border soft-shadow mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left - Brand & Navigation */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-accent-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] rounded-md"
              aria-label="Go to landing page"
            >
              MetaMeet
            </button>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-theme-secondary hover:text-theme-primary transition-colors">
                <FaCalendarAlt size={16} />
                <span>Events</span>
              </button>
              <button className="flex items-center space-x-2 text-accent-gradient font-medium">
                <FaStar size={16} />
                <span>My Spaces</span>
              </button>
            </nav>
          </div>

          {/* Right - User & Actions */}
          <div className="flex items-center space-x-4">
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)]"
                aria-label="User menu"
              >
                {user.username?.[0]?.toUpperCase() || "U"}
              </button>
              
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 glass-panel glow-border soft-shadow rounded-xl py-2"
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
            </div>

            <button 
              onClick={() => navigate('/room')}
              className="btn-base btn-primary btn-shine"
            >
              <FaPlus size={14} className="mr-2" />
              Create Space
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Content Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-4 mb-4">
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-theme-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-panel border-theme pl-12 pr-4 py-3 w-80 rounded-xl text-sm placeholder-theme-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] transition-all"
              />
            </div>
          </div>

          {/* Spaces Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredSpaces.map((space, index) => (
              <SpaceCard key={space.id} space={space} delay={index * 0.1} />
            ))}
            
            {/* Create New Space Card */}
            <motion.button
              onClick={() => navigate('/room')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: filteredSpaces.length * 0.1 }}
              className="glass-panel glow-border soft-shadow p-8 rounded-2xl hover:opacity-80 transition-all group"
            >
              <div className="flex flex-col items-center justify-center text-center h-48">
                <div className="w-16 h-16 rounded-full bg-accent-gradient/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FaPlus size={24} className="text-accent-gradient" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create New Space</h3>
                <p className="text-sm text-theme-secondary">Start a new collaborative environment</p>
              </div>
            </motion.button>
          </motion.div>

          {/* Empty State */}
          {filteredSpaces.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <FaSearch size={48} className="mx-auto text-theme-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">No spaces found</h3>
              <p className="text-theme-secondary">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;