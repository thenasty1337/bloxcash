import {createContext, useContext, createSignal, createEffect} from "solid-js";
import io from "socket.io-client";
import authStore from "../stores/authStore";
import { useUser } from "../contexts/usercontextprovider";

const WebsocketContext = createContext();

// SINGLETON SOCKET MANAGER
// This ensures we only ever have one socket connection across the entire app
const SocketManager = (() => {
    // Private variables
    let instance = null;
    let connectionAttempts = 0;
    let authenticated = false;
    
    // Create a single usable socket instance
    const createSocket = (serverUrl) => {
        console.log('📱 Creating new singleton socket connection');
        
        // If we already have an instance and it's connected, return it
        if (instance && instance.connected) {
            console.log('📱 Reusing existing socket connection');
            return instance;
        }
        
        // Clean up any previous instance
        if (instance) {
            console.log('📱 Cleaning up previous socket instance');
            try {
                instance.disconnect();
                instance.removeAllListeners();
            } catch (e) {
                console.error('Error cleaning up socket:', e);
            }
        }
        
        // Create new socket instance - without custom headers that cause CORS issues
        instance = io(serverUrl, {
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            withCredentials: true
            // Removed custom headers that were causing CORS issues
        });
        
        console.log('📱 New socket instance created');
        return instance;
    };
    
    // Return the public API
    return {
        getSocket: (serverUrl) => {
            if (!serverUrl) return null;
            return instance || createSocket(serverUrl);
        },
        disconnect: () => {
            if (instance) {
                console.log('📱 Manually disconnecting socket');
                instance.disconnect();
                instance = null;
                connectionAttempts = 0;
                authenticated = false;
            }
        },
        isAuthenticated: () => authenticated,
        setAuthenticated: (value) => {
            authenticated = value;
        },
        increaseAttempt: () => connectionAttempts++,
        getAttempts: () => connectionAttempts,
        resetAttempts: () => connectionAttempts = 0
    };
})();

export function WebsocketProvider(props) {
    // Use a signal instead of a resource for more control
    const [ws, setWs] = createSignal(null);
    const [user] = useUser();
    
    // Setup the connection once when the component mounts
    // Use an effect that only runs once
    createEffect(() => {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
            console.error('VITE_SERVER_URL environment variable is not set!');
            return;
        }
        
        // Get or create a socket connection
        const socket = SocketManager.getSocket(serverUrl);
        if (!socket) return;
        
        // Setup listeners only once
        setupSocketListeners(socket);
        
        // Update the signal with our socket
        setWs(socket);
    });
    
    // Only reconnect on authentication state changes
    createEffect(() => {
        const isAuthenticated = user()?.id ? true : false;
        const wasAuthenticated = SocketManager.isAuthenticated();
        
        // Only reconnect if auth state actually changed
        if (isAuthenticated !== wasAuthenticated) {
            console.log('📱 Auth state changed:', isAuthenticated ? 'authenticated' : 'logged out');
            SocketManager.setAuthenticated(isAuthenticated);
            
            // If the current socket exists, authenticate it
            const socket = ws();
            if (socket && socket.connected && isAuthenticated) {
                socket.emit('auth');
            }
        }
    });

    // Function to set up listeners on the socket
    function setupSocketListeners(socket) {
        // Skip if this socket already has listeners
        if (socket._listenersInitialized) {
            return;
        }
        
        // Set flag to avoid duplicate listeners
        socket._listenersInitialized = true;
        
        // Set up connect event
        socket.on('connect', () => {
            console.log('📱 Socket connected');
            
            // Reset connection attempts on successful connect
            SocketManager.resetAttempts();
            
            // Send auth when connected if user is logged in
            const currentUser = user();
            if (currentUser?.id) {
                console.log('📱 User authenticated, sending auth request');
                socket.emit('auth');
            }
        });
        
        // Set up disconnect event
        socket.on('disconnect', (reason) => {
            console.log('📱 Socket disconnected:', reason);
            // No need to manage reconnect - let socket.io handle it
        });
        
        // Set up connection error handling
        socket.on('connect_error', (err) => {
            console.error('📱 Socket connection error:', err.message);
            SocketManager.increaseAttempt();
            
            // After too many attempts, consider alternative actions
            if (SocketManager.getAttempts() > 5) {
                console.warn('📱 Multiple connection failures, consider refreshing the page');
            }
        });
        
        // Handle auth response
        socket.on('auth', (response) => {
            console.log('📱 Socket auth response:', response);
            if (response.success) {
                console.log('📱 Socket authenticated with ID:', response.userId);
                SocketManager.setAuthenticated(true);
            } else {
                console.warn('📱 Socket authentication failed:', response.error);
                SocketManager.setAuthenticated(false);
                
                // Attempt auth again only once
                if (!socket._authRetried && user()?.id) {
                    socket._authRetried = true;
                    setTimeout(() => socket.emit('auth'), 1000);
                }
            }
        });
    }

    // Return socket as a getter function to ensure latest value
    const socketValue = [() => ws()];
    
    return (
        <WebsocketContext.Provider value={socketValue}>
            {props.children}
        </WebsocketContext.Provider>
    );
}

export function useWebsocket() { return useContext(WebsocketContext); }