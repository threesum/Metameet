import { useEffect, useState } from "react";
import socket from "../socket";

const getInitialConnectionState = () => {
  if (socket.connected) {
    return "connected";
  }

  return "connecting";
};

export default function useSocketStatus() {
  const [connectionState, setConnectionState] = useState(getInitialConnectionState);
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    const handleConnect = () => {
      setConnectionState("connected");
      setConnectionError("");
    };

    const handleConnectError = (error) => {
      setConnectionState("error");
      setConnectionError(error?.message || "Unable to reach the backend server.");
    };

    const handleDisconnect = () => {
      setConnectionState("connecting");
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    } else if (!socket.active) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    backendUrl: socket.io.uri,
    connectionState,
    connectionError,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
    hasConnectionError: connectionState === "error",
  };
}
