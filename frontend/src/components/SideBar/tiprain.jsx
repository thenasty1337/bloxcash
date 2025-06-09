import {createEffect, createSignal, onCleanup} from "solid-js";
import {addDropdown, authedAPI} from "../../util/api";
import Countup from "../Countup/countup";
import {useRain} from "../../contexts/raincontext";

function TipRain(props) {

    const [active, setActive] = createSignal(false)
    const [amount, setAmount] = createSignal(0)
    const [rain, setRain, time] = useRain()

    function formatTimeLeft() {
        const totalSeconds = Math.floor(time() / 1000)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    addDropdown(setActive)

    return (
        <>
            <div class='tip-rain' onClick={(e) => e.stopPropagation()}>
                <img src='/assets/cryptos/branded/USDT.svg' alt='' width='19'/>
                <p class='rain-amount'>
                    <Countup end={rain()?.amount || 0} gray={true}/>
                </p>

                <button onClick={() => setActive(!active())}>
                    TIP RAIN
                </button>

                <div class={'dropdown-rain ' + (active() ? 'active' : '')}>
                    <div class='decoration-arrow'/>
                    <div class='dropdown-rain-container'>
                        <div class='header'>
                            <p>ENTER TIP AMOUNT</p>

                            <div class='timer'>
                                <img src='/assets/icons/timer.svg' height='12'/>
                                <p>{formatTimeLeft()}</p>
                            </div>
                        </div>

                        <div class='input-wrapper'>
                            <img src='/assets/cryptos/branded/USDT.svg' height='16'/>
                            <input type='number' placeholder='...' value={amount()} onInput={(e) => setAmount(e.target.valueAsNumber)}/>
                        </div>

                        <button class='tip' onClick={async () => {
                            let res = await authedAPI('/rain/tip', 'POST', JSON.stringify({
                                amount: amount()
                            }), true)
                        }}>TIP</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .tip-rain {
                width: 100%;
                height: 28px;

                background: rgba(27, 23, 56, 0.6);
                border: 1px solid rgba(139, 120, 221, 0.15);
                border-radius: 6px;
                backdrop-filter: blur(8px);
                transition: all 0.2s ease;
                
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 8px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 12px;
                color: #9ca3af;

                position: relative;
                z-index: 2;
              }

              .tip-rain:hover {
                background: rgba(139, 120, 221, 0.15);
                border-color: rgba(139, 120, 221, 0.3);
                color: #ffffff;
              }

              .tip-rain button {
                outline: unset;
                border: 1px solid rgba(139, 120, 221, 0.3);
                background: rgba(139, 120, 221, 0.2);
                border-radius: 4px;
                
                height: 20px;
                padding: 0 8px;

                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 10px;
                color: #8b78dd;
                
                margin-left: auto;
                cursor: pointer;
                transition: all 0.2s ease;
                backdrop-filter: blur(4px);
              }

              .tip-rain button:hover {
                background: rgba(139, 120, 221, 0.3);
                color: #ffffff;
                border-color: rgba(139, 120, 221, 0.5);
              }
              
              .rain-amount {
                margin: 0;
                flex: 1;
                color: inherit;
                font-size: 12px;
                font-weight: 600;
              }

              .tip-rain img {
                width: 14px;
                height: 14px;
                object-fit: contain;
                opacity: 0.8;
                transition: opacity 0.2s ease;
                flex-shrink: 0;
              }

              .tip-rain:hover img {
                opacity: 1;
              }
              
              .dropdown-rain {
                position: absolute;
                width: calc(100% - 16px);
                min-width: 180px;

                border-radius: 8px;

                top: 30px;
                left: 0;
                right: 0;
                
                max-height: 0;
                z-index: 1;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                cursor: default;
              }
              
              .dropdown-rain.active {
                max-height: 160px;
              }

              .decoration-arrow {
                display: none;
              }
              
              .dropdown-rain-container {
                color: #9ca3af;
                padding: 8px;
                margin-top: 2px;
                width: 100%;
                box-sizing: border-box;
                
                background: rgba(14, 11, 39, 0.95);
                border: 1px solid rgba(139, 120, 221, 0.2);
                border-radius: 8px;
                backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              
              .header {
                display: flex;
                width: 100%;
                align-items: center;
                font-size: 10px;
                font-weight: 600;
              }

              .header p {
                margin: 0;
                color: #8b78dd;
              }
              
              .timer {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: auto;
                color: #9ca3af;
                font-size: 9px;
              }
              
              .input-wrapper {
                width: 100%;
                height: 24px;

                background: rgba(27, 23, 56, 0.6);
                border: 1px solid rgba(139, 120, 221, 0.1);
                
                padding: 0 6px;
                
                display: flex;
                align-items: center;
                gap: 6px;

                border-radius: 4px;
                backdrop-filter: blur(8px);
                transition: all 0.2s ease;
              }

              .input-wrapper:focus-within {
                border-color: rgba(139, 120, 221, 0.3);
                background: rgba(139, 120, 221, 0.15);
              }
              
              .input-wrapper input {
                background: unset;
                border: unset;
                outline: unset;
                
                height: 100%;
                width: 100%;
                
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 11px;
              }
              
              input::placeholder {
                color: #9ca3af;
              }

              .input-wrapper img {
                width: 12px;
                height: 12px;
                opacity: 0.7;
                flex-shrink: 0;
              }
              
              .tip {
                outline: unset;
                border: 1px solid rgba(139, 120, 221, 0.3);
                background: rgba(139, 120, 221, 0.2);
                border-radius: 4px;
                
                height: 24px;
                width: 100%;
                
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 10px;
                color: #8b78dd;
                
                cursor: pointer;
                transition: all 0.2s ease;
                backdrop-filter: blur(4px);
              }

              .tip:hover {
                background: rgba(139, 120, 221, 0.3);
                color: #ffffff;
                border-color: rgba(139, 120, 221, 0.5);
              }
            `}</style>
        </>
    );
}

export default TipRain;
