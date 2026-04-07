import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaSignOutAlt } from 'react-icons/fa';
import PhaserGame from '../game/PhaserGame';

const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [copied, setCopied] = useState(false);

  const handleCopyRoomLink = async () => {
    if (!roomId) return;

    const roomLink = `${window.location.origin}/room/${roomId}`;

    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy room link", error);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0f0f1a] relative overflow-hidden flex items-center justify-center">
      <div className="fixed top-4 left-4 z-[1000] flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-md border border-white/15 px-3 py-2 text-sm text-white/90">
        <span>
          Room ID: <span className="font-semibold tracking-[0.2em] uppercase">{roomId}</span>
        </span>
        <button
          type="button"
          onClick={handleCopyRoomLink}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <FaCopy size={12} />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

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

      <PhaserGame roomId={roomId} />
    </div>
  );
};

export default Room;
