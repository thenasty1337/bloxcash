import {getCents} from "../../util/balance";

function RainEnd(props) {

    return (
        <>
            <div class='rainend-container'>
                <div class='sparkle sparkle-1'></div>
                <div class='sparkle sparkle-2'></div>
                <div class='sparkle sparkle-3'></div>
                <div class='sparkle sparkle-4'></div>
                
                <div class='content'>
                    <div class='header'>
                        <div class='celebration-icon'>
                            🎉
                        </div>
                        <div class='header-text'>
                            <h3 class='title'>Rain Completed!</h3>
                            <p class='subtitle'>
                                <span class='user-count'>{props?.content?.users}</span>
                                <span class='text'> users successfully claimed {Math.floor(props?.content?.total || 0)}
                                <span class='cents'>.{getCents(props?.content?.total || 0)}</span></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
              @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
              }
              
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-2px); }
              }
              
              @keyframes glow-pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.05); }
              }
              
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(8px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .rainend-container {
                width: 100%;
                min-height: 90px;
                background: linear-gradient(135deg, 
                  rgba(26, 35, 50, 0.95) 0%, 
                  rgba(20, 28, 40, 0.95) 100%
                );
                border: 2px solid transparent;
                border-radius: 10px;
                padding: 16px;
                position: relative;
                overflow: hidden;
                animation: fadeInUp 0.6s ease-out;
                box-shadow: 
                  0 6px 24px rgba(0, 0, 0, 0.3),
                  0 2px 12px rgba(78, 205, 196, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.08);
              }
              
              .rainend-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                  rgba(78, 205, 196, 0.12) 0%, 
                  rgba(252, 163, 30, 0.08) 30%,
                  rgba(147, 51, 234, 0.08) 70%,
                  rgba(78, 205, 196, 0.12) 100%
                );
                border-radius: 10px;
                z-index: 0;
              }
              
              .rainend-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(78, 205, 196, 0.08) 50%, 
                  transparent 70%
                );
                z-index: 0;
              }
              
              .sparkle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #fca31e, #4ecdc4);
                border-radius: 50%;
                z-index: 1;
              }
              
              .sparkle-1 {
                top: 15%;
                left: 10%;
                animation: sparkle 2.5s infinite, float 3s ease-in-out infinite;
                animation-delay: 0s, 0.5s;
              }
              
              .sparkle-2 {
                top: 25%;
                right: 15%;
                animation: sparkle 2.5s infinite, float 3s ease-in-out infinite;
                animation-delay: 0.7s, 1s;
              }
              
              .sparkle-3 {
                bottom: 20%;
                left: 15%;
                animation: sparkle 2.5s infinite, float 3s ease-in-out infinite;
                animation-delay: 1.3s, 1.5s;
              }
              
              .sparkle-4 {
                bottom: 30%;
                right: 10%;
                animation: sparkle 2.5s infinite, float 3s ease-in-out infinite;
                animation-delay: 1.8s, 0s;
              }
              
              .content {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                gap: 14px;
                height: 100%;
              }
              
              .header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
              }
              
              .celebration-icon {
                font-size: 24px;
                animation: float 2.5s ease-in-out infinite;
                filter: drop-shadow(0 2px 6px rgba(252, 163, 30, 0.3));
              }
              
              .header-text {
                flex: 1;
              }
              
              .title {
                font-family: 'Geogrotesque Wide', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 700;
                font-size: 16px;
                color: #ffffff;
                margin: 0 0 3px 0;
                letter-spacing: 0.4px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #ffffff, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .subtitle {
                font-family: 'Geogrotesque Wide', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 500;
                font-size: 12px;
                color: #8aa3b8;
                margin: 0;
                line-height: 1.3;
              }
              
              .user-count {
                color: #4ecdc4;
                font-weight: 700;
                font-size: 13px;
                text-shadow: 0 1px 2px rgba(78, 205, 196, 0.3);
              }
              
              .text {
                color: #ffffff;
              }
              
              .amount-section {
                display: flex;
                justify-content: center;
              }
              
              .amount-display {
                display: flex;
                align-items: center;
                gap: 14px;
                background: linear-gradient(135deg, 
                  rgba(26, 35, 50, 0.8) 0%, 
                  rgba(20, 28, 40, 0.9) 100%
                );
                border: 1.5px solid rgba(78, 205, 196, 0.2);
                border-radius: 12px;
                padding: 12px 18px;
                backdrop-filter: blur(10px);
                box-shadow: 
                  0 4px 16px rgba(0, 0, 0, 0.25),
                  0 1px 4px rgba(78, 205, 196, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.08);
                transition: all 0.3s ease;
              }
              
              .amount-display:hover {
                transform: translateY(-1px);
                box-shadow: 
                  0 6px 20px rgba(0, 0, 0, 0.3),
                  0 2px 8px rgba(78, 205, 196, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.12);
              }
              
              .coin-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .coin-icon {
                position: relative;
                z-index: 2;
                filter: drop-shadow(0 3px 8px rgba(252, 163, 30, 0.4));
                animation: float 3s ease-in-out infinite;
                transition: transform 0.3s ease;
              }
              
              .coin-icon:hover {
                transform: scale(1.08) rotate(10deg);
              }
              
              .coin-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 45px;
                height: 45px;
                background: radial-gradient(circle, 
                  rgba(252, 163, 30, 0.3) 0%, 
                  rgba(252, 163, 30, 0.15) 40%, 
                  transparent 70%
                );
                border-radius: 50%;
                z-index: 1;
                animation: glow-pulse 2.5s ease-in-out infinite;
              }
              
                              .amount-wrapper {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 3px;
                min-width: 0;
                flex-shrink: 0;
              }
              
              .amount {
                font-family: 'Geogrotesque Wide', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 700;
                font-size: 18px;
                color: #ffffff;
                display: flex;
                align-items: baseline;
                gap: 1px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #ffffff, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                line-height: 1.1;
              }
              
              .cents {
                font-size: 14px;
                color: #8aa3b8;
                font-weight: 600;
                background: linear-gradient(135deg, #8aa3b8, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .amount-label {
                font-family: 'Geogrotesque Wide', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 500;
                font-size: 11px;
                color: #8aa3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
                line-height: 1;
                margin-top: 1px;
              }
              
              /* Responsive adjustments */
              @media (max-width: 480px) {
                .rainend-container {
                  padding: 14px;
                  min-height: 80px;
                }
                
                .header {
                  gap: 10px;
                }
                
                .celebration-icon {
                  font-size: 20px;
                }
                
                .title {
                  font-size: 14px;
                }
                
                .subtitle {
                  font-size: 11px;
                }
                
                .user-count {
                  font-size: 12px;
                }
                
                .amount-display {
                  padding: 10px 14px;
                  gap: 12px;
                }
                
                .coin-icon {
                  width: 28px;
                  height: 28px;
                }
                
                .coin-glow {
                  width: 38px;
                  height: 38px;
                }
                
                .amount {
                  font-size: 16px;
                }
                
                .cents {
                  font-size: 12px;
                }
                
                .amount-label {
                  font-size: 9px;
                }
                
                .sparkle {
                  width: 5px;
                  height: 5px;
                }
              }
            `}</style>
        </>
    );
}

export default RainEnd;
