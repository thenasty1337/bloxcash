import {getUserLevel} from "../../resources/levels";

function Avatar(props) {

    function levelToColor(level) {
        if (typeof level === 'string') return level

        if (level < 2) return ''
        if (level < 26) {
            return 'green'
        }
        if (level < 51) {
            return 'blue'
        }
        if (level < 76) {
            return 'pink'
        }
        if (level < 100) {
            return 'gem'
        }
        return 'fire'
    }

    return (
        <>
            <div class={'avatar ' + (props?.dark ? 'dark ' : '') + (levelToColor(getUserLevel(props?.xp)))} style={{ width: props.height + 'px', height: props.height + 'px', 'min-width': props.height + 'px' }}>
                {props?.id === '?' ? (
                    <svg class='empty' xmlns="http://www.w3.org/2000/svg" width="10" height="14" viewBox="0 0 10 14" fill="none">
                        <path d="M2.75362 9.55652V8.4C2.75362 8.08889 2.78986 7.82512 2.86232 7.6087C2.93478 7.37874 3.06763 7.17585 3.26087 7C3.46618 6.82415 3.62319 6.70242 3.73188 6.63478C3.85266 6.55362 4.07609 6.42512 4.40217 6.24928L6.08696 5.33623C6.26812 5.24155 6.39493 5.16715 6.46739 5.11304C6.55193 5.04541 6.63043 4.94396 6.7029 4.8087C6.78744 4.67343 6.82971 4.50435 6.82971 4.30145V4.03768C6.82971 3.22609 6.20773 2.82029 4.96377 2.82029C3.74396 2.82029 3.13406 3.26667 3.13406 4.15942V4.76812C3.13406 5.17391 2.95894 5.37681 2.6087 5.37681H0.507246C0.169082 5.37681 0 5.17391 0 4.76812V3.63188C0 2.59034 0.398551 1.72464 1.19565 1.03478C1.99275 0.344928 3.24879 0 4.96377 0C6.71498 0 7.98913 0.338164 8.78623 1.01449C9.59541 1.6773 10 2.52271 10 3.55072V4.22029C10 5.1942 9.80072 5.93816 9.40217 6.45217C9.0157 6.96618 8.47826 7.37874 7.78986 7.68986L6.81159 8.13623C6.46135 8.29855 6.23188 8.44058 6.12319 8.56232C6.01449 8.68406 5.96015 8.88019 5.96015 9.15072V9.55652C5.96015 9.77295 5.92391 9.9285 5.85145 10.0232C5.77899 10.1043 5.64614 10.1449 5.4529 10.1449H3.27899C3.08575 10.1449 2.94686 10.1043 2.86232 10.0232C2.78986 9.9285 2.75362 9.77295 2.75362 9.55652ZM5.96015 11.6464V13.4116C5.96015 13.628 5.92391 13.7836 5.85145 13.8783C5.77899 13.9594 5.64614 14 5.4529 14H3.27899C3.08575 14 2.94686 13.9594 2.86232 13.8783C2.78986 13.7836 2.75362 13.628 2.75362 13.4116V11.6464C2.75362 11.2406 2.92874 11.0377 3.27899 11.0377H5.4529C5.79106 11.0377 5.96015 11.2406 5.96015 11.6464Z" fill="#9296D6"/>
                    </svg>
                ) : (
                    <img
                        src={props?.avatar ? props.avatar : '/assets/icons/anon.svg'}
                        alt=''
                        style={{ height: props?.height ? ((props.height - 4) + 'px') : '16px' }}
                        onError={e => { e.currentTarget.src = '/assets/icons/anon.svg'; }}
                    />
                )}
            </div>

            <style jsx>{`
              .avatar {
                position: relative;
                padding: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
              }

              .avatar:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              }

              .avatar img {
                border-radius: 50%;
                position: relative;
                z-index: 1;
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              
              .empty {
                position: relative;
                z-index: 1; 
              }
              
              .avatar.gold:before, .avatar.silver:before, .avatar.bronze:before {
                background: unset;
              }
              
              .avatar.purple:before {
                background: linear-gradient(135deg, #594ACB 0%, #6759D1 100%);
                box-shadow: 0 0 15px rgba(89, 74, 203, 0.4);
              }

              .avatar.yellowteam:before {
                background: linear-gradient(135deg, #DFFF18 0%, #F0FF6B 100%);
                box-shadow: 0 0 15px rgba(223, 255, 24, 0.4);
              }
              
              .avatar.yellowteam:after {
                background: linear-gradient(135deg, rgba(223, 255, 24, 0.25) 0%, rgba(223, 255, 24, 0.1) 100%), linear-gradient(230deg, #1A0E33 0%, #423C7A 100%);
              }

              .avatar.blueteam:before {
                background: linear-gradient(135deg, #3EC5FF 0%, #6BD3FF 100%);
                box-shadow: 0 0 15px rgba(62, 197, 255, 0.4);
              }

              .avatar.blueteam:after {
                background: linear-gradient(135deg, rgba(62, 197, 255, 0.25) 0%, rgba(62, 197, 255, 0.1) 100%), linear-gradient(230deg, #1A0E33 0%, #423C7A 100%);
              }

              .avatar:before {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                background: linear-gradient(135deg, #8F8DA1 0%, #A5A3B8 100%);
                z-index: 0;
              }
              
              .avatar.dark:after {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.10) 100%), #2F2B59;
              }

              .avatar:after {
                width: calc(100% - 4px);
                height: calc(100% - 4px);
                border-radius: 50%;
                content: '';
                position: absolute;
                left: 2px;
                top: 2px;
                background: var(--background);
                z-index: 0;
              }

              .avatar.green:before {
                background: linear-gradient(135deg, #56B66B 0%, #6BC876 100%);
                box-shadow: 0 0 15px rgba(86, 182, 107, 0.3);
              }

              .avatar.blue:before {
                background: linear-gradient(135deg, #559EE4 0%, #6BAEE8 100%);
                box-shadow: 0 0 15px rgba(85, 158, 228, 0.3);
              }
              
              .avatar.pink:before {
                background: linear-gradient(135deg, #BF50D1 0%, #D165DC 100%);
                box-shadow: 0 0 15px rgba(191, 80, 209, 0.3);
              }

              .avatar.gem:before {
                background: linear-gradient(135deg, #04B79D 0%, #2F8C62 50%, #39A581 100%);
                box-shadow: 0 0 15px rgba(4, 183, 157, 0.4);
              }
              
              .avatar.fire:before {
                background: linear-gradient(135deg, #FF9900 0%, #F9AC39 50%, #FFB84D 100%);
                box-shadow: 0 0 15px rgba(255, 153, 0, 0.4);
                animation: fireGlow 2s ease-in-out infinite alternate;
              }

              @keyframes fireGlow {
                0% {
                  box-shadow: 0 0 15px rgba(255, 153, 0, 0.4);
                }
                100% {
                  box-shadow: 0 0 20px rgba(255, 153, 0, 0.6);
                }
              }

              .avatar.bronze:before {
                background: linear-gradient(135deg, #CD7F32 0%, #B8721C 100%);
                box-shadow: 0 0 15px rgba(205, 127, 50, 0.3);
              }

              .avatar.bronze:after {
                border: 1px solid rgba(154, 108, 108, 0.5);
                background: linear-gradient(135deg, rgba(65, 55, 83, 0.9) 0%, rgba(75, 65, 93, 0.9) 100%);
              }
              
              .avatar.silver:before {
                background: linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%);
                box-shadow: 0 0 15px rgba(192, 192, 192, 0.4);
              }

              .avatar.silver:after {
                border: 1px solid rgba(193, 193, 193, 0.5);
                background: linear-gradient(135deg, rgba(96, 93, 126, 0.9) 0%, rgba(106, 103, 136, 0.9) 100%);
              }

              .avatar.gold:before {
                background: linear-gradient(135deg, #FFD700 0%, #F9AC39 50%, #FFC107 100%);
                box-shadow: 0 0 20px rgba(249, 172, 57, 0.5);
                animation: goldShine 3s ease-in-out infinite;
              }

              .avatar.gold:after {
                border: 1px solid rgba(249, 172, 57, 0.6);
                background: linear-gradient(135deg, rgba(103, 74, 68, 0.9) 0%, rgba(113, 84, 78, 0.9) 100%);
              }

              @keyframes goldShine {
                0%, 100% {
                  box-shadow: 0 0 20px rgba(249, 172, 57, 0.5);
                }
                50% {
                  box-shadow: 0 0 25px rgba(249, 172, 57, 0.7);
                }
              }
            `}</style>
        </>
    );
}

export default Avatar;
