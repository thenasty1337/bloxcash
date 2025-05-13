import {createContext, useContext, createResource, createEffect} from "solid-js";
import io from "socket.io-client";
import {getJWT} from "../util/api";
import { useAuthStore } from "../stores/authStore";
import { useUser } from "../contexts/usercontextprovider";

const WebsocketContext = createContext();

export function WebsocketProvider(props) {
    const [user] = useUser();
    const [ws, { mutate, refetch }] = createResource(connectSocket), socket = [ws];
    
    // Refetch socket connection when user state changes
    createEffect(() => {
        if (user()) {
            console.log("User authenticated, reconnecting socket");
            // Allow some time for session to be properly established
            setTimeout(() => {
                if (ws()) {
                    ws().disconnect();
                }
                refetch();
            }, 300);
        }
    });

    async function connectSocket() {

        const serverUrl = import.meta.env.VITE_SERVER_URL; // Use VITE_SERVER_URL again
        if (!serverUrl) {
            console.error('VITE_SERVER_URL environment variable is not set!'); // Correct error message
            return; // Prevent connection attempt if URL is missing
        }

        // Connect to the specific backend URL
        // Force the browser to include credentials with all requests
        document.cookie = document.cookie + "; SameSite=None; Secure";
        
        console.log("Current cookies:", document.cookie);
        
        let tempWs = io(serverUrl, { 
            transports: ['polling', 'websocket'], // Start with polling to ensure cookies are sent
            reconnection: true, 
            reconnectionDelay: 1000, 
            reconnectionAttempts: 10,
            withCredentials: true, // Important: Send cookies with the connection
            extraHeaders: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });

        tempWs.on('connect', () => {
            console.log('Connected to WS');
            
            // Get current user from both contexts to ensure we're authenticated
            const state = useAuthStore.getState();
            const currentUser = user();
            const userId = currentUser?.id || state.user?.id;
            
            console.log('Auth state on connect:', { 
                zustandAuth: state.isAuthenticated, 
                solidUser: currentUser ? true : false,
                userId: userId
            });
            
            // We only use session-based authentication for security
            // Never send user IDs directly as that could be manipulated
            tempWs.emit('auth');
            console.log('Emitting auth request - using session only for security');
            
            // Add a slight delay to ensure the server has processed the initial connection
            setTimeout(() => {
                // Re-attempt authentication after a delay
                tempWs.emit('auth');
                console.log('Re-emitting auth request');
            }, 500);
            
            mutate(tempWs);
        })

        tempWs.on('disconnect', (reason) => {
            // Reconnect logic needs to use the serverUrl as well
            if (reason !== 'io server disconnect' && reason !== 'transport close') { // Handle more disconnect reasons
                 console.log('WS disconnected:', reason);
                 // Consider adding exponential backoff or clearer retry logic here
                 // The current setInterval logic might cause issues
                 // For now, just ensure reconnection attempts use the correct URL
                 // mutate(null); // Maybe not mutate to null immediately? Let socket.io handle retries
                 return; 
            }
            
            // Simplified reconnect handling - rely on socket.io's built-in reconnection
            console.log('WS disconnected, attempting reconnect:', reason);
            // mutate(null) // Avoid immediate mutation to allow library reconnection
            
            // Remove the complex setInterval logic, let socket.io handle reconnection attempts
            // let retrying = setInterval(() => { ... }, 1000)
        })

        // Add connection error handling
        tempWs.on('connect_error', (err) => {
            console.error('WS connection error:', err.message);
            // Optionally mutate to null or show error state after several failed attempts
        });

        // Handle auth response
        tempWs.on('auth', (response) => {
            console.log('Socket auth response:', response);
            if (response.success) {
                console.log('Socket authenticated successfully with ID:', response.userId);
            } else {
                console.warn('Socket authentication failed:', response.error);
            }
        });

    }

    return (
        <WebsocketContext.Provider value={socket}>
            {props.children}
        </WebsocketContext.Provider>
    );
}

export function useWebsocket() { return useContext(WebsocketContext); }