import {A} from "@solidjs/router";
import {createSignal} from "solid-js";
import {addDropdown, logout} from "../../util/api";
import UserDropdown from "./userdropdown";

function BottomNavBar(props) {

    const [menuDropdown, setMenuDropdown] = createSignal(false)
    addDropdown(setMenuDropdown)

    return (
        <>
            <div class='bottom-navbar'>
                <button class='nav-button' onClick={(e) => {
                    e.stopPropagation()
                    setMenuDropdown(!menuDropdown())
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
                    </svg>
                    <span>MENU</span>
                    <UserDropdown user={props?.user} active={menuDropdown()} setActive={setMenuDropdown} mobile={true}/>
                </button>

                <button 
                    class={`nav-button ${props.gamesSidebar ? 'active' : ''}`} 
                    onClick={(e) => {
                        e.stopPropagation()
                        props.setGamesSidebar(!props.gamesSidebar)
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                    </svg>
                    <span>GAMES</span>
                </button>

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
                    <A href="/profile" class='nav-button'>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                        </svg>
                        <span>PROFILE</span>
                    </A>
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
                border: none;
                background: transparent;
                padding: 8px 12px;
                border-radius: 8px;

                gap: 4px;

                color: #8aa3b8;
                font-size: 11px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;

                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                min-width: 60px;
                backdrop-filter: blur(8px);
              }

              .nav-button svg {
                transition: all 0.3s ease;
                opacity: 0.7;
              }

              .nav-button:hover {
                color: #ffffff;
                background: rgba(78, 205, 196, 0.1);
                transform: translateY(-1px);
              }

              .nav-button:hover svg {
                opacity: 1;
                filter: drop-shadow(0 0 4px rgba(78, 205, 196, 0.3));
              }
              
              .nav-button.active {
                color: #4ecdc4;
                background: rgba(78, 205, 196, 0.15);
                box-shadow: 0 0 15px rgba(78, 205, 196, 0.2);
              }

              .nav-button.active svg {
                opacity: 1;
                filter: drop-shadow(0 0 6px rgba(78, 205, 196, 0.4));
              }

              .nav-button span {
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
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

                  background: linear-gradient(180deg, #1a2332 0%, #0f1a26 50%, #0a1420 100%);
                  backdrop-filter: blur(15px);
                  border-top: 1px solid rgba(78, 205, 196, 0.15);
                  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.3);
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
