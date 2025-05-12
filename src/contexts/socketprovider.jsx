import {createContext, useContext, createResource, createEffect} from "solid-js";
import io from "socket.io-client";
import {getJWT} from "../util/api";
import { useAuthStore } from "../stores/authStore";
import { useUser } from "../contexts/usercontextprovider";

const WebsocketContext = createContext();

export function WebsocketProvider(props) {

    const [ws, { mutate }] = createResource(connectSocket), socket = [ws]

    async function connectSocket() {

        const serverUrl = import.meta.env.VITE_SERVER_URL; // Use VITE_SERVER_URL again
        if (!serverUrl) {
            console.error('VITE_SERVER_URL environment variable is not set!'); // Correct error message
            return; // Prevent connection attempt if URL is missing
        }

        // Connect to the specific backend URL
        let tempWs = io(serverUrl, { 
            transports: ['websocket', 'polling'], 
            reconnection: true, 
            reconnectionDelay: 1000, 
            reconnectionAttempts: 10,
            withCredentials: true // Important: Send cookies with the connection
        });

        tempWs.on('connect', () => {
            console.log('Connected to WS');
            // Session cookie will handle auth automatically,
            // but we also emit 'auth' to refresh socket state
            const state = useAuthStore.getState();
            if (state.isAuthenticated) {
                tempWs.emit('auth');
                console.log('Emitting auth with session cookie');
            }
            mutate(tempWs)
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

    }

    return (
        <WebsocketContext.Provider value={socket}>
            {props.children}
        </WebsocketContext.Provider>
    );
}

export function useWebsocket() { return useContext(WebsocketContext); }