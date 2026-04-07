import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaSearch } from "react-icons/fa";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpaces = mockSpaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-theme-primary text-theme-primary overflow-hidden">
      {/* Background Elements */}
      <AuroraBackground />
      <AnimatedGrid />

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
