import {addDropdown} from "../../util/api";
import {createEffect, createSignal, For} from "solid-js";

const rooms = {
    'EN': {
        icon: '/assets/flags/gb.svg',
        name: 'ENGLISH',
        shortName: 'EN',
    },
    'TR': {
        icon: '/assets/flags/tr.svg',
        name: 'TURKISH',
        shortName: 'TR',
        key: 'TR',
    },
    'GR': {
        icon: '/assets/flags/de.svg',
        name: 'GERMAN',
        shortName: 'DE',
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
                <div class='chats' onClick={(e) => {
                    setActive(!active())
                    e.stopPropagation()
                    e.preventDefault()
                }}>
                    <img src={rooms[props.room].icon}/>

                    <p class='chat-name'>{props.room}</p>

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
                                <p>{rooms[roomKey].shortName}</p>

                            </div>
                        }</For>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .chatrooms-container {
                width: 75px;
                height: 28px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 12px;
                color: #9ca3af;
                
                position: relative;
                z-index: 3;
              }
              
              .chats {
                width: auto;
                min-width: 60px;
                height: 100%;

                display: flex;
                align-items: center;
                gap: 8px;

                padding: 0 10px;
                cursor: pointer;
                position: relative;
                background: rgba(27, 23, 56, 0.6);
                border: 1px solid rgba(139, 120, 221, 0.15);
                border-radius: 6px;
                transition: all 0.2s ease;
                backdrop-filter: blur(8px);
              }

              .chats:hover {
                background: rgba(139, 120, 221, 0.15);
                border-color: rgba(139, 120, 221, 0.3);
                color: #ffffff;
              }

              .chat-name {
                text-align: left;
                user-select: none;
                color: inherit;
                font-weight: 600;
                font-size: 12px;
                margin: 0;
                flex: 1;
              }

              .dropdown {
                position: absolute;
                width: 100%;
                max-height: 0;
                
                top: 30px;
                left: 0;
                z-index: 1;

                border-radius: 8px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                
                cursor: default;
              }

              .dropdown.active {
                max-height: 250px;
              }

              svg {
                transition: transform 0.2s ease;
                flex-shrink: 0;
                width: 6px;
                height: 4px;
              }

              svg.active {
                transform: rotate(180deg);
              }

              svg path {
                fill: #8b78dd;
                transition: fill 0.2s ease;
              }

              .chats:hover svg path {
                fill: #ffffff;
              }

              .decoration-arrow {
                display: none;
              }
              
              .rooms {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 6px;
                width: 74px;
                box-sizing: border-box;

                border: 1px solid rgba(139, 120, 221, 0.2);
                background: rgba(14, 11, 39, 0.95);
                border-radius: 8px;
                backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                
                margin-top: 2px;
              }
              
              .room {
                display: flex;
                align-items: center;
                text-align: left;
                
                height: 28px;

                background: rgba(27, 23, 56, 0.6);
                border: 1px solid rgba(139, 120, 221, 0.1);
                border-radius: 4px;
                
                gap: 6px;
                padding: 0 6px;
                transition: all 0.2s ease;
                
                cursor: pointer;
                color: #9ca3af;
              }
              
              .room:hover {
                background: rgba(139, 120, 221, 0.2);
                border-color: rgba(139, 120, 221, 0.3);
                color: #ffffff;
                transform: translateY(-1px);
              }

              .room img {
                width: 16px;
                height: 16px;
                object-fit: contain;
                opacity: 0.8;
                transition: opacity 0.2s ease;
              }

              .room:hover img {
                opacity: 1;
              }

              .room p {
                margin: 0;
                font-size: 11px;
                font-weight: 600;
                flex: 1;
              }
              
              .online {
                padding: 2px 4px;
                background: rgba(139, 120, 221, 0.15);
                border: 1px solid rgba(139, 120, 221, 0.3);
                border-radius: 3px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 9px;
                color: #8b78dd;
                
                display: flex;
                align-items: center;
                gap: 3px;
                backdrop-filter: blur(4px);
              }
              
              .dot {
                width: 4px;
                height: 4px;
                background: #8b78dd;
                border-radius: 50%;
                box-shadow: 0 0 3px rgba(139, 120, 221, 0.6);
              }

              .chats img {
                width: 14px;
                height: 14px;
                object-fit: contain;
                opacity: 0.8;
                transition: opacity 0.2s ease;
                flex-shrink: 0;
              }

              .chats:hover img {
                opacity: 1;
              }
            `}</style>
        </>
    );
}

export default Chats;
