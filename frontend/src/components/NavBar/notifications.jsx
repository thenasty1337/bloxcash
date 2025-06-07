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

        <div class={`notifications-dropdown ${active() ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div class='dropdown-arrow'/>
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
      </button>

      <style jsx>{`
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
          background: rgba(78, 205, 196, 0.1) !important;
          border-color: rgba(78, 205, 196, 0.3) !important;
          color: #4ecdc4 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(78, 205, 196, 0.15) !important;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff4757;
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
          border: 2px solid #1a2332;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .notifications-dropdown {
          position: absolute;
          top: 45px;
          right: 0;
          width: 320px;
          max-height: 0;
          overflow: hidden;
          background: rgba(26, 35, 50, 0.95);
          border-radius: 8px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .notifications-dropdown.active {
          max-height: 400px;
        }

        .dropdown-arrow {
          position: absolute;
          top: -6px;
          right: 12px;
          width: 12px;
          height: 12px;
          background: rgba(26, 35, 50, 0.95);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-bottom: none;
          border-right: none;
          transform: rotate(45deg);
          backdrop-filter: blur(20px);
        }

        .dropdown-content {
          padding: 0;
          max-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .dropdown-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(78, 205, 196, 0.1);
        }

        .dropdown-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 8px 0;
        }

        .notifications-list::-webkit-scrollbar {
          width: 4px;
        }

        .notifications-list::-webkit-scrollbar-track {
          background: rgba(78, 205, 196, 0.1);
          border-radius: 2px;
        }

        .notifications-list::-webkit-scrollbar-thumb {
          background: rgba(78, 205, 196, 0.3);
          border-radius: 2px;
        }

        .notifications-list::-webkit-scrollbar-thumb:hover {
          background: rgba(78, 205, 196, 0.5);
        }

        .no-notifications {
          padding: 40px 20px;
          text-align: center;
          color: rgba(138, 163, 184, 0.7);
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .no-notifications p {
          margin: 0;
        }

        @media only screen and (max-width: 768px) {
          .notifications-dropdown {
            width: 280px;
            right: -8px;
          }
          
          .dropdown-arrow {
            right: 20px;
          }
        }
      `}</style>
    </>
  );
}

export default Notifications
