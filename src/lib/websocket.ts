import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface WebSocketEvents {
  // Post events
  'post:being-edited': (data: { postId: string; title: string; editor: string; timestamp: string }) => void;
  'post:editing-stopped': (data: { postId: string; editor: string; timestamp: string }) => void;
  'comment:created': (data: any) => void;

  // Page events
  'page:being-edited': (data: { pageId: string; title: string; editor: string; timestamp: string }) => void;
  'page:visual-builder-update': (data: { pageId: string; components: any[]; editor: string; timestamp: string }) => void;

  // Media events
  'media:upload-progress': (data: { fileName: string; progress: number; status: string }) => void;

  // User events
  'user:status-update': (data: { userId: string; status: string; timestamp: string }) => void;

  // System events
  'system:pong': (data: { timestamp: string; connectedUsers: number }) => void;

  // Connection events
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<keyof WebSocketEvents, ((...args: any[]) => void)[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const token = Cookies.get('cms_token');
    
    if (!token) {
      console.warn('No authentication token found, WebSocket connection skipped');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    
    this.socket = io(wsUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnect');
      
      // Auto-reconnect if connection was lost unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect automatically
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, Math.pow(2, this.reconnectAttempts) * 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connect_error', error);
    });

    // Set up all event listeners
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        this.socket?.on(event as string, listener);
      });
    });
  }

  // Event subscription methods
  public on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)?.push(callback);
    
    // If socket is already connected, add the listener immediately
    if (this.socket && this.isConnected) {
      this.socket.on(event as string, callback);
    }
  }

  public off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      
      if (this.socket && this.isConnected) {
        this.socket.off(event as string, callback);
      }
    } else {
      // Remove all listeners for this event
      this.eventListeners.delete(event);
      
      if (this.socket && this.isConnected) {
        this.socket.removeAllListeners(event as string);
      }
    }
  }

  private emit<K extends keyof WebSocketEvents>(event: K, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  // Post-related methods
  public notifyPostEditing(postId: string, title: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('post:editing', { postId, title });
    }
  }

  public notifyPostStopEditing(postId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('post:stop-editing', { postId });
    }
  }

  // Page-related methods
  public notifyPageEditing(pageId: string, title: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('page:editing', { pageId, title });
    }
  }

  public notifyVisualBuilderUpdate(pageId: string, components: any[]) {
    if (this.socket && this.isConnected) {
      this.socket.emit('page:visual-builder', { pageId, components });
    }
  }

  // Media-related methods
  public notifyMediaUploadStart(fileName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('media:upload-start', { fileName });
    }
  }

  // User status methods
  public updateUserStatus(status: 'active' | 'away' | 'busy') {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:status', { status });
    }
  }

  // System methods
  public ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('system:ping');
    }
  }

  // Connection management
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
let wsClient: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
};

export const disconnectWebSocket = () => {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
};

export default getWebSocketClient;