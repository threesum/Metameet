import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import PhaserGame from '../game/PhaserGame';

const Room = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-[#0f0f1a] relative overflow-hidden flex items-center justify-center">
      <div className="fixed top-4 right-4 z-[1000]">
        <motion.button
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white flex items-center justify-center hover:bg-white/15 hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Exit room"
          type="button"
        >
          <FaSignOutAlt size={16} />
        </motion.button>
      </div>

      <PhaserGame />
    </div>
  );
};

export default Room;
