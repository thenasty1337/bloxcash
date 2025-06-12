function Loader(props) {
    return (
        <>
            <div class={'loader-container ' + (props?.type === 'small' ? 'small' : '')}>
                <div class='loader-wrapper'>
                    <div class='loader-ring'></div>
                    <div class='loader-ring'></div>
                    <div class='loader-ring'></div>
                    <div class='loader-center'></div>
                </div>
                {!props?.type && (
                    <div class='loader-text'>Loading...</div>
                )}
            </div>

            <style jsx>{`
              .loader-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                align-items: center;
                justify-content: center;
                padding: 20px 0;
                gap: 16px;
              }

              .loader-wrapper {
                position: relative;
                width: ${props?.type === 'small' ? '40px' : '80px'};
                height: ${props?.type === 'small' ? '40px' : '80px'};
                max-height: ${props?.max || 'unset'};
              }

              .loader-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 3px solid transparent;
                border-radius: 50%;
                animation: spin 2s linear infinite;
              }

              .loader-ring:nth-child(1) {
                border-top: 3px solid #4ecdc4;
                animation-duration: 2s;
                animation-delay: 0s;
              }

              .loader-ring:nth-child(2) {
                border-right: 3px solid rgba(78, 205, 196, 0.6);
                animation-duration: 1.5s;
                animation-delay: -0.5s;
                animation-direction: reverse;
              }

              .loader-ring:nth-child(3) {
                border-bottom: 3px solid rgba(78, 205, 196, 0.3);
                animation-duration: 1s;
                animation-delay: -1s;
              }

              .loader-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 16px;
                height: 16px;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border-radius: 50%;
                animation: pulse 1.5s ease-in-out infinite;
                box-shadow: 0 0 0 4px rgba(78, 205, 196, 0.1);
              }

              .loader-text {
                color: #8aa3b8;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                animation: fade 2s ease-in-out infinite;
              }
              
              .small {
                padding: 10px;
                gap: 8px;
              }
              
              .small .loader-center {
                width: 8px;
                height: 8px;
                box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.1);
              }

              .small .loader-ring {
                border-width: 2px;
              }

              .small .loader-ring:nth-child(1) {
                border-top: 2px solid #4ecdc4;
              }

              .small .loader-ring:nth-child(2) {
                border-right: 2px solid rgba(78, 205, 196, 0.6);
              }

              .small .loader-ring:nth-child(3) {
                border-bottom: 2px solid rgba(78, 205, 196, 0.3);
              }

              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }

              @keyframes pulse {
                0%, 100% {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 1;
                }
                50% {
                  transform: translate(-50%, -50%) scale(1.2);
                  opacity: 0.8;
                }
              }

              @keyframes fade {
                0%, 100% {
                  opacity: 0.6;
                }
                50% {
                  opacity: 1;
                }
              }
            `}</style>
        </>
    );
}

export default Loader;
