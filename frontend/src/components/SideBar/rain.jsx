import {createEffect, createSignal} from "solid-js";
import {useRain} from "../../contexts/raincontext";
import Captcha from "../Captcha/captcha";
import {authedAPI, createNotification} from "../../util/api";
import Countup from "../Countup/countup";
import Avatar from "../Level/avatar";

function SidebarRain(props) {

    const [rain, userRain, time, userTimer, joinedRain] = useRain()
    const [token, setToken] = createSignal(null)
    const [showCaptcha, setShowCaptcha] = createSignal(false)

    async function joinRain() {
        let res = await authedAPI('/rain/join', 'POST', JSON.stringify({
            'captchaResponse': token()
        }), true)

        if (res.success) {
            setToken(null)
            joinedRain()
            createNotification('success', `Successfully joined the rain.`)
        }

        if (res.error === 'NOT_LINKED') {
            let discordRes = await authedAPI('/discord/link', 'POST', null, true)
            if (discordRes.url) {
                attemptToLinkDiscord(discordRes.url)
            }
        }

        setShowCaptcha(false)
    }

    function attemptToLinkDiscord(url) {
        let popupWindow = window.open(url, 'popUpWindow', 'height=700,width=500,left=100,top=100,resizable=yes,scrollbar=yes')
        
        // Use a proper cleanup function for the event listener
        const handleMessage = function (event) {
            if (event.data === "Authorized") {
                popupWindow.close();
                joinRain();
                // Remove the event listener after use
                window.removeEventListener("message", handleMessage, false);
            }
        };
        
        window.addEventListener("message", handleMessage, false);
        
        // Also cleanup if popup is closed manually using requestAnimationFrame for better performance
        let checkClosed;
        const pollWindowClosed = () => {
            if (popupWindow.closed) {
                window.removeEventListener("message", handleMessage, false);
                if (checkClosed) cancelAnimationFrame(checkClosed);
            } else {
                checkClosed = requestAnimationFrame(pollWindowClosed);
            }
        };
        checkClosed = requestAnimationFrame(pollWindowClosed);
    }

    function handleRainJoin() {
        if (userRain()?.joined || rain()?.joined) return createNotification('error', 'You have already joined this rain.')

        setShowCaptcha(true)
        hcaptcha.render('captcha-div', {
            sitekey: '5029f0f4-b80b-42a8-8c0e-3eba4e9edc4c',
            theme: 'dark',
            callback: function (token) {
                setToken(token)
                joinRain()
            }
        });
    }

    function formatTimeLeft(ms) {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <>
            <Captcha active={showCaptcha()} close={() => setShowCaptcha(false)}/>

            <div className='rain-container fadein'>
                <div class='rain-header'>
                    {userRain() ? (
                        <Avatar id={userRain()?.host?.id} xp={userRain()?.host?.xp} height='24' avatar={userRain()?.host?.avatar}/>
                    ) : (
                        <div class='rain-icon'>
                            <img src='/assets/game-icons/home.svg' height='24' alt=''/>
                        </div>
                    )}
                    <div class='rain-info'>
                        <span class='host-name'>{userRain()?.host?.username || 'NOVA CASINO'}</span>
                        <span class='rain-label'>RAIN ACTIVE</span>
                    </div>
                </div>

                <div class='rain-details'>
                    <div class='amount-display'>
                        <img src='/assets/cryptos/branded/USDT.svg' alt='' height='14' width='14'/>
                        <span class='amount'><Countup end={userRain()?.amount || rain()?.amount || 0} gray={false}/></span>
                    </div>
                    
                    <div class='timer-display'>
                        <img src='/assets/icons/timer.svg' height='14' width='14'/>
                        <span class='time'>{formatTimeLeft(userRain() ? userTimer() : time())}</span>
                    </div>
                </div>

                <button className='claim-button' onClick={() => handleRainJoin()} disabled={userRain()?.joined || rain()?.joined}>
                    {(userRain()?.joined || rain()?.joined) ? 'JOINED' : 'JOIN RAIN'}
                </button>
            </div>

            <style jsx>{`
              .rain-container {
                width: 100%;
                min-height: 100%;
                
                top: 0;
                left: 0;

                position: absolute;
                display: flex;
                flex-direction: column;
                z-index: 1;
                
                justify-content: center;
                gap: 8px;
                
                padding: 12px;
                background: rgba(14, 11, 39, 0.95);
              
                backdrop-filter: blur(12px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

                color: #e8e5f3;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px;
                font-weight: 500;
              }
              
              .rain-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(139, 120, 221, 0.2);
              }
              
              .rain-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(139, 120, 221, 0.15);
                border-radius: 6px;
              }
              
              .rain-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
              }
              
              .host-name {
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
              }
              
              .rain-label {
                color: #8b78dd;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .rain-details {
                display: flex;
                gap: 6px;
                padding: 4px 0;
              }
              
              .amount-display,
              .timer-display {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                background: rgba(27, 23, 56, 0.6);
                border: 1px solid rgba(139, 120, 221, 0.2);
                border-radius: 6px;
                backdrop-filter: blur(8px);
                flex: 1;
              }
              
              .amount {
                color: #ffffff;
                font-weight: 600;
                font-size: 13px;
                font-variant-numeric: tabular-nums;
              }
              
              .time {
                color: #8b78dd;
                font-weight: 600;
                font-size: 12px;
                font-variant-numeric: tabular-nums;
              }
              
              .claim-button {
                width: 100%;
                height: 32px;
                
                background: linear-gradient(135deg, #8b78dd, #7c6bbf);
                border: none;
                border-radius: 6px;
                
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(139, 120, 221, 0.25);
              }
              
              .claim-button:hover:not(:disabled) {
                background: linear-gradient(135deg, #9d8de6, #8b78dd);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(139, 120, 221, 0.4);
              }
              
              .claim-button:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: 0 1px 4px rgba(139, 120, 221, 0.3);
              }
              
              .claim-button:disabled {
                background: rgba(139, 120, 221, 0.3) !important;
                color: #a8a3c7 !important;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
              }
              
              .fadein {
                animation: fadein 0.4s forwards ease-out;
              }
              
              @keyframes fadein {
                from {
                  opacity: 0;
                  transform: translateY(10px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>
        </>
    );
}

export default SidebarRain;
