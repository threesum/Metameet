import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  const location = useLocation();
  const isRoomPage = location.pathname === "/room";
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <AuthProvider>
      <div className={isRoomPage ? "" : "min-h-screen bg-theme-primary text-theme-primary"}>
        {!isRoomPage && <Navbar />}
        <main className={
          isRoomPage ? "" : 
          isLandingPage ? "relative" :
          isAuthPage ? "relative" :
          "relative pt-24 min-h-screen bg-theme-primary text-theme-primary"
        }>
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
