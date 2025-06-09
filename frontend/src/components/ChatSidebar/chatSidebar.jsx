import Chat from "../Chat/chat";
import Chats from "../SideBar/chats";
import TipRain from "../SideBar/tiprain";
import {createEffect, createSignal, onCleanup} from "solid-js";
import {useWebsocket} from "../../contexts/socketprovider";
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

        <Chat 
          messages={messages()} 
          ws={ws()} 
          emojis={emojis()} 
          onlineCount={online()?.total || 0}
        />
      </div>

      <style jsx>{`
        .chat-sidebar-container {
          min-width: 290px;
          width: 290px;
          height: 100vh;
          max-height: 100vh;
          position: fixed;
          right: -290px;
          top: 0;
          z-index: 10;

          display: flex;
          flex-direction: column;

          background: #181434;
          backdrop-filter: blur(12px);
          overflow: hidden;
          transition: right .3s ease;
        
        }

        .chat-sidebar-container.active {
          right: 0;
        }

        .chat-options {
          padding: 15px 15px;
          border-bottom: 1px solid rgba(139, 120, 221, 0.1);

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .chat-top-container {
          width: 100%;
          min-height: 180px;
          position: relative;
          border-bottom: 1px solid rgba(78, 205, 196, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideDown 0.3s ease-out;
          backdrop-filter: blur(8px);
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
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .close-chat {
          background: rgba(45, 75, 105, 0.4);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 6px;
          color: #8aa3b8;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        .close-chat:hover {
          background: rgba(78, 205, 196, 0.15);
          border-color: #4ecdc4;
          color: #4ecdc4;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
        }

        @media only screen and (max-width: 1250px) {
          .chat-sidebar-container {
            width: 100vw;
            right: -100vw;
            height: calc(100vh - 130px);
            max-height: calc(100vh - 130px);
            top: 60px;
          }

          .chat-sidebar-container.active {
            right: 0;
          }
        }

        @media only screen and (max-width: 768px) {
          .chat-sidebar-container {
            height: calc(100vh - 125px);
            max-height: calc(100vh - 125px);
            top: 60px;
          }
        }

        @media only screen and (max-width: 480px) {
          .chat-sidebar-container {
            height: calc(100vh - 125px);
            max-height: calc(100vh - 125px);
            top: 60px;
          }
        }
      `}</style>
    </>
  );
}

export default ChatSidebar; 