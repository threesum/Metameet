import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  const location = useLocation();
  const isRoomPage = location.pathname === "/room";

  return (
    <div className={isRoomPage ? "" : "min-h-screen bg-theme-primary text-theme-primary"}>
      <Navbar />
      <main className={isRoomPage ? "" : "relative"}>
        <Outlet />
      </main>
    </div>
  );
};

export default App;
