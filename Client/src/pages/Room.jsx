import React, { useEffect, useState } from "react";
import socket from "../socket";

const Room = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
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
      {/* Welcome Message */}
      <p className="absolute top-4 left-4 text-theme-primary font-semibold text-lg">
        👋 Welcome, {user?.username}
      </p>

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem("metameet-user");
          window.location.href = "/";
        }}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>

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
