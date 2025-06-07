import {A} from "@solidjs/router";
import {createSignal, Show} from "solid-js";
import {addDropdown, logout} from "../../util/api";
import UserDropdown from "./userdropdown";

function BottomNavBar(props) {

    const [menuDropdown, setMenuDropdown] = createSignal(false)
    const [notificationsOpen, setNotificationsOpen] = createSignal(false)
    addDropdown(setMenuDropdown)
    addDropdown(setNotificationsOpen)

    return (
        <>
            <div class='bottom-navbar'>
            <button 
                    class={`nav-button ${props.gamesSidebar ? 'active' : ''}`} 
                    onClick={(e) => {
                        e.stopPropagation()
                        props.setGamesSidebar(!props.gamesSidebar)
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
                    </svg>
                    <span>MENU</span>
                    <UserDropdown user={props?.user} active={menuDropdown()} setActive={setMenuDropdown} mobile={true}/>

                </button>

                <div class="mobile-notifications-container">
                    <button 
                        class={`nav-button ${notificationsOpen() ? 'active' : ''}`} 
                        onClick={(e) => {
                            e.stopPropagation()
                            setNotificationsOpen(!notificationsOpen())
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.19 14,4.29 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
                        </svg>
                        <span>ALERTS</span>
                        {props.user && props.user.notifications > 0 && (
                            <div class='notification-badge'>
                                {props.user.notifications > 9 ? '9+' : props.user.notifications}
                            </div>
                        )}
                    </button>
                    
                    <Show when={notificationsOpen()}>
                        <div class='mobile-notifications-dropdown' onClick={(e) => e.stopPropagation()}>
                            <div class='dropdown-content'>
                                <div class='dropdown-header'>
                                    <h3>Notifications</h3>
                                    <button 
                                        class='close-button' 
                                        onClick={() => setNotificationsOpen(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div class='notifications-content'>
                                    <div class='no-notifications'>
                                        <p>No new notifications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Show>
                </div>

                <button 
                    class={`nav-button ${props.chat ? 'active' : ''}`} 
                    onClick={() => props.setChat(!props.chat)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z"/>
                    </svg>
                    <span>CHAT</span>
                </button>


                {props.user && (
                    <button class='nav-button' onClick={(e) => {
                      e.stopPropagation()
                      setMenuDropdown(!menuDropdown())
                  }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
                      </svg>
                      <span>SETTINGS</span>
                  </button>
                )}
            </div>

            <style jsx>{`
              .bottom-navbar {
                display: none;
              }

              .nav-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                
                position: relative;
                
                outline: none;
                border: 1px solid rgba(139, 120, 221, 0.2);
                background: rgba(27, 23, 56, 0.8);
                padding: 8px 12px;
                border-radius: 10px;

                gap: 4px;

                color: #9ca3af;
                font-size: 11px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;

                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
                min-width: 60px;
                backdrop-filter: blur(12px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }

              .nav-button svg {
                transition: all 0.3s ease;
                opacity: 0.7;
                color: #8b78dd;
              }

              .nav-button:hover {
                color: #ffffff;
                background: rgba(139, 120, 221, 0.2);
                border-color: rgba(139, 120, 221, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(139, 120, 221, 0.3);
              }

              .nav-button:hover svg {
                opacity: 1;
                color: #8b78dd;
                filter: drop-shadow(0 0 6px rgba(139, 120, 221, 0.4));
              }
              
              .nav-button.active {
                color: #8b78dd;
                background: rgba(139, 120, 221, 0.3);
                border-color: #8b78dd;
                box-shadow: 0 4px 12px rgba(139, 120, 221, 0.4);
                transform: translateY(-1px);
              }

              .nav-button.active svg {
                opacity: 1;
                color: #8b78dd;
                filter: drop-shadow(0 0 8px rgba(139, 120, 221, 0.6));
              }

              .nav-button span {
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
              }

              /* Ensure profile link (A tag) looks identical to buttons */
              a.nav-button {
                text-decoration: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }

              a.nav-button:visited {
                color: #9ca3af;
              }

              a.nav-button:hover {
                color: #ffffff;
                background: rgba(139, 120, 221, 0.2);
                border-color: rgba(139, 120, 221, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(139, 120, 221, 0.3);
              }

              a.nav-button:hover svg {
                opacity: 1;
                color: #8b78dd;
                filter: drop-shadow(0 0 6px rgba(139, 120, 221, 0.4));
              }

              /* Mobile Notifications Styling */
              .mobile-notifications-container {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                max-width: 80px;
                margin: 0 2px;
              }

              .mobile-notifications-container .nav-button {
                width: 100%;
                height: 100%;
                flex: 1;
                margin: 0;
              }

              .notification-badge {
                position: absolute;
                top: -4px;
                right: 8px;
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
                border: 2px solid #0e0b27;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                z-index: 10;
              }

              .mobile-notifications-dropdown {
                position: fixed;
                left: 50%;
                bottom: 80px;
                transform: translateX(-50%);
                width: 90%;
                max-width: 350px;
                background: linear-gradient(135deg, #181434 0%, #0e0b27 100%);
                border: 1px solid rgba(139, 120, 221, 0.3);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                z-index: 1000;
                backdrop-filter: blur(20px);
                animation: slideUpMobile 0.3s ease;
              }

              @keyframes slideUpMobile {
                from {
                  opacity: 0;
                  transform: translateX(-50%) translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0);
                }
              }

              .mobile-notifications-dropdown .dropdown-content {
                padding: 0;
                display: flex;
                flex-direction: column;
              }

              .mobile-notifications-dropdown .dropdown-header {
                padding: 16px 20px;
                border-bottom: 1px solid rgba(139, 120, 221, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
              }

              .mobile-notifications-dropdown .dropdown-header h3 {
                margin: 0;
                color: #ffffff;
                font-size: 16px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              .close-button {
                background: none;
                border: none;
                color: #9ca3af;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.3s ease;
              }

              .close-button:hover {
                color: #8b78dd;
              }

              .notifications-content {
                padding: 20px;
                min-height: 100px;
                max-height: 300px;
                overflow-y: auto;
              }

              .no-notifications {
                text-align: center;
                color: rgba(156, 163, 175, 0.7);
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              @media only screen and (max-width: 1250px) {
                .bottom-navbar {
                  position: fixed;
                  left: 0;
                  bottom: 0;
                  z-index: 100;

                  width: 100%;
                  height: 70px;

                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                  padding: 0 16px;
                  gap: 8px;

                  background: linear-gradient(180deg, #181434 0%, #0e0b27 100%);
                  backdrop-filter: blur(20px);
                  border-top: 1px solid rgba(139, 120, 221, 0.3);
                  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.4), 0px -1px 0px rgba(139, 120, 221, 0.2);
                }
                
                .nav-button {
                  flex: 1;
                  max-width: 80px;
                  margin: 0 2px;
                }
              }

              @media only screen and (max-width: 768px) {
                .bottom-navbar {
                  height: 65px;
                  padding: 0 12px;
                }

                .nav-button {
                  padding: 6px 8px;
                  min-width: 50px;
                }

                .nav-button span {
                  font-size: 9px;
                }
              }

              @media only screen and (max-width: 480px) {
                .nav-button {
                  padding: 4px 6px;
                  min-width: 45px;
                }

                .nav-button svg {
                  width: 16px;
                  height: 16px;
                }

                .nav-button span {
                  font-size: 8px;
                }
              }
            `}</style>
        </>
    );
}

export default BottomNavBar;
