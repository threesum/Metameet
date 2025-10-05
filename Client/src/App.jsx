import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  const location = useLocation();
  const isRoomPage = location.pathname === "/room";
  const isLandingPage = location.pathname === "/";
  const isDashboardPage = location.pathname === "/dashboard";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  // Only hide navbar on dashboard page (it has its own header)
  const hideNavbar = isDashboardPage;

  return (
    <AuthProvider>
      <div className={isRoomPage ? "" : "min-h-screen bg-theme-primary text-theme-primary"}>
        {!hideNavbar && <Navbar />}
        <main className={
          isRoomPage ? "" : 
          isDashboardPage ? "relative" :
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
