import {toast} from "solid-toast";
import {errors} from "../resources/errors";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const dropdowns = []

export function createNotification(type, message, options) {
    if (type === 'success') {
        return toast.success(message, options)
    } else if (type === 'error') {
        return toast.error(message, options)
    }
    return toast(message, options)
}

export async function api(path, method, body, notification = false, headers =  { 'Content-Type': 'application/json' }) {
    try {
        const fullPath = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
        let res = await fetch(fullPath, {
            method,
            headers,
            credentials: 'include',
            body,
        })
        let data = await res.json()

        if (data.error && notification) {
            toast.error(errors[data.error] || data.error)
        } else if (data.error && data.error === 'DISABLED') {
            toast.error(errors[data.error] || data.error)
        }

        return data
    } catch (e) {
        console.log('There was an error when trying to fetch ' + path, e)
        return null
    }
}

export async function authedAPI(path, method, body, notification = false) {
    // Session authentication is handled automatically by the browser
    // credentials: 'include' ensures cookies are sent with the request
    // No need to set Authorization header for session-based auth
    return await api(path, method, body, notification);
}

export async function fetchUser(mutateUser) {
    let data = await api('/auth/me', 'GET', null, false);

    if (data?.user) {
        if (mutateUser) {
            mutateUser(data.user);
        }
        return data.user;
    } else {
        if (mutateUser) {
            mutateUser(null);
        }
        return null;
    }
}

export function addDropdown(setValue) {
    dropdowns.push(setValue)
}

export function closeDropdowns() {
    dropdowns.forEach(dropdown => dropdown(false))
}

export function getRandomNumber(min, max, chance) {
    const range = max - min + 1

    if (!chance)
        return Math.floor(Math.random() * range) + min;
    return Math.floor(chance.random() * range) + min;
}

export function getJWT() {
    // For session authentication, we simply need to check if there's any cookie
    // The actual session verification happens server-side
    return document.cookie.length > 0 ? 'session' : '';
}

export function logout() {
    document.cookie = `token= ; SameSite=Lax; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    window.location.reload()
}