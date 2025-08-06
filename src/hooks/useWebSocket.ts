import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketClient, disconnectWebSocket } from '@/lib/websocket';
import { useAuthStore } from '@/lib/auth';

interface WebSocketStatus {
  isConnected: boolean;
  reconnectAttempts: number;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  socket: any; // Exposed socket for direct access
  isConnected: boolean; // Convenience property
  ping: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Post methods
  notifyPostEditing: (postId: string, title: string) => void;
  notifyPostStopEditing: (postId: string) => void;
  
  // Page methods
  notifyPageEditing: (pageId: string, title: string) => void;
  notifyVisualBuilderUpdate: (pageId: string, components: any[]) => void;
  
  // Media methods
  notifyMediaUploadStart: (fileName: string) => void;
  
  // User status
  updateUserStatus: (status: 'active' | 'away' | 'busy') => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    reconnectAttempts: 0
  });
  
  const wsClientRef = useRef<ReturnType<typeof getWebSocketClient> | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize WebSocket connection
      wsClientRef.current = getWebSocketClient();
      
      // Set up connection status listeners
      const updateStatus = () => {
        if (wsClientRef.current) {
          setStatus(wsClientRef.current.getConnectionStatus());
        }
      };

      wsClientRef.current.on('connect', updateStatus);
      wsClientRef.current.on('disconnect', updateStatus);
      wsClientRef.current.on('connect_error', updateStatus);

      // Update initial status
      updateStatus();

      return () => {
        if (wsClientRef.current) {
          wsClientRef.current.off('connect', updateStatus);
          wsClientRef.current.off('disconnect', updateStatus);
          wsClientRef.current.off('connect_error', updateStatus);
        }
      };
    } else {
      // Disconnect when not authenticated
      disconnectWebSocket();
      wsClientRef.current = null;
      setStatus({ isConnected: false, reconnectAttempts: 0 });
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, []);

  const ping = useCallback(() => {
    wsClientRef.current?.ping();
  }, []);

  const disconnect = useCallback(() => {
    wsClientRef.current?.disconnect();
    setStatus({ isConnected: false, reconnectAttempts: 0 });
  }, []);

  const reconnect = useCallback(() => {
    wsClientRef.current?.reconnect();
  }, []);

  const notifyPostEditing = useCallback((postId: string, title: string) => {
    wsClientRef.current?.notifyPostEditing(postId, title);
  }, []);

  const notifyPostStopEditing = useCallback((postId: string) => {
    wsClientRef.current?.notifyPostStopEditing(postId);
  }, []);

  const notifyPageEditing = useCallback((pageId: string, title: string) => {
    wsClientRef.current?.notifyPageEditing(pageId, title);
  }, []);

  const notifyVisualBuilderUpdate = useCallback((pageId: string, components: any[]) => {
    wsClientRef.current?.notifyVisualBuilderUpdate(pageId, components);
  }, []);

  const notifyMediaUploadStart = useCallback((fileName: string) => {
    wsClientRef.current?.notifyMediaUploadStart(fileName);
  }, []);

  const updateUserStatus = useCallback((status: 'active' | 'away' | 'busy') => {
    wsClientRef.current?.updateUserStatus(status);
  }, []);

  return {
    status,
    socket: wsClientRef.current?.getSocket?.() || null,
    isConnected: status.isConnected,
    ping,
    disconnect,
    reconnect,
    notifyPostEditing,
    notifyPostStopEditing,
    notifyPageEditing,
    notifyVisualBuilderUpdate,
    notifyMediaUploadStart,
    updateUserStatus
  };
};

// Hook for listening to specific WebSocket events
export const useWebSocketEvent = <T>(
  event: string,
  callback: (data: T) => void,
  deps: any[] = []
) => {
  const { isAuthenticated } = useAuthStore();
  const wsClientRef = useRef<ReturnType<typeof getWebSocketClient> | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      wsClientRef.current = getWebSocketClient();
      wsClientRef.current.on(event as any, callback);

      return () => {
        wsClientRef.current?.off(event as any, callback);
      };
    }
  }, [isAuthenticated, event, ...deps]);
};

// Hook for real-time editing notifications
export const useEditingNotifications = () => {
  const [editingUsers, setEditingUsers] = useState<Map<string, { editor: string; title: string; timestamp: string }>>(new Map());

  useWebSocketEvent('post:being-edited', (data: { postId: string; title: string; editor: string; timestamp: string }) => {
    setEditingUsers(prev => new Map(prev.set(data.postId, {
      editor: data.editor,
      title: data.title,
      timestamp: data.timestamp
    })));
  });

  useWebSocketEvent('post:editing-stopped', (data: { postId: string; editor: string }) => {
    setEditingUsers(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.postId);
      return newMap;
    });
  });

  useWebSocketEvent('page:being-edited', (data: { pageId: string; title: string; editor: string; timestamp: string }) => {
    setEditingUsers(prev => new Map(prev.set(data.pageId, {
      editor: data.editor,
      title: data.title,
      timestamp: data.timestamp
    })));
  });

  return { editingUsers };
};

export default useWebSocket;