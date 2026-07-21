import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAlertStore } from '../store/alertStore';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setLowStock, setExpiring } = useAlertStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('stock:low', (data: unknown[]) => setLowStock(data));
    socket.on('stock:expiring', (data: unknown[]) => setExpiring(data));

    return () => { socket.disconnect(); };
  }, [isAuthenticated, setLowStock, setExpiring]);

  return socketRef.current;
};
