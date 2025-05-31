import Chat from "../Chat/chat";
import Chats from "../SideBar/chats";
import TipRain from "../SideBar/tiprain";
import ChatRules from "../SideBar/chatrules";
import {createEffect, createSignal, onCleanup} from "solid-js";
import {useWebsocket} from "../../contexts/socketprovider";
import GreenCount from "../Count/greencount";
import {useRain} from "../../contexts/raincontext";
import {createNotification} from "../../util/api";
import SidebarRain from "../SideBar/rain";

function ChatSidebar(props) {
  let previousState = false
  const [rain, userRain] = useRain()
  const [messages, setMessages] = createSignal([], {equals: false})
  const [room, setRoom] = createSignal('EN')
  const [online, setOnline] = createSignal({
    total: 0,
    channels: {
      VIP: 0,
      EN: 1,
      BEG: 0,
      GR: 0,
      TR: 0
    }
  })
  const [emojis, setEmojis] = createSignal([])
  const [ws] = useWebsocket()

  createEffect(() => {
    if (ws() && !previousState) {
      ws().emit('chat:join', 'EN')
    }

    if (ws()) {
      ws().on('chat:pushMessage', (m) => {
        let newMessages = [...messages(), ...m].slice(-50)
        setMessages(newMessages)
      })

      ws().on('toast', (type, content, config = { duration: 3000 }) => {
        createNotification(type, content, config)
      });

      ws().on('chat:emojis', (emojis) => setEmojis(emojis))
      ws().on('chat:clear', () => setMessages([]))
      ws().on('misc:onlineUsers', (data) => setOnline(data))
      ws().on('chat:join', (response) => {
        if (!response.success) return
        setRoom(response.channel)
        setMessages([])
      })
      ws().on('chat:deleteMessage', (id) => {
        let index = messages().findIndex(message => message.id === +id)
        if (index < 0) return
        setMessages([
          ...messages().slice(0, index),
          ...messages().slice(index + 1)
        ])
      })
    }

    previousState = ws() && ws().connected
  })

  onCleanup(() => {
    if (!ws()) return

    ws().off('chat:pushMessage')
    ws().off('chat:clear')
    ws().off('misc:onlineUsers')
    ws().off('chat:join')
    ws().off('chat:deleteMessage')
  })

  return (
    <>
      <div class={'chat-sidebar-container ' + (props.chat ? 'active' : '')}>
        {(rain()?.active || userRain()) && (
          <div class='chat-top-container'>
            <SidebarRain/>
          </div>
        )}

        <div class='chat-options'>
          <Chats online={online()} ws={ws()} room={room()}/>
          <TipRain/>
        </div>

        <Chat messages={messages()} ws={ws()} emojis={emojis()}/>
        
        <div class='chat-bottom-info'>
          <div class='chat-compact-controls'>
            <ChatRules/>
            <GreenCount active={true} number={online()?.total} css={{'flex': '1'}}/>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-sidebar-container {
          min-width: 300px;
          width: 300px;
          height: 100vh;
          max-height: 100vh;
          position: fixed;
          right: -300px;
          top: 0;
          z-index: 10;

          display: flex;
          flex-direction: column;

          background: var(--gradient-bg);
          overflow: hidden;
          transition: right .3s ease;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-sidebar-container.active {
          right: 0;
        }

        .chat-options {
          padding: 15px 15px;

          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-compact-controls {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          padding: 2px 8px;
          height: 24px;
        }

        .chat-compact-controls > * {
          flex: 1;
        }

        .chat-bottom-info {
          background: rgba(23, 20, 48, 0.7);
          padding: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-top-container {
          width: 100%;
          min-height: 180px;
          background: rgb(23, 20, 48);
          position: relative;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            height: 0;
            min-height: 0;
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            min-height: 180px;
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          width: 100%;
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          color: #ffffff;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-chat {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: #ffffff;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-chat:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media only screen and (max-width: 1250px) {
          .chat-sidebar-container {
            width: 100vw;
            right: -100vw;
          }

          .chat-sidebar-container.active {
            right: 0;
          }
        }
      `}</style>
    </>
  );
}

export default ChatSidebar; 