import {A, useSearchParams} from "@solidjs/router";
import {createEffect, createSignal} from "solid-js";
import Level from "../Level/level";
import Circularprogress from "../Level/circularprogress";
import Avatar from "../Level/avatar";
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
    const [selectedCrypto, setSelectedCrypto] = createSignal(null)
    const [wagered, setWagered] = createSignal(0)
    const [ws] = useWebsocket()

    addDropdown(setUserDropdown)
    addDropdown(setBalanceDropdown)

    createEffect(() => {
        if (ws() && ws().connected) {
            ws().on('totalWagered', (amt) => setWagered(amt))
        }
    })

    // Listen for custom event to open wallet modal with selected crypto
    createEffect(() => {
        const handleOpenWalletModal = (event) => {
            if (event.detail && event.detail.crypto) {
                setSelectedCrypto(event.detail.crypto);
                setShowWalletModal(true);
            }
        };

        window.addEventListener('openWalletModal', handleOpenWalletModal);
        
        // Cleanup function
        return () => {
            window.removeEventListener('openWalletModal', handleOpenWalletModal);
        };
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
                        {/* Left Side - User Level/Rank Info */}
                        <div class='nav-left-section'>
                            <button 
                                class='collapse-button' 
                                onClick={toggleSidebarCollapsed}
                                title={props.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {props.sidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                            </button>
                            {props.user && (
                                <div class='user-rank-display'>
                                    <div class='sparkle-1'>✦</div>
                                    <div class='sparkle-2'>✧</div>
                                    <Avatar 
                                        avatar={props.user?.avatar}
                                        xp={props.user?.xp}
                                        height={32}
                                    />
                                    <div class='rank-info'>
                                        <span class='rank-title'>
                                            {(() => {
                                                const level = Math.floor(Math.sqrt(props.user?.xp || 0));
                                                if (level <= 5) return "Bronze Rank";
                                                if (level <= 15) return "Silver Rank";
                                                if (level <= 30) return "Gold Rank";
                                                if (level <= 50) return "Platinum Rank";
                                                if (level <= 75) return "Diamond Rank";
                                                return "Master Rank";
                                            })()}
                                        </span>
                                        <div class='xp-display'>
                                            <span class='xp-icon'>⚡</span>
                                            <span class='xp-text'>
                                                {Math.floor(props.user?.xp - (Math.floor(Math.sqrt(props.user?.xp || 0)) ** 2)) || 0}/
                                                {Math.floor(((Math.floor(Math.sqrt(props.user?.xp || 0)) + 1) ** 2) - (Math.floor(Math.sqrt(props.user?.xp || 0)) ** 2)) || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Center - Logo */}
                        <div class='nav-center-logo'>
                            <A href='/' class='logo-section'>
                                <img 
                                    src="/assets/logo/nova-logo.png" 
                                    alt="Nova Casino Logo" 
                                    class='logo-image'
                                    style="max-width: 120px; height: auto; filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.8));"
                                />
                            </A>
                        </div>

                        {/* Balance Display - Center Right */}
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
                                            <div class='center-balance-display'>
                                                {/* <span class='currency-symbol'>$</span> */}
                                                $<Countup end={props?.user?.balance} gray={true}/>
                                            </div>
                                            {balanceDropdown() ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                        </button>
                                    </div>

                                    <button class='deposit-button' onClick={() => setShowWalletModal(true)}>
                                        WALLET
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
                            )}
                        </div>

                        {/* Right Side - User Section */}
                        <div class='user-section'>
                            {/* Chat Button - Available for all users */}
                            <button 
                                class={`control-button ${props.chat ? 'active' : ''}`}
                                onClick={() => props.setChat(!props.chat)}
                                title="Chat"
                            >
                                <AiOutlineMessage size={16} />
                            </button>

                            {props.user ? (
                                <>
                                    <Notifications/>

                                    <div class={`user-profile ${userDropdown() ? 'active' : ''}`}
                                         onClick={(e) => {
                                             setUserDropdown(!userDropdown())
                                             e.stopPropagation()
                                         }}>
                                        <Avatar 
                                            avatar={props.user?.avatar}
                                            xp={props.user?.xp}
                                            height={24}
                                        />
                                        <span class='username' title={props.user?.username || 'Anonymous'}>
                                            {props.user?.username?.length > 12 
                                                ? props.user?.username?.slice(0, 12) + '...' 
                                                : props.user?.username || 'Anonymous'}
                                        </span>
                                        <FiChevronDown 
                                            size={12}
                                            class='dropdown-arrow'
                                        />
                                        <UserDropdown user={props?.user} active={userDropdown()}
                                                      setActive={setUserDropdown}/>
                                    </div>
                                </>
                            ) : (
                                <div class='auth-buttons'>
                                    <button 
                                        class='login-button' 
                                        onClick={() => setSearchParams({modal: 'login', mode: 'login'})}
                                        title="Sign in to your account"
                                    >
                                        <FiUser size={14} />
                                        <span>Login</span>
                                    </button>
                                    <button 
                                        class='signup-button' 
                                        onClick={() => setSearchParams({modal: 'login', mode: 'signup'})}
                                        title="Create a new account"
                                    >
                                        <AiOutlineStar size={14} />
                                        <span>Sign Up</span>
                                    </button>
                                </div>
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
                <WalletModal 
                    show={showWalletModal()} 
                    close={() => {
                        setShowWalletModal(false);
                        setSelectedCrypto(null); // Clear selected crypto when closing
                    }}
                    user={props.user}
                    selectedCrypto={selectedCrypto()}
                />
            </Show>
        </>
    );
}

export default NavBar;
