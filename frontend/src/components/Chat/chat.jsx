import {createEffect, createSignal, For} from "solid-js";
import ChatMessage from "./message";
import RainEnd from "./rainend";
import SystemMessage from "./systemmessage";
import RainTip from "./raintip";
import {useUser} from "../../contexts/usercontextprovider";
import {addDropdown} from "../../util/api";
import { IoSend } from 'solid-icons/io';
import { AiOutlineFileText } from 'solid-icons/ai';
import { BsArrowDown } from 'solid-icons/bs';

const rules = [
    'No spamming or flooding the chat with repetitive messages',
    'No begging for items, balance, or rains - use designated channels only',
    'No advertising of external sites, services, or affiliate codes',
    'Zero tolerance for harassment, including racism, sexism, and hate speech',
    'No slandering of our website, staff members, or other players'
]

function Chat(props) {

    let sendRef
    let messagesRef
    let chatRef
    let hasLoaded = false

    const [user] = useUser()
    const [text, setText] = createSignal('')

    const [top, setTop] = createSignal(0)
    const [scroll, setScroll] = createSignal(true)

    const [replying, setReplying] = createSignal()

    const [emojisOpen, setEmojisOpen] = createSignal(false)
    const [rulesOpen, setRulesOpen] = createSignal(false)
    const [isAnimatingOut, setIsAnimatingOut] = createSignal(false)
    addDropdown(setEmojisOpen)
    addDropdown(setRulesOpen)

    // Character limit constant
    const MAX_CHARS = 120;

    // Calculate remaining characters
    const remainingChars = () => MAX_CHARS - text().length;
    const isOverLimit = () => text().length > MAX_CHARS;

    createEffect(() => {
        if (replying() || !replying()) // just to proc the effect
            if (sendRef) sendRef.select()
    })

    // Update parent component when text changes
    createEffect(() => {
        if (props.onTextChange) {
            props.onTextChange(text().length);
        }
    });

    createEffect(() => {
        if (!chatRef) return

        chatRef.onscroll = (e) => {
            let maxScroll = e.target.scrollHeight - e.target.clientHeight
            if (e.target.scrollTop >= maxScroll) {
                setScroll(true)
                return
            }

            if (!top()) return setTop(e.target.scrollTop)

            if (e.target.scrollTop < top() - 100) {
                setScroll(false)
                setTop(e.target.scrollTop)
                return
            }
        }
    })

    createEffect(() => {
        if (props.messages.length === 0 || !scroll()) return

        messagesRef.scrollIntoView({block: 'nearest', inline: 'end', behavior: hasLoaded ? 'smooth' : 'instant'})
        setTop(chatRef.scrollTop)
        hasLoaded = true
    })

    function resumeScrolling() {
        setIsAnimatingOut(true)
        
        // Wait for animation to complete before actually resuming scroll
        setTimeout(() => {
            setScroll(true)
            messagesRef.scrollIntoView({block: 'nearest', inline: 'end', behavior: 'smooth'})
            setTop(chatRef.scrollTop)
            setIsAnimatingOut(false)
        }, 300) // Match animation duration
    }

    function sendMessage(message) {
        message = message.trim()
        if (message.length < 1) {
            return
        }

        if (replying() && !message.includes('@')) {
            message = `@${getReplyingTo().user.username} ${message}`
        }

        props.ws.emit('chat:sendMessage', message, replying())
        setTimeout(() => {
            setText('')
            setReplying(null)
        }, 1)
    }

    const handleKeyPress = (e, message) => {
        if (e.key === 'Backspace' && message.length === 0) {
            setReplying(null)
        }

        if (e.key === 'Enter' && props.ws) {
            sendMessage(message)
        }
    }

    function getReplyingTo() {
        return props?.messages?.find(msg => msg.id === replying())
    }

    function getRepliedMessage(id) {
        if (!id) return 'Unknown'
        let msg = props?.messages?.find(m => m.id === id)
        return msg?.content || 'Unknown'
    }

    return (
        <>
            <div class='chat-container'>
                <div class='messages' ref={chatRef}>
                    <div class='pusher'/>
                    <For each={props.messages}>{(message, index) =>
                        message?.type === 'rain-end' ? (
                            <RainEnd {...message}/>
                        ) : message?.type === 'system' ? (
                            <SystemMessage {...message}/>
                        ) : message?.type === 'rain-tip' ? (
                            <RainTip {...message}/>
                        ) : (
                            <ChatMessage {...message} actualUser={user()}
                                         ws={props?.ws} emojis={props?.emojis}
                                         replying={replying()} setReplying={setReplying}
                                         repliedMessage={getRepliedMessage(message.replyTo)}
                            />
                        )}
                    </For>
                    <div ref={messagesRef}/>
                </div>

                {!scroll() && (
                    <div class={`scroll-paused-notification ${isAnimatingOut() ? 'animating-out' : ''}`} 
                         onClick={() => resumeScrolling()}>
                        <BsArrowDown size={14} />
                        <span>Resume chat</span>
                    </div>
                )}

                <div class='send-message'>
                    {!user() ? (
                        <div class='login-prompt'>
                            <span class='login-text'>Log in to chat</span>
                            <div class='smiley-icon'>😊</div>
                        </div>
                    ) : (
                        <div class='message-wrapper'>
                            {replying() && (
                                <p class='replyto'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
                                        <path d="M5 2.50112V0.375123C5 0.224623 4.9095 0.0886233 4.771 0.0296233C4.633 -0.0288767 4.4715 0.000623226 4.364 0.106123L0.114 4.23112C0.041 4.30162 0 4.39862 0 4.50012C0 4.60162 0.041 4.69862 0.114 4.76912L4.364 8.89412C4.4725 8.99912 4.6335 9.02862 4.771 8.97062C4.9095 8.91162 5 8.77562 5 8.62512V6.50012H5.709C8.027 6.50012 10.164 7.76012 11.2855 9.78612L11.296 9.80512C11.363 9.92712 11.49 10.0001 11.625 10.0001C11.656 10.0001 11.687 9.99662 11.718 9.98862C11.884 9.94612 12 9.79662 12 9.62512C12 5.73812 8.8715 2.56812 5 2.50112Z" fill="#4ecdc4"/>
                                    </svg>
                                    @{getReplyingTo().user.username}
                                </p>
                            )}

                            <input type='text' class='send-message-input' placeholder='Send a message...'
                                   value={text()}
                                   ref={sendRef}
                                   onInput={(e) => setText(e.target.value)}
                                   onKeyDown={(e) => handleKeyPress(e, e.target.value)}/>
                        </div>
                    )}
                    
                    <div class='bottom-bar'>
                        <div class='left-group'>
                        <div class='user-count'>
                                <div class='online-indicator'></div>
                                <span class='count'>{props.onlineCount || 0}</span>
                            </div>

                            <div class='rules-trigger' onClick={(e) => {
                                setRulesOpen(!rulesOpen())
                                e.stopPropagation()
                            }}>
                                <AiOutlineFileText size={16} />
                                
                                {rulesOpen() && (
                                    <div class='rules-dropdown' onClick={(e) => e.stopPropagation()}>
                                        <div class='rules-header'>Chat Rules</div>
                                        <div class='rules-list'>
                                            <For each={rules}>{(rule, index) =>
                                                <div class='rule-item'>
                                                    <span class='rule-number'>{index() + 1}</span>
                                                    <span class='rule-text'>{rule}</span>
                                                </div>
                                            }</For>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                           
                        </div>
                        
                        {user() && (
                            <div class='right-group'>
                                <div class='char-count'>
                                    <span class={isOverLimit() ? 'over-limit' : ''}>{remainingChars()}</span>
                                </div>
                                
                                <div class='send-button' 
                                     onClick={() => sendMessage(text())}
                                     style={{ 
                                       opacity: isOverLimit() ? '0.5' : '1',
                                       'pointer-events': isOverLimit() ? 'none' : 'auto'
                                     }}>
                                   <span>SEND</span>
                               </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
              .chat-container {
                width: 100%;
                height: 100%;

                padding: 0px 0px 10px 0px;

                display: flex;
                flex-direction: column;
                box-sizing: border-box;

                gap: 5px;
                overflow: hidden;
                position: relative;
              }

              .messages {
                width: 100%;
                height: 100%;

                padding: 0 15px;

                display: flex;
                flex-direction: column;
                position: relative;

                gap: 15px;
                overflow-y: scroll;

                mask-image: linear-gradient(to top, black 80%, rgba(0, 0, 0, 0.25) 99%);
                scrollbar-color: transparent transparent;
                background: #130f2d;
              }

              .messages::-webkit-scrollbar {
                display: none;
              }

              .pusher {
                flex: 1 1 auto;
              }

              .scroll-paused-notification {
                position: absolute;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 100;
                
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                
                height: 36px;
                width: 180px;
                padding: 0 16px;
                
                background: rgba(26, 35, 50, 0.85);
                border: 1px solid rgba(78, 205, 196, 0.4);
                border-radius: 18px;
                backdrop-filter: blur(12px);
                box-shadow: 
                  0 4px 16px rgba(0, 0, 0, 0.4),
                  0 2px 8px rgba(78, 205, 196, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: floatIn 0.4s ease-out;
                
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px;
                font-weight: 600;
                color: #4ecdc4;
              }
              
              .scroll-paused-notification.animating-out {
                animation: slideOut 0.3s ease-in forwards;
              }
              
              @keyframes slideOut {
                from {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0) scale(1);
                }
                to {
                  opacity: 0;
                  transform: translateX(-50%) translateY(20px) scale(0.95);
                }
              }
              
              .scroll-paused-notification::before {
                content: '';
                position: absolute;
                inset: -1px;
                border-radius: 18px;
                background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.1));
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: -1;
              }
              
              .scroll-paused-notification:hover {
                background: rgba(26, 35, 50, 0.9);
                border-color: rgba(78, 205, 196, 0.6);
                transform: translateX(-50%) translateY(-2px);
                box-shadow: 
                  0 6px 24px rgba(0, 0, 0, 0.5),
                  0 4px 12px rgba(78, 205, 196, 0.25),
                  inset 0 1px 0 rgba(255, 255, 255, 0.15);
                color: #ffffff;
              }
              
              .scroll-paused-notification:hover::before {
                opacity: 1;
              }
              
              .scroll-paused-notification:active {
                transform: translateX(-50%) translateY(-1px);
                transition: all 0.1s ease;
              }
              
              @keyframes floatIn {
                from {
                  opacity: 0;
                  transform: translateX(-50%) translateY(10px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateX(-50%) translateY(0) scale(1);
                }
              }

              .send-message {
                border-radius: 12px;
                width: 270px;
                max-width: calc(100% - 20px);
                padding: 2px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
                backdrop-filter: blur(8px);
              }
              
              .login-prompt {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(45, 75, 105, 0.3);
                border-radius: 8px;
                border: 1px solid rgba(78, 205, 196, 0.1);
              }
              
              .login-text {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 500;
                color: #8aa3b8;
              }
              
              .smiley-icon {
                font-size: 18px;
                opacity: 0.7;
              }
              
              .message-wrapper {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .send-message-input {
                width: 100%;
                height: 36px;
                background: rgba(45, 75, 105, 0.3);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 8px;
                outline: none;
                padding: 0 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 400;
                font-size: 13px;
                color: #8aa3b8;
                transition: border-color 0.2s ease;
              }
              
              .send-message-input:focus {
                border-color: rgba(78, 205, 196, 0.3);
              }

              .send-message-input::placeholder {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 400;
                font-size: 13px;
                color: #8aa3b8;
                opacity: 0.7;
              }
              
              .bottom-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
              }
              
              .left-group {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .right-group {
                display: flex;
                align-items: center;
                gap: 6px;
              }
              
              .user-count {
                display: flex;
                align-items: center;
                gap: 6px;
              }
              
              .online-indicator {
                width: 8px;
                height: 8px;
                background: #4ecdc4;
                border-radius: 50%;
                box-shadow: 0 0 4px rgba(78, 205, 196, 0.6);
              }
              
              .count {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
              }
              
              .rules-trigger {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                color: #4ecdc4;
              }
              
              .rules-trigger:hover {
                background: rgba(78, 205, 196, 0.15);
                border-color: rgba(78, 205, 196, 0.4);
                color: #ffffff;
              }
              
              .rules-dropdown {
                position: absolute;
                bottom: 40px;
                left: -30px;
                width: 270px;
                max-width: 90vw;
                background: rgba(26, 35, 50);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                animation: slideUp 0.2s ease-out;
              }
              
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              .rules-header {
                padding: 12px 16px;
                border-bottom: 1px solid rgba(78, 205, 196, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: #4ecdc4;
              }
              
              .rules-list {
                padding: 12px 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 300px;
                overflow-y: auto;
              }
              
              .rule-item {
                display: flex;
                gap: 10px;
                align-items: flex-start;
              }
              
              .rule-number {
                background: rgba(78, 205, 196, 0.15);
                border: 1px solid rgba(78, 205, 196, 0.3);
                border-radius: 4px;
                width: 18px;
                height: 18px;
                min-width: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                color: #4ecdc4;
                margin-top: 1px;
              }
              
              .rule-text {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px;
                font-weight: 500;
                color: #8aa3b8;
                line-height: 1.4;
              }
              
              .char-count {
                display: flex;
                align-items: center;
                padding: 4px 8px;
                background: rgba(45, 75, 105, 0.3);
                border: 1px solid rgba(78, 205, 196, 0.1);
                border-radius: 6px;
                min-width: 35px;
                justify-content: center;
              }
              
              .char-count span {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 11px;
                font-weight: 600;
                color: #8aa3b8;
                transition: color 0.2s ease;
              }
              
              .char-count span.over-limit {
                color: #ff6b6b;
              }
              
              .send-button {
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border: none;
                border-radius: 6px;
                padding: 6px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(78, 205, 196, 0.25);
              }
              
              .send-button:hover {
                background: linear-gradient(135deg, #1a8ea9, #1a8ea9);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px #50c9e54d;
              }
              
              .send-button:active {
                transform: translateY(0);
                box-shadow: 0 1px 2px #50c9e54d;
              }
              
              .send-button span {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 11px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 0.5px;
              }

              .send {
                min-height: 36px;
                min-width: 36px;

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
                border-radius: 6px;
                border: 1px solid rgba(78, 205, 196, 0.3);
                background: rgba(78, 205, 196, 0.1);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px);
              }

              .send:hover {
                background: rgba(78, 205, 196, 0.2);
                border-color: rgba(78, 205, 196, 0.5);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
              }

              .send:active {
                transform: translateY(0px);
                box-shadow: 0 1px 4px rgba(78, 205, 196, 0.2);
              }

              .send svg {
                color: #4ecdc4;
                transition: color 0.2s;
              }

              .send:hover svg {
                color: #ffffff;
              }
              
              .replyto {
                display: flex;
                align-items: center;
                gap: 4px;
                
                color: #4ecdc4;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 13px;
                font-style: normal;
                font-weight: 500;
                line-height: normal;
              }

              /* Mobile Responsive Styles */
              @media only screen and (max-width: 1250px) {
                .send-message {
                  width: calc(100% - 20px);
                  max-width: none;
                }

                .rules-dropdown {
                  left: -50px;
                  width: 280px;
                }
              }

              @media only screen and (max-width: 768px) {
                .send-message {
                  width: calc(100% - 16px);
                  padding: 2px;
                  gap: 6px;
                }

                .send-message-input {
                  height: 32px;
                  font-size: 12px;
                  padding: 0 10px;
                }

                .bottom-bar {
                  gap: 8px;
                }

                .left-group {
                  gap: 6px;
                }

                .right-group {
                  gap: 4px;
                }

                .rules-trigger {
                  width: 28px;
                  height: 28px;
                }

                .rules-dropdown {
                  left: -60px;
                  width: 260px;
                  bottom: 35px;
                }

                .count {
                  font-size: 13px;
                }

                .char-count {
                  padding: 3px 6px;
                  min-width: 30px;
                }

                .char-count span {
                  font-size: 10px;
                }

                .send-button {
                  padding: 5px 12px;
                }

                .send-button span {
                  font-size: 10px;
                }

                .scroll-paused-notification {
                  width: 160px;
                  height: 32px;
                  font-size: 11px;
                  bottom: 90px;
                }
              }

              @media only screen and (max-width: 480px) {
                .send-message {
                  width: calc(100% - 12px);
                  gap: 4px;
                }

                .send-message-input {
                  height: 28px;
                  font-size: 11px;
                  padding: 0 8px;
                }

                .bottom-bar {
                  gap: 6px;
                }

                .left-group {
                  gap: 4px;
                }

                .right-group {
                  gap: 3px;
                }

                .rules-trigger {
                  width: 24px;
                  height: 24px;
                }

                .user-count {
                  gap: 4px;
                }

                .online-indicator {
                  width: 6px;
                  height: 6px;
                }

                .count {
                  font-size: 12px;
                }

                .rules-dropdown {
                  left: -80px;
                  width: 240px;
                  bottom: 30px;
                }

                .rules-header {
                  padding: 10px 12px;
                  font-size: 13px;
                }

                .rules-list {
                  padding: 10px 12px;
                  gap: 8px;
                }

                .rule-text {
                  font-size: 11px;
                }

                .char-count {
                  padding: 2px 5px;
                  min-width: 25px;
                }

                .char-count span {
                  font-size: 9px;
                }

                .send-button {
                  padding: 4px 10px;
                }

                .send-button span {
                  font-size: 9px;
                  letter-spacing: 0.3px;
                }

                .scroll-paused-notification {
                  width: 140px;
                  height: 28px;
                  font-size: 10px;
                  bottom: 80px;
                  gap: 6px;
                }

                .login-prompt {
                  padding: 6px 10px;
                }

                .login-text {
                  font-size: 13px;
                }

                .smiley-icon {
                  font-size: 16px;
                }

                .replyto {
                  font-size: 12px;
                  gap: 3px;
                }
              }

              @media only screen and (max-width: 320px) {
                .bottom-bar {
                  flex-wrap: wrap;
                  gap: 4px;
                }

                .rules-dropdown {
                  left: -100px;
                  width: 220px;
                }

                .send-button {
                  padding: 3px 8px;
                }

                .send-button span {
                  font-size: 8px;
                }

                .char-count span {
                  font-size: 8px;
                }
              }
            `}</style>
        </>
    );
}

export default Chat;
