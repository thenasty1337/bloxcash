import {addDropdown} from "../../util/api";
import {createEffect, createSignal, For} from "solid-js";

const rooms = {
    'EN': {
        icon: '/assets/icons/english.png',
        name: 'ENGLISH',
    },
    'TR': {
        icon: '/assets/icons/turkish.png',
        name: 'TURKISH',
        key: 'TR',
    },
    'GR': {
        icon: '/assets/icons/german.png',
        name: 'GERMAN',
    },
    'BEG': {
        icon: '/assets/icons/begging.png',
        name: 'BEGGING',
    },
    'VIP': {
        icon: '/assets/icons/whale.png',
        name: 'WHALE LOUNGE',
    },
}

function Chats(props) {

    const [active, setActive] = createSignal(false)
    addDropdown(setActive)

    function tryToSwitchRooms(roomKey) {
        if (props.ws) {
            props.ws.emit('chat:join', roomKey)
        }
    }

    return (
        <>
            <div class='chatrooms-container'>
                <div class='chats bevel' onClick={(e) => {
                    setActive(!active())
                    e.stopPropagation()
                    e.preventDefault()
                }}>
                    <img src={rooms[props.room].icon}/>

                    <p class='chat-name'>{rooms[props.room].name}</p>

                    <svg class={active() ? 'active' : ''} width="7" height="5" viewBox="0 0 7 5" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3.50001 0.994671C3.62547 0.994671 3.7509 1.04269 3.84655 1.13852L6.8564 4.15579C7.04787 4.34773 7.04787 4.65892 6.8564 4.85078C6.66501 5.04263 6.5 4.99467 6.16316 4.99467L3.50001 4.99467L1 4.99467C0.5 4.99467 0.335042 5.04254 0.14367 4.85068C-0.0478893 4.65883 -0.0478893 4.34764 0.14367 4.1557L3.15347 1.13843C3.24916 1.04258 3.3746 0.994671 3.50001 0.994671Z"
                            fill="#4ecdc4"/>
                    </svg>
                </div>

                <div class={'dropdown ' + (active() ? 'active' : '')} onClick={(e) => e.stopPropagation()}>
                    <div class='decoration-arrow'/>
                    <div class='rooms'>
                        <For each={Object.keys(rooms).filter(r => r !== props.room)}>{(roomKey, index) =>
                            <div class='room' onClick={() => {
                                tryToSwitchRooms(roomKey)
                            }}>
                                <img src={rooms[roomKey].icon} width='25' alt=''/>
                                <p>{rooms[roomKey].name}</p>

                                <div class='online'>
                                    <div class='dot'/>
                                    {props?.online?.channels[roomKey]}
                                </div>
                            </div>
                        }</For>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .chatrooms-container {
                width: 100%;
                height: 35px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 14px;
                color: #8aa3b8;
                
                position: relative;
                z-index: 3;
              }
              
              .chats {
                width: 100%;
                height: 100%;

                display: flex;
                align-items: center;
                justify-content: space-between;

                padding: 0 15px;
                cursor: pointer;
                position: relative;
                background: rgba(26, 35, 50, 0.4);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px);
              }

              .chats:hover {
                background: rgba(78, 205, 196, 0.1);
                border-color: rgba(78, 205, 196, 0.3);
                color: #ffffff;
              }

              .chat-name {
                width: 100%;
                left: 0;
                position: absolute;
                text-align: center;

                user-select: none;
                color: inherit;
                font-weight: 600;
              }

              .dropdown {
                position: absolute;
                width: 100%;
                max-height: 0;
                
                top: 37px;
                left: 0;
                z-index: 1;

                border-radius: 8px;
                transition: max-height .3s;
                overflow: hidden;
                
                cursor: default;
              }

              .dropdown.active {
                max-height: 200px;
              }

              svg.active {
                transform: rotate(180deg);
              }

              svg path {
                fill: #4ecdc4;
              }

              .decoration-arrow {
                width: 13px;
                height: 9px;

                top: 1px;
                background: rgba(26, 35, 50, 0.9);
                position: absolute;
                right: 0;
                
                border-left: 1px solid rgba(78, 205, 196, 0.2);
                border-right: 1px solid rgba(78, 205, 196, 0.2);
                border-top: 1px solid rgba(78, 205, 196, 0.2);

                clip-path: polygon(0% 100%, 100% 0%, 100% 100%);
              }
              
              .rooms {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 10px;

                border: 1px solid rgba(78, 205, 196, 0.2);
                background: rgba(26, 35, 50, 0.9);
                border-radius: 8px;
                backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                
                margin-top: 9px;
              }
              
              .room {
                display: flex;
                align-items: center;
                text-align: left;
                
                height: 30px;

                background: rgba(45, 75, 105, 0.3);
                border: 1px solid rgba(78, 205, 196, 0.1);
                border-radius: 6px;
                
                gap: 10px;
                padding: 0 7px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                cursor: pointer;
                color: #8aa3b8;
              }
              
              .room:hover {
                background: rgba(78, 205, 196, 0.15);
                border-color: rgba(78, 205, 196, 0.3);
                color: #ffffff;
                transform: translateX(3px);
              }
              
              .online {
                padding: 3px 5px;
                background: rgba(78, 205, 196, 0.2);
                border: 1px solid rgba(78, 205, 196, 0.3);
                border-radius: 4px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 11px;
                color: #4ecdc4;
                
                margin-left: auto;
                position: relative;
                z-index: 0;
                
                display: flex;
                align-items: center;
                gap: 5px;
                backdrop-filter: blur(4px);
              }
              
              .online:before {
                position: absolute;
                top: 1px;
                left: 1px;
                
                content: '';
                
                width: calc(100% - 2px);
                height: calc(100% - 2px);
                border-radius: 3px;

                z-index: -1;
                background: rgba(26, 35, 50, 0.8);
              }
              
              .dot {
                width: 10px;
                height: 10px;

                background: rgba(78, 205, 196, 0.2);
                border-radius: 2px;
                
                display: flex;
                align-items: center;
                justify-content: center;
                
                position: relative;
              }
              
              .dot:after {
                height: 5px;
                width: 5px;
                
                content: '';
                
                background: #4ecdc4;
                box-shadow: 0px 0px 4px rgba(78, 205, 196, 0.5);
                border-radius: 2px;
              }
            `}</style>
        </>
    );
}

export default Chats;
