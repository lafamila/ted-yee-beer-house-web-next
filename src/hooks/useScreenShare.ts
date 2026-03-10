'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3031`
    : 'http://localhost:3031');

interface ScreenSharerInfo {
  userId: string;
  displayName: string;
}

interface UseScreenShareOptions {
  projectId: string | null;
  onShareStarted?: (sharer: ScreenSharerInfo) => void;
  onShareStopped?: () => void;
}

interface UseScreenShareReturn {
  isConnected: boolean;
  sharer: ScreenSharerInfo | null;
  isCurrentUserSharing: boolean;
  startShare: () => void;
  stopShare: () => void;
}

export function useScreenShare({
  projectId,
  onShareStarted,
  onShareStopped,
}: UseScreenShareOptions): UseScreenShareReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sharer, setSharer] = useState<ScreenSharerInfo | null>(null);
  const [isCurrentUserSharing, setIsCurrentUserSharing] = useState(false);
  const currentProjectIdRef = useRef<string | null>(null);
  const onShareStartedRef = useRef(onShareStarted);
  const onShareStoppedRef = useRef(onShareStopped);

  useEffect(() => {
    onShareStartedRef.current = onShareStarted;
  }, [onShareStarted]);

  useEffect(() => {
    onShareStoppedRef.current = onShareStopped;
  }, [onShareStopped]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) return;

    const socket = io(WS_URL, {
      path: '/api/socket.io/',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (currentProjectIdRef.current) {
        socket.emit('joinProject', { projectId: currentProjectIdRef.current });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on(
      'screenShareStatus',
      (data: {
        projectId: string;
        isSharing: boolean;
        sharer: ScreenSharerInfo | null;
      }) => {
        if (currentProjectIdRef.current !== data.projectId) return;
        if (data.isSharing && data.sharer) {
          setSharer(data.sharer);
        } else {
          setSharer(null);
          setIsCurrentUserSharing(false);
        }
      },
    );

    socket.on(
      'screenShareStarted',
      (data: { projectId: string; sharer: ScreenSharerInfo }) => {
        if (currentProjectIdRef.current !== data.projectId) return;
        setSharer(data.sharer);
        onShareStartedRef.current?.(data.sharer);
      },
    );

    socket.on('screenShareStopped', (data: { projectId: string }) => {
      if (currentProjectIdRef.current && currentProjectIdRef.current !== data.projectId) {
        return;
      }
      setSharer(null);
      setIsCurrentUserSharing(false);
      onShareStoppedRef.current?.();
    });

    socket.on('screenShareDenied', () => {
      setIsCurrentUserSharing(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const prevProjectId = currentProjectIdRef.current;

    if (socket?.connected && prevProjectId) {
      socket.emit('leaveProject', { projectId: prevProjectId });
    }

    if (projectId) {
      currentProjectIdRef.current = projectId;
      if (socket?.connected) {
        socket.emit('joinProject', { projectId });
      }
    } else {
      currentProjectIdRef.current = null;
      setSharer(null);
      setIsCurrentUserSharing(false);
    }
  }, [projectId]);

  const startShare = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !currentProjectIdRef.current) return;
    socket.emit('startScreenShare', { projectId: currentProjectIdRef.current });
    setIsCurrentUserSharing(true);
  }, []);

  const stopShare = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !currentProjectIdRef.current) return;
    socket.emit('stopScreenShare', { projectId: currentProjectIdRef.current });
    setIsCurrentUserSharing(false);
  }, []);

  return { isConnected, sharer, isCurrentUserSharing, startShare, stopShare };
}
