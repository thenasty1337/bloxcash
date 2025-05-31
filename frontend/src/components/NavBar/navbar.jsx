import {A, useSearchParams} from "@solidjs/router";
import {createEffect, createSignal} from "solid-js";
import Level from "../Level/level";
import Circularprogress from "../Level/circularprogress";
import {progressToNextLevel} from "../../resources/levels";
import BottomNavBar from "./mobilenav";
import UserDropdown from "./userdropdown";
import {addDropdown} from "../../util/api";
import {useWebsocket} from "../../contexts/socketprovider";
import Countup from "../Countup/countup";
import Notifications from "./notifications";
import WalletModal from "../Modals/WalletModal";
import Web3Icon from "../Web3Icon/Web3Icon";
import { Show } from "solid-js";
import { 
  AiOutlineHome,
  AiOutlineTrophy,
  AiOutlineStar,
  AiOutlineLock,
  AiOutlineShop,
  AiOutlineMessage,
  AiOutlineBell
} from 'solid-icons/ai';
import { BiSolidWallet } from 'solid-icons/bi';
import { FiUser, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from 'solid-icons/fi';
import "./navbar.css";

function NavBar(props) {

    const [searchParams, setSearchParams] = useSearchParams()
    const [userDropdown, setUserDropdown] = createSignal(false)
    const [balanceDropdown, setBalanceDropdown] = createSignal(false)
    const [showWalletModal, setShowWalletModal] = createSignal(false)
    const [wagered, setWagered] = createSignal(0)
    const [ws] = useWebsocket()

    addDropdown(setUserDropdown)
    addDropdown(setBalanceDropdown)

    createEffect(() => {
        if (ws() && ws().connected) {
            ws().on('totalWagered', (amt) => setWagered(amt))
        }
    })

    // Toggle collapsed state for sidebar
    const toggleSidebarCollapsed = () => {
        if (props.setSidebarCollapsed) {
            props.setSidebarCollapsed(!props.sidebarCollapsed);
        }
    };

    // Updated cryptocurrency balances with proper symbols for Web3 icons
    const cryptoBalances = [
        { name: "Bitcoin", symbol: "btc", balance: 0.00, color: "#f7931a" },
        { name: "Tether", symbol: "usdt", balance: 2.65, color: "#26a17b" },
        { name: "USDC", symbol: "usdc", balance: 0.02, color: "#2775ca" },
        { name: "Ethereum", symbol: "eth", balance: 0.00, color: "#627eea" },
        { name: "Ripple", symbol: "xrp", balance: 0.00, color: "#23292f" },
        { name: "TRON", symbol: "trx", balance: 0.00, color: "#ff0013" },
        { name: "Litecoin", symbol: "ltc", balance: 0.00, color: "#bfbbbb" },
        { name: "Dogecoin", symbol: "doge", balance: 0.00, color: "#c2a633" },
        { name: "Cash", symbol: "usd", balance: 0.05, color: "#4ecdc4", isCustom: true }
    ];

    return (
        <>
            <div class={`navbar-container ${props.sidebarCollapsed ? 'sidebar-collapsed' : ''} ${props.chat ? 'chat-open' : ''}`}>
                <div class='main-navbar'>
                    <div class='navbar-content'>
                        {/* Sidebar Header - Logo and Collapse Button */}
                        <div class='sidebar-header-in-navbar'>
                            <div class='logo-section'>
                                <div class='logo-icon'>
                                    <AiOutlineStar size={24} />
                                </div>
                                <span class='logo-text'>BloxCash</span>
                            </div>
                            <button 
                                class='collapse-button' 
                                onClick={toggleSidebarCollapsed}
                                title={props.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {props.sidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                            </button>
                        </div>

                        {/* Balance Display - Center */}
                        <div class='nav-center-balance'>
                            {props.user && (
                                <div class='balance-section'>
                                    <div class='balance-dropdown-container'>
                                        <button 
                                            class={`center-wallet-balance-button ${balanceDropdown() ? 'active' : ''}`}
                                            onClick={(e) => {
                                                setBalanceDropdown(!balanceDropdown())
                                                e.stopPropagation()
                                            }}
                                        >
                                            <BiSolidWallet size={16} />
                                            <div class='center-balance-display'>
                                                <span class='currency-symbol'>$</span>
                                                <Countup end={props?.user?.balance} gray={true}/>
                                            </div>
                                            {balanceDropdown() ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                        </button>

                                        <Show when={balanceDropdown()}>
                                            <div class='balance-dropdown'>
                                                <div class='balance-dropdown-content'>
                                                    {cryptoBalances.map((crypto) => (
                                                        <div class='crypto-balance-item' onClick={() => setShowWalletModal(true)}>
                                                            {crypto.isCustom ? (
                                                                <div class='crypto-icon' style={`background-color: ${crypto.color}`}>
                                                                    $
                                                                </div>
                                                            ) : (
                                                                <Web3Icon 
                                                                    symbol={crypto.symbol} 
                                                                    size={32} 
                                                                    backgroundColor={crypto.color}
                                                                    fallback={crypto.symbol.toUpperCase().substring(0, 2)}
                                                                />
                                                            )}
                                                            <div class='crypto-info'>
                                                                <div class='crypto-name'>{crypto.name}</div>
                                                                <div class='crypto-symbol'>{crypto.symbol.toUpperCase()}</div>
                                                            </div>
                                                            <div class='crypto-balance'>
                                                                ${crypto.balance.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div class='wallet-settings' onClick={() => setShowWalletModal(true)}>
                                                        <div class='settings-icon'>⚙</div>
                                                        <span>Wallet Settings</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Show>
                                    </div>

                                    <button class='deposit-button' onClick={() => setShowWalletModal(true)}>
                                        Deposit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Side - User Section */}
                        <div class='user-section'>
                            {props.user ? (
                                <>
                                    {/* Control Buttons */}
                                    <button 
                                        class={`control-button ${props.chat ? 'active' : ''}`}
                                        onClick={() => props.setChat(!props.chat)}
                                        title="Chat"
                                    >
                                        <AiOutlineMessage size={16} />
                                    </button>

                                    <Notifications/>

                                    <div class={`user-profile ${userDropdown() ? 'active' : ''}`}
                                         onClick={(e) => {
                                             setUserDropdown(!userDropdown())
                                             e.stopPropagation()
                                         }}>
                                        <img
                                            src={props.user?.avatar ? props.user.avatar : '/assets/icons/anon.svg'}
                                            alt='User avatar'
                                            class='user-avatar'
                                            onError={e => { e.currentTarget.src = '/assets/icons/anon.svg'; }}
                                        />
                                        <span class='username'>{props.user?.username || 'Anonymous'}</span>
                                        <FiChevronDown 
                                            size={12}
                                            class='dropdown-arrow'
                                        />
                                        <UserDropdown user={props?.user} active={userDropdown()}
                                                      setActive={setUserDropdown}/>
                                    </div>
                                </>
                            ) : (
                                <button class='auth-button' onClick={() => setSearchParams({modal: 'login'})}>
                                    <FiUser size={16} />
                                    <span>Sign In</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <BottomNavBar 
                  chat={props.chat} 
                  setChat={props.setChat}
                  gamesSidebar={props.gamesSidebar} 
                  setGamesSidebar={props.setGamesSidebar}
                  user={props.user}
                />
            </div>
          
            <Show when={showWalletModal()}>
                <WalletModal show={showWalletModal()} close={() => setShowWalletModal(false)} />
            </Show>
        </>
    );
}

export default NavBar;
