import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa";
import socket from "../socket";

const Room = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 100, y: 120 });
  const [players, setPlayers] = useState({});
  const movementSpeed = 10;

  // Get the logged-in user
  const user = JSON.parse(localStorage.getItem("metameet-user"));

  useEffect(() => {
    // Join room
    socket.emit("join-room", "room-1");

    // Add existing players
    socket.on("all-players", (all) => {
      setPlayers(all);
    });

    // New player joins
    socket.on("user-joined", (newPlayer) => {
      setPlayers((prev) => ({
        ...prev,
        [newPlayer.id]: newPlayer,
      }));
    });

    // Player leaves
    socket.on("user-left", (id) => {
      setPlayers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    });

    // Movement
    const handleKeyDown = (e) => {
      setPosition((prev) => {
        const updated = { ...prev };
        switch (e.key) {
          case "ArrowUp":
            updated.y -= movementSpeed;
            break;
          case "ArrowDown":
            updated.y += movementSpeed;
            break;
          case "ArrowLeft":
            updated.x -= movementSpeed;
            break;
          case "ArrowRight":
            updated.x += movementSpeed;
            break;
          default:
            return prev;
        }
        return updated;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-theme-primary relative overflow-hidden">
      {/* Exit Room Button */}
      <motion.button
        onClick={() => navigate('/dashboard')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-20 left-4 z-20 glass-panel glow-border soft-shadow px-4 py-3 rounded-xl hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] flex items-center space-x-2"
        aria-label="Exit room"
      >
        <FaSignOutAlt size={14} className="text-accent-gradient" />
        <span className="text-sm font-medium text-theme-primary">Exit Room</span>
      </motion.button>

      {/* Your Avatar */}
      <div
        className="absolute w-10 h-10 rounded shadow-lg transition-all duration-100"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          backgroundColor: 'var(--accent-start)'
        }}
      />

      {/* Other Players */}
      {Object.entries(players).map(([id, player]) =>
        id !== socket.id ? (
          <div
            key={id}
            className="absolute w-10 h-10 rounded shadow-lg"
            style={{ 
              transform: `translate(${player.x}px, ${player.y}px)`,
              backgroundColor: 'var(--accent-end)'
            }}
          />
        ) : null
      )}
    </div>
  );
};

export default Room;
