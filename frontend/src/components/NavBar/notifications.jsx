import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {useWebsocket} from "../../contexts/socketprovider";
import {addDropdown, authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import Notification from "./notification";
import {useUser} from "../../contexts/usercontextprovider";
import { AiOutlineBell } from 'solid-icons/ai';

function Notifications(props) {

  const [user, { setNotifications }] = useUser()
  const [active, setActive] = createSignal(false)
  const [notifications, {mutate}] = createResource(() => active(), fetchNotifications)
  const [ws] = useWebsocket()

  addDropdown(setActive)

  createEffect(() => {
    if (ws() && ws().connected) {
      ws().on('notifications', (type, notis) => {
        if (type === 'set') return setNotifications(notis)

        let newNotis = user().notifications + notis
        setNotifications(newNotis)
      })
    }
  })

  async function fetchNotifications(dropdownActive) {
    if (!dropdownActive) return

    try {
      let notisRes = await authedAPI('/user/notifications', 'GET', null, false)
      return Array.isArray(notisRes) ? notisRes : []
    } catch (e) {
      return []
    }
  }

  function removeNotification(id) {
    let index = notifications().findIndex(noti => noti.id === id)

    if (index < 0) return
    mutate([
      ...notifications().slice(0, index),
      ...notifications().slice(index + 1)
    ])
  }

  return (
    <>
      <div class="notifications-container">
        <button 
          class={`control-button notifications-button ${active() ? 'active' : ''}`}
          onClick={(e) => {
            setActive(!active())
            e.stopPropagation()
          }}
          title="Notifications"
        >
          <AiOutlineBell size={16} />
          
          {user() && typeof user().notifications === 'number' && user().notifications > 0 && (
            <div class='notification-badge'>
              {user().notifications > 9 ? '9+' : user().notifications}
            </div>
          )}
        </button>

        <div class={`notifications-dropdown ${active() ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div class='dropdown-content'>
            <div class='dropdown-header'>
              <h3>Notifications</h3>
            </div>
            <div class='notifications-list'>
              <Show when={!notifications.loading} fallback={<Loader max={'20px'}/>}>
                {notifications()?.length > 0 ? (
                  <For each={notifications()}>{(noti) =>
                    <Notification {...noti} delete={() => removeNotification(noti.id)}/>
                  }</For>
                ) : (
                  <div class='no-notifications'>
                    <p>No new notifications</p>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notifications-container {
          position: relative;
          display: inline-flex;
        }

        .notifications-button {
          position: relative;
          outline: none !important;
          {/* border: 1px solid rgba(78, 205, 196, 0.15) !important; */}
        }

        .notifications-button::before,
        .notifications-button::after {
          display: none !important;
        }

        .notifications-button:focus {
          outline: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }

        .notifications-button.active {
          background: rgba(139, 120, 221, 0.2) !important;
          border-color: rgba(139, 120, 221, 0.5) !important;
          color: #8b78dd !important;
          transform: translateY(-1px) !important;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          border-radius: 10px;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          border: 2px solid #1b1738;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
          }
          50% { 
            box-shadow: 0 4px 16px rgba(255, 107, 107, 0.6);
          }
        }

        .notifications-dropdown {
          position: absolute;
          top: 45px;
          right: 0;
          width: 320px;
          max-height: 0;
          overflow: hidden;
          background: rgba(14, 11, 39, 0.95);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .notifications-dropdown.active {
          max-height: 400px;
          border-color: rgba(139, 120, 221, 0.3);
        }

        .dropdown-content {
          padding: 0;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(27, 23, 56, 0.6);
          backdrop-filter: blur(8px);
        }

        .dropdown-header h3 {
          margin: 0;
          color: #e8e5f3;
          font-size: 14px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 12px 8px;
          background: rgba(24, 20, 52, 0.4);
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 120, 221, 0.4) transparent;
        }

        .notifications-list::-webkit-scrollbar {
          width: 4px;
        }

        .notifications-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .notifications-list::-webkit-scrollbar-thumb {
          background: rgba(139, 120, 221, 0.4);
          border-radius: 2px;
        }

        .notifications-list::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 120, 221, 0.6);
        }

        .no-notifications {
          padding: 40px 20px;
          text-align: center;
          color: #a8a3c7;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: rgba(139, 120, 221, 0.05);
          border-radius: 8px;
          margin: 8px;
          border: 1px solid rgba(139, 120, 221, 0.1);
        }

        .no-notifications p {
          margin: 0;
          font-weight: 500;
        }

        @media only screen and (max-width: 768px) {
          .notifications-dropdown {
            width: 280px;
            right: -8px;
          }
          
        
        }
      `}</style>
    </>
  );
}

export default Notifications
