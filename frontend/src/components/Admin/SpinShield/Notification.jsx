import { createSignal, onCleanup } from "solid-js";

// Notification component to display success/error messages
const Notification = (props) => {
  return (
    <div class={`notification ${props.type === 'success' ? 'success' : 'error'}`}>
      <div>{props.type === 'success' ? '✓' : '✕'}</div>
      <div>{props.message}</div>
    </div>
  );
};

export default Notification;
