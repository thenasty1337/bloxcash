import Games from "./games";
import {A, useSearchParams} from "@solidjs/router";
import {createEffect, createSignal} from "solid-js";
import Level from "../Level/level";
import Circularprogress from "../Level/circularprogress";
import {progressToNextLevel} from "../../resources/levels";
import BottomNavBar from "./mobilenav";
import UserDropdown from "./userdropdown";
import {addDropdown, logout} from "../../util/api";
import {useWebsocket} from "../../contexts/socketprovider";
import Countup from "../Countup/countup";
import Notifications from "./notifications";
import MobileNav from "./mobilenav";
import WalletModal from "../Modals/WalletModal";
import { Show } from "solid-js";

function NavBar(props) {

    const [searchParams, setSearchParams] = useSearchParams()
    const [userDropdown, setUserDropdown] = createSignal(false)
    const [showMobileNav, setShowMobileNav] = createSignal(false)
    const [showWalletModal, setShowWalletModal] = createSignal(false)
    const [wagered, setWagered] = createSignal(0)
    const [ws] = useWebsocket()

    addDropdown(setUserDropdown)

    createEffect(() => {
        if (ws() && ws().connected) {
            ws().on('totalWagered', (amt) => setWagered(amt))
        }
    })

    return (
        <>
            <div class='navbar-container'>
                <div class='header-navbar'>
                    <div class='content'>
                        <div class='totalbets'>
                            <img src='/assets/icons/coin.svg' height='15' alt=''/>
                            <p><span class='gold'>{Math.floor(wagered() || 0)?.toLocaleString()}</span> WAGERED</p>
                        </div>

                        {props?.user && (
                            <div class='rewards-wrapper'>
                                <button className='rewards' onClick={() => setSearchParams({modal: 'rakeback'})}>
                                    <img src='/assets/icons/rakeback.svg' height='12' width='10' alt=''/>
                                    <p>REWARDS</p>
                                </button>
                                <button className='bevel-purple surveys'>
                                    <img src='/assets/icons/surveys.svg' height='11' width='8' alt=''/>
                                    SURVEYS
                                    <A href='/surveys' class='gamemode-link'></A>
                                </button>
                            </div>
                        )}

                        <div class='extralinks'>
                            <p class='leaderboard link'><A href='/leaderboard'>LEADERBOARD</A></p>

                            {props.user && (
                                <p class='affiliates link'><A href='/affiliates'>AFFILIATES</A></p>
                            )}

                            <p class='link'><A href='/docs/provably'>FAIRNESS</A></p>
                            <p class='link'><A href='/docs/faq'>FAQ</A></p>
                            <p class='link'><A href='/docs/tos'>TOS</A></p>
                            <p class='link'><A href='/docs/aml'>AML</A></p>
                            <p class='link'><A href='/docs/privacy'>PRIVACY</A></p>

                            {props.user && (
                                <p class='logout link' onClick={() => logout()}>LOGOUT</p>
                            )}
                        </div>
                    </div>
                </div>

                <div class='main-navbar'>
                    <div class='content between'>
                        <div class='logo-wrapper'>
                            <img src='/assets/logo/small.png' alt='' height='35'/>
                            <A href='/' class='gamemode-link'></A>
                        </div>

                        <div class='links'>
                            <button class='bevel-gold home'>
                                <A href='/' class='gamemode-link'></A>
                            </button>

                            <Games/>
                        </div>

                        {props.user && (
                            <div class='balance-container'>
                                <div class='balance-display'>
                                    <div className='robux'>
                                        <span className='gold'>$</span>
                                        <p>
                                            <Countup end={props?.user?.balance} gray={true}/>
                                        </p>
                                    </div>
                                </div>

                                <button class='deposit-button' onClick={() => setShowWalletModal(true)}>
                                    <img src='/assets/icons/wallet.svg' alt='Wallet'/>
                                </button>
                            </div>
                        )}

                        <div class='user-container'>
                            {props.user ? (
                                <>
                                    <Notifications/>

                                    <div class='user-dropdown-minified'>
                                        <Circularprogress progress={progressToNextLevel(props?.user?.xp || 0)}>
                                            <div class='avatar'>
                                                <img
    src={props.user?.avatar ? props.user.avatar : '/assets/icons/anon.svg'}
    width='31' height='31'
    alt='User avatar'
    onError={e => { e.currentTarget.src = '/assets/icons/anon.svg'; }}
/>
                                            </div>
                                        </Circularprogress>
                                    </div>

                                    <div class={'user-dropdown-wrapper ' + (userDropdown() ? 'active' : '')}
                                         onClick={(e) => {
                                             setUserDropdown(!userDropdown())
                                             e.stopPropagation()
                                         }}>
                                        <div class='avatar-wrapper'>
                                            <Circularprogress progress={progressToNextLevel(props?.user?.xp || 0)}>
                                                <div class='avatar'>
                                                <img
    src={props.user?.avatar ? props.user.avatar : '/assets/icons/anon.svg'}
    width='31' height='31'
    alt='User avatar'
    onError={e => { e.currentTarget.src = '/assets/icons/anon.svg'; }}
/>
                                                </div>
                                            </Circularprogress>
                                        </div>

                                        <svg class='arrow' width="7" height="5" viewBox="0 0 7 5" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M3.50001 0.994671C3.62547 0.994671 3.7509 1.04269 3.84655 1.13852L6.8564 4.15579C7.04787 4.34773 7.04787 4.65892 6.8564 4.85078C6.66501 5.04263 6.5 4.99467 6.16316 4.99467L3.50001 4.99467L1 4.99467C0.5 4.99467 0.335042 5.04254 0.14367 4.85068C-0.0478893 4.65883 -0.0478893 4.34764 0.14367 4.1557L3.15347 1.13843C3.24916 1.04258 3.3746 0.994671 3.50001 0.994671Z"
                                                fill="#9489DB"/>
                                        </svg>

                                        <UserDropdown user={props?.user} active={userDropdown()}
                                                      setActive={setUserDropdown}/>
                                    </div>
                                </>
                            ) : (
                                <button class='bevel-gold signin' onClick={() => setSearchParams({modal: 'login'})}>SIGN
                                    IN</button>
                            )}
                        </div>
                    </div>
                </div>

                <div class='bar'/>

                <BottomNavBar chat={props.chat} setChat={props.setChat}/>
            </div>

            <MobileNav show={showMobileNav} close={() => setShowMobileNav(false)}/>
          
            <Show when={showWalletModal()}>
                <WalletModal show={showWalletModal()} close={() => setShowWalletModal(false)} />
            </Show>

            <style jsx>{`
              .navbar-container {
                width: 100%;
                height: fit-content;
                z-index: 99999;
                position: sticky;
                top: 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              }

              .header-navbar {
                width: 100%;
                height: 43px;
                background: linear-gradient(to right, #1E1A3C, #262147);
                display: flex;
                align-items: center;
                padding: 0 25px;
                border-bottom: 1px solid rgba(123, 120, 182, 0.15);
              }

              .main-navbar {
                width: 100%;
                height: 85px;
                background: rgba(45, 39, 85, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                padding: 0 25px;
                transition: all 0.3s ease;
              }

              .content {
                width: 100%;
                max-width: 1175px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                gap: 20px;
              }

              .content.between {
                justify-content: space-between;
              }

              .balance-container {
                height: 45px;
                min-width: 160px;
                padding: 0 0 0 15px;
                gap: 10px;
                font-variant-numeric: tabular-nums;
                align-items: center;
                display: flex;
                border-radius: 8px;
                border: 1px solid #866FEA;
                background: radial-gradient(60% 60% at 50% 50%, rgba(147, 126, 236, 0.2) 0%, rgba(102, 83, 184, 0.2) 100%), linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                box-shadow: 0px 0px 35px 0px rgba(180, 22, 255, 0.15), 0px 1px 5px 0px rgba(0, 0, 0, 0.25) inset;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Geogrotesque Wide';
                color: white;
                font-weight: 700;
                font-size: 14px;
                transition: all 0.3s ease;
              }

              .balance-container:hover {
                border-color: #9a85ff;
                box-shadow: 0px 0px 35px 0px rgba(180, 22, 255, 0.25), 0px 1px 5px 0px rgba(0, 0, 0, 0.25) inset;
              }

              .balance-container > * {
                position: relative;
              }

              .balance-display {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                width: 100%;
              }
              
              .rewards-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
              }

              .rewards {
                border-radius: 6px;
                border: 1px solid #B17818;
                background: linear-gradient(0deg, rgba(255, 190, 24, 0.25) 0%, rgba(255, 190, 24, 0.25) 100%), linear-gradient(253deg, #1A0E33 -27.53%, #423C7A 175.86%);
                height: 28px;
                padding: 0 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 12px;
                font-weight: 700;
                transition: all 0.2s ease;
              }

              .rewards:hover {
                border-color: #D19726;
                transform: translateY(-1px);
                box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
              }

              .rewards > p {
                background: linear-gradient(53deg, #F90 54.58%, #F9AC39 69.11%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              
              .surveys {
                height: 28px;
                padding: 0 12px;
                color: #2D2852;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 6px;
                position: relative;
                border-radius: 6px;
                transition: all 0.2s ease;
              }

              .surveys:hover {
                transform: translateY(-1px);
                box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
              }

              .robux {
                display: flex;
                gap: 8px;
              }

              .gold {
                color: #FFB636;
                font-weight: 700;
              }

              .cents {
                color: #A7A7A7;
              }

              .deposit-button {
                outline: unset;
                border: unset;
                height: 41px;
                width: 40px;
                min-width: 40px;
                border-radius: 6px;
                background: radial-gradient(60% 60% at 50% 50%, #937EEC 0%, #6653B8 100%);
                box-shadow: 0px 1.79879px 0px 0px #4E408B, 0px -1.79879px 0px 0px #8470DF;
                font-family: 'Geogrotesque Wide', sans-serif;
                color: white;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .deposit-button:hover {
                transform: translateY(-1px);
                box-shadow: 0px 2px 0px 0px #4E408B, 0px -1px 0px 0px #8470DF, 0px 3px 6px rgba(0, 0, 0, 0.2);
              }

              .user-container {
                display: flex;
                gap: 12px;
                height: 100%;
                align-items: center;
              }

              .user-dropdown-wrapper {
                display: flex;
                align-items: center;
                height: 43px;
                position: relative;
                gap: 10px;
                font-family: 'Geogrotesque Wide', sans-serif;
                font-weight: 700;
                font-size: 14px;
                color: #ADA3EF;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 0 5px;
                border-radius: 6px;
              }

              .user-dropdown-wrapper:hover {
                background: rgba(74, 64, 136, 0.3);
              }

              .avatar-wrapper {
                background: #413976;
                border: 1px solid rgba(62, 53, 128, 0.35);
                box-shadow: 0px -1px 0px #5B509E, 0px 1px 0px #282445;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                aspect-ratio: 1;
                transition: all 0.2s ease;
              }

              .user-dropdown-wrapper:hover .avatar-wrapper {
                border-color: rgba(89, 77, 173, 0.5);
              }

              .user-dropdown-wrapper.active svg {
                transform: rotate(180deg);
              }

              .avatar {
                position: relative;
                height: 35px;
                width: 35px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 5px;
              }

              .avatar img {
                position: relative;
                z-index: 1;
                border-radius: 5px;
                transition: transform 0.3s ease;
              }

              .user-dropdown-wrapper:hover .avatar img {
                transform: scale(1.05);
              }

              .avatar:before {
                width: 31px;
                height: 31px;
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                background: #413976;
                z-index: 1;
                border-radius: 4px;
              }

              .home {
                border: unset;
                outline: unset;
                padding: unset;
                position: relative;
                height: 45px;
                width: 45px;
                background-image: url('/assets/icons/house.svg');
                background-repeat: no-repeat;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
              }

              .home:hover {
                transform: translateY(-2px);
                box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
              }

              .signin {
                border: unset;
                outline: unset;
                padding: unset;
                height: 45px;
                width: 120px;
                font-family: 'Geogrotesque Wide';
                font-weight: 600;
                font-size: 14px;
                color: white;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                letter-spacing: 0.5px;
              }

              .signin:hover {
                transform: translateY(-2px);
                box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
              }

              .links {
                display: flex;
                align-items: center;
                gap: 16px;
              }

              .totalbets {
                display: flex;
                gap: 10px;
                align-items: center;
                font-family: 'Geogrotesque Wide';
                font-weight: 700;
                font-size: 13px;
                color: #9A90D1;
              }

              .extralinks {
                display: flex;
                margin-left: auto;
                gap: 16px;
              }

              .link {
                font-family: 'Geogrotesque Wide';
                font-style: normal;
                font-weight: 700;
                font-size: 13px;
                background: #9A90D1;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                opacity: 0.75;
                transition: all 0.3s ease;
                text-decoration: none;
                position: relative;
              }

              .link:after {
                content: '';
                position: absolute;
                bottom: -3px;
                left: 0;
                width: 0;
                height: 1px;
                background: #9A90D1;
                transition: width 0.3s ease;
              }

              .link:hover:after {
                width: 100%;
              }

              .affiliates {
                background: #59E878;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                opacity: 1;
              }

              .affiliates:after {
                background: #59E878;
              }

              .link:hover {
                opacity: 1;
              }

              .logout {
                opacity: 0.5;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                cursor: pointer;
              }

              .logout:hover {
                opacity: 0.85;
              }

              .leaderboard {
                background: linear-gradient(53.13deg, #FF9900 54.58%, #F9AC39 69.11%);
                opacity: 1;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
              }

              .leaderboard:after {
                background: #FF9900;
              }

              .bar {
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, #7435FA 0%, #435DE8 100%);
                box-shadow: 0px 0px 8px rgba(116, 53, 250, 0.5);
              }

              .logo-wrapper {
                display: none;
                position: relative;
                transition: transform 0.3s ease;
              }

              .logo-wrapper:hover {
                transform: scale(1.05);
              }

              .user-dropdown-minified {
                display: none;
              }

              @media only screen and (max-width: 1000px) {
                .header-navbar, .links, .user-dropdown-wrapper, .withdraw {
                  display: none;
                }

                .logo-wrapper, .user-dropdown-minified {
                  display: block;
                }

                .balance-container {
                  height: 38px;
                  font-size: 12px;
                  left: unset;
                  position: relative;
                  transform: unset;
                  min-width: 140px;
                }

                .deposit-button {
                  height: 34px;
                  font-size: 10px;
                }

                .main-navbar {
                  height: 70px;
                }

                .user-container {
                  gap: 8px;
                }

                .signin {
                  height: 38px;
                  width: 100px;
                  font-size: 12px;
                }
              }

              @media only screen and (max-width: 375px) {
                .logo-wrapper {
                  display: none;
                }

                .balance-container {
                  min-width: 120px;
                  padding-left: 10px;
                }
              }
            `}</style>
        </>
    );
}

export default NavBar;
