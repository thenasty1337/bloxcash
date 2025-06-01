import { createContext, useContext, createSignal } from "solid-js";

const ModalContext = createContext();

export function ModalProvider(props) {
    const [showPasswordModal, setShowPasswordModal] = createSignal(false);

    const modalState = {
        showPasswordModal,
        openPasswordModal: () => setShowPasswordModal(true),
        closePasswordModal: () => setShowPasswordModal(false)
    };

    return (
        <ModalContext.Provider value={modalState}>
            {props.children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
} 