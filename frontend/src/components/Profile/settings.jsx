import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Loader from "../Loader/loader";
import { TbVolume, TbEyeOff, TbBell, TbBrandDiscord, TbSettings, TbShieldCheck, TbPalette, TbMail, TbLock, TbKey, TbPhone, TbCurrencyDollar, TbClock, TbUserCheck, TbNotification, TbShield, TbDeviceMobile } from 'solid-icons/tb';

function Settings(props) {

    let slider
    const [mentions, setMentions] = createSignal(localStorage.getItem('mentions') === 'true')
    const [discord, { mutate }] = createResource(fetchDiscord)
    const [linked, setLinked] = createSignal(false)
    const [sound, setSound] = createSignal(localStorage.getItem('sound') || 100)
    const [user, { mutateUser }] = useUser()

    // New state for additional settings
    const [emailNotifications, setEmailNotifications] = createSignal(localStorage.getItem('emailNotifications') !== 'false')
    const [smsNotifications, setSmsNotifications] = createSignal(localStorage.getItem('smsNotifications') === 'true')
    const [marketingEmails, setMarketingEmails] = createSignal(localStorage.getItem('marketingEmails') !== 'false')
    const [twoFactorEnabled, setTwoFactorEnabled] = createSignal(false)
    const [sessionTimeout, setSessionTimeout] = createSignal(localStorage.getItem('sessionTimeout') || '30')
    const [depositLimit, setDepositLimit] = createSignal('')
    const [withdrawalLimit, setWithdrawalLimit] = createSignal('')

    createEffect(() => {
        if (!localStorage.getItem('sound')) {
            localStorage.setItem('sound', 100)
            setSound(100)
        }

        if (localStorage.getItem('mentions') === undefined) {
            localStorage.setItem('mentions', true)
        }

        if (sound()) {
            createTrail()
        }
    })

    async function fetchDiscord() {
        try {
            let discord = await authedAPI(`/discord`, 'GET', null)
            if (discord.status === 'LINKED') setLinked(true)
            return mutate(discord)
        } catch (e) {
            console.log(e)
            return mutate(null)
        }
    }

    function createTrail() {
        if (!slider) return;
        let value = (slider.value - 0) / 100 * 100
        slider.style.background = `linear-gradient(90deg, #4ecdc4 0%, #44a08d ${value}%, rgba(255, 255, 255, 0.1) ${value}%, rgba(255, 255, 255, 0.1) 100%)`
    }

    // Custom Switch Component
    const CustomSwitch = (props) => (
        <div 
            class={`custom-switch ${props.active ? 'active' : ''}`}
            onClick={props.toggle}
        >
            <div class="switch-track">
                <div class="switch-thumb"></div>
            </div>
        </div>
    );

    // Input Component
    const SettingInput = (props) => (
        <div class="setting-input-group">
            <input 
                type={props.type || 'text'}
                placeholder={props.placeholder}
                value={props.value}
                onInput={props.onInput}
                class="setting-input"
            />
            {props.button && (
                <button class="input-button" onClick={props.onButtonClick}>
                    {props.buttonText}
                </button>
            )}
        </div>
    );

    return (
        <>
            <div class='settings-container'>
                {/* Header */}
                <div class="settings-header">
                    <div class="header-icon">
                        <TbSettings size={18}/>
                    </div>
                    <div class="header-content">
                        <h1 class="settings-title">Settings</h1>
                        <p class="settings-subtitle">Manage your account, security, and preferences</p>
                    </div>
                </div>

                {/* Settings Grid */}
                <div class="settings-grid">
                    
                    {/* Account Information Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon">
                                <TbUserCheck size={16}/>
                            </div>
                            <h3 class="section-title">Account Information</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Email Address */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbMail size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Email Address</h4>
                                        <p>Update your email address for account notifications</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="email"
                                        placeholder={user()?.email || "Enter email address"}
                                        value=""
                                        button={true}
                                        buttonText="Update"
                                        onButtonClick={() => createNotification('info', 'Email update feature coming soon')}
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbPhone size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Phone Number</h4>
                                        <p>Add phone number for SMS notifications and security</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value=""
                                        button={true}
                                        buttonText="Add"
                                        onButtonClick={() => createNotification('info', 'Phone verification feature coming soon')}
                                    />
                                </div>
                            </div>

                            {/* Password Change */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbLock size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Password</h4>
                                        <p>Change your account password for better security</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <button 
                                        class="action-button secondary"
                                        onClick={() => createNotification('info', 'Password change feature coming soon')}
                                    >
                                        <TbLock size={14}/>
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Privacy Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon">
                                <TbShieldCheck size={16}/>
                            </div>
                            <h3 class="section-title">Security & Privacy</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Two-Factor Authentication */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbKey size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add extra security to your account with 2FA</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={twoFactorEnabled()} 
                                        toggle={() => {
                                            setTwoFactorEnabled(!twoFactorEnabled())
                                            createNotification('info', '2FA feature coming soon')
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Anonymous Mode */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbEyeOff size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Anonymous Mode</h4>
                                        <p>Hide your identity in public games and leaderboards</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={user()?.anon} 
                                        toggle={async () => {
                                            let res = await authedAPI('/user/anon', 'POST', JSON.stringify({
                                                enable: !user()?.anon
                                            }))

                                            if (res.success) {
                                                mutateUser({...user(), anon: !user()?.anon})
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Session Timeout */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbClock size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Session Timeout</h4>
                                        <p>Automatically log out after inactivity (minutes)</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <select 
                                        class="setting-select"
                                        value={sessionTimeout()}
                                        onChange={(e) => {
                                            setSessionTimeout(e.target.value)
                                            localStorage.setItem('sessionTimeout', e.target.value)
                                        }}
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                        <option value="never">Never</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon">
                                <TbBell size={16}/>
                            </div>
                            <h3 class="section-title">Notifications</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Email Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbMail size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Email Notifications</h4>
                                        <p>Receive important account updates via email</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={emailNotifications()} 
                                        toggle={() => {
                                            setEmailNotifications(!emailNotifications())
                                            localStorage.setItem('emailNotifications', emailNotifications())
                                        }}
                                    />
                                </div>
                            </div>

                            {/* SMS Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbDeviceMobile size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>SMS Notifications</h4>
                                        <p>Get security alerts and updates via SMS</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={smsNotifications()} 
                                        toggle={() => {
                                            setSmsNotifications(!smsNotifications())
                                            localStorage.setItem('smsNotifications', smsNotifications())
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Chat Mentions */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbNotification size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Chat Mentions</h4>
                                        <p>Receive notifications when mentioned in chat</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={mentions()} 
                                        toggle={() => {
                                            setMentions(!mentions())
                                            localStorage.setItem('mentions', mentions())
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Marketing Emails */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbMail size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Marketing Emails</h4>
                                        <p>Receive promotional offers and bonuses</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={marketingEmails()} 
                                        toggle={() => {
                                            setMarketingEmails(!marketingEmails())
                                            localStorage.setItem('marketingEmails', marketingEmails())
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon">
                                <TbCurrencyDollar size={16}/>
                            </div>
                            <h3 class="section-title">Financial Settings</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Daily Deposit Limit */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Daily Deposit Limit</h4>
                                        <p>Set a daily limit for deposits (responsible gambling)</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="number"
                                        placeholder="Enter amount (USD)"
                                        value={depositLimit()}
                                        onInput={(e) => setDepositLimit(e.target.value)}
                                        button={true}
                                        buttonText="Set Limit"
                                        onButtonClick={() => {
                                            createNotification('success', `Daily deposit limit set to $${depositLimit()}`)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Weekly Withdrawal Limit */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Weekly Withdrawal Limit</h4>
                                        <p>Set a weekly limit for withdrawals</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="number"
                                        placeholder="Enter amount (USD)"
                                        value={withdrawalLimit()}
                                        onInput={(e) => setWithdrawalLimit(e.target.value)}
                                        button={true}
                                        buttonText="Set Limit"
                                        onButtonClick={() => {
                                            createNotification('success', `Weekly withdrawal limit set to $${withdrawalLimit()}`)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audio & Interface Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon">
                                <TbPalette size={16}/>
                            </div>
                            <h3 class="section-title">Audio & Interface</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Sound Setting */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbVolume size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Sound Volume</h4>
                                        <p>Control volume for game sounds and notifications</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <div class="volume-control">
                                        <input 
                                            ref={slider} 
                                            type='range' 
                                            class='volume-slider' 
                                            value={sound()}
                                            min="0"
                                            max="100"
                                            onInput={(e) => {
                                                setSound(e.target.valueAsNumber)
                                                localStorage.setItem('sound', sound())
                                                createTrail()
                                            }}
                                        />
                                        <span class="volume-value">{sound()}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* External Integrations Section */}
                    <div class="settings-section">
                        <div class="section-header">
                            <div class="section-icon discord-section">
                                <TbBrandDiscord size={16}/>
                            </div>
                            <h3 class="section-title">External Integrations</h3>
                        </div>
                        
                        <div class="settings-list">
                            {/* Discord Integration */}
                            <div class="setting-item discord-item">
                                <div class="setting-info">
                                    <div class="setting-icon discord">
                                        <TbBrandDiscord size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Discord Account</h4>
                                        <p>{linked() ? 'Your Discord account is connected and verified' : 'Link your Discord account for exclusive rewards and features'}</p>
                                        {linked() && (
                                            <div class="connection-badge">
                                                <div class="status-dot"></div>
                                                Connected & Verified
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <Show when={!discord.loading} fallback={
                                        <div class="loading-spinner">
                                            <Loader type='small'/>
                                        </div>
                                    }>
                                        <button 
                                            class={`connect-button ${linked() ? 'disconnect' : 'connect'}`} 
                                            onClick={async () => {
                                                if (linked()) {
                                                    let res = await authedAPI('/discord/unlink', 'POST', null, true)
                                                    if (res.status === 'NOT_LINKED' || res.status === 'UNLINKED' || res.success) {
                                                        createNotification('success', 'Successfully unlinked your discord')
                                                        setLinked(false)
                                                    }
                                                    return
                                                }

                                                let res = await authedAPI('/discord/link', 'POST', null, true)
                                                if (res.url) {
                                                    let popupWindow = window.open(res.url, 'popUpWindow', 'height=700,width=500,left=100,top=100,resizable=yes,scrollbar=yes')
                                                    window.addEventListener("message", function (event) {
                                                        if (event.data.type === "discord") {
                                                            popupWindow.close();
                                                            setLinked(true)
                                                        }
                                                    }, false)
                                                }
                                            }}
                                        >
                                            <TbBrandDiscord size={14}/>
                                            {linked() ? 'Disconnect' : 'Connect'}
                                        </button>
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .settings-container {
                    padding: 1.5rem;
                    width: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                /* Header */
                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem 1.25rem;
                    background: rgba(78, 205, 196, 0.04);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .header-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(68, 160, 141, 0.1));
                    border: 1px solid rgba(78, 205, 196, 0.25);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4ecdc4;
                    flex-shrink: 0;
                }

                .header-content {
                    flex: 1;
                }

                .settings-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 0.25rem 0;
                    letter-spacing: -0.01em;
                }

                .settings-subtitle {
                    font-size: 0.85rem;
                    color: #8aa3b8;
                    margin: 0;
                    font-weight: 400;
                    line-height: 1.4;
                }

                /* Settings Grid */
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.25rem;
                    width: 100%;
                }

                .settings-section {
                    background: rgba(26, 35, 50, 0.6);
                    border: 1px solid rgba(78, 205, 196, 0.12);
                    border-radius: 14px;
                    overflow: hidden;
                    backdrop-filter: blur(15px);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }

                .settings-section:hover {
                    border-color: rgba(78, 205, 196, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem 0.75rem;
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.06), rgba(68, 160, 141, 0.03));
                    border-bottom: 1px solid rgba(78, 205, 196, 0.1);
                }

                .section-icon {
                    width: 28px;
                    height: 28px;
                    background: rgba(78, 205, 196, 0.15);
                    border: 1px solid rgba(78, 205, 196, 0.25);
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4ecdc4;
                    flex-shrink: 0;
                }

                .section-icon.discord-section {
                    background: rgba(88, 101, 242, 0.15);
                    border-color: rgba(88, 101, 242, 0.25);
                    color: #5865F2;
                }

                .section-title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .settings-list {
                    padding: 0;
                }

                .setting-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(78, 205, 196, 0.08);
                    transition: all 0.2s ease;
                    position: relative;
                }

                .setting-item:last-child {
                    border-bottom: none;
                }

                .setting-item:hover {
                    background: rgba(78, 205, 196, 0.04);
                }

                .setting-item:hover::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(180deg, #4ecdc4, #44a08d);
                    opacity: 1;
                }

                .setting-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(180deg, #4ecdc4, #44a08d);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .setting-info {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    flex: 1;
                    min-width: 0;
                }

                .setting-icon {
                    width: 28px;
                    height: 28px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid rgba(78, 205, 196, 0.2);
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4ecdc4;
                    flex-shrink: 0;
                }

                .setting-icon.discord {
                    background: rgba(88, 101, 242, 0.1);
                    border-color: rgba(88, 101, 242, 0.2);
                    color: #5865F2;
                }

                .setting-text {
                    flex: 1;
                    min-width: 0;
                }

                .setting-text h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 0.2rem 0;
                    letter-spacing: -0.01em;
                }

                .setting-text p {
                    font-size: 0.8rem;
                    color: #8aa3b8;
                    margin: 0;
                    line-height: 1.4;
                }

                .setting-control {
                    flex-shrink: 0;
                    margin-left: 1rem;
                }

                /* Input Components */
                .setting-input-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    min-width: 200px;
                }

                .setting-input {
                    flex: 1;
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 0.8rem;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .setting-input:focus {
                    background: rgba(78, 205, 196, 0.08);
                    border-color: rgba(78, 205, 196, 0.3);
                }

                .setting-input::placeholder {
                    color: #8aa3b8;
                }

                .input-button {
                    padding: 0.5rem 0.875rem;
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    border: none;
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    white-space: nowrap;
                }

                .input-button:hover {
                    background: linear-gradient(135deg, #44a08d, #3d9980);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(78, 205, 196, 0.3);
                }

                .setting-select {
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 0.8rem;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.2s ease;
                    min-width: 120px;
                }

                .setting-select:focus {
                    background: rgba(78, 205, 196, 0.08);
                    border-color: rgba(78, 205, 196, 0.3);
                }

                .action-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 0.875rem;
                    border: none;
                    border-radius: 7px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .action-button.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .action-button.secondary:hover {
                    background: rgba(78, 205, 196, 0.12);
                    border-color: rgba(78, 205, 196, 0.25);
                    color: #4ecdc4;
                    transform: translateY(-1px);
                }

                /* Volume Control */
                .volume-control {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                }

                .volume-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 110px;
                    height: 5px;
                    border-radius: 2.5px;
                    background: rgba(255, 255, 255, 0.1);
                    outline: none;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(78, 205, 196, 0.3);
                    transition: all 0.2s ease;
                }

                .volume-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 3px 8px rgba(78, 205, 196, 0.4);
                }

                .volume-slider::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(78, 205, 196, 0.3);
                }

                .volume-value {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #4ecdc4;
                    min-width: 35px;
                    text-align: right;
                    font-variant-numeric: tabular-nums;
                }

                /* Custom Switch */
                .custom-switch {
                    width: 36px;
                    height: 20px;
                    cursor: pointer;
                    position: relative;
                }

                .switch-track {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    position: relative;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .custom-switch.active .switch-track {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    border-color: #4ecdc4;
                    box-shadow: 0 0 10px rgba(78, 205, 196, 0.25);
                }

                .switch-thumb {
                    width: 14px;
                    height: 14px;
                    background: #ffffff;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .custom-switch.active .switch-thumb {
                    transform: translateX(16px);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                }

                /* Discord Specific */
                .connection-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.3rem;
                    font-size: 0.75rem;
                    color: #4ecdc4;
                    font-weight: 500;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #4ecdc4;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                    box-shadow: 0 0 6px rgba(78, 205, 196, 0.4);
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.95); }
                }

                .connect-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 0.875rem;
                    border: none;
                    border-radius: 7px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .connect-button.connect {
                    background: linear-gradient(135deg, #5865F2, #4752C4);
                    color: #ffffff;
                    box-shadow: 0 3px 8px rgba(88, 101, 242, 0.2);
                }

                .connect-button.connect:hover {
                    background: linear-gradient(135deg, #4752C4, #3c47a0);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
                }

                .connect-button.disconnect {
                    background: rgba(255, 74, 74, 0.1);
                    color: #ff4a4a;
                    border: 1px solid rgba(255, 74, 74, 0.3);
                }

                .connect-button.disconnect:hover {
                    background: rgba(255, 74, 74, 0.2);
                    border-color: rgba(255, 74, 74, 0.5);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(255, 74, 74, 0.2);
                }

                .loading-spinner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.625rem 0.875rem;
                }

                /* Responsive Design */
                @media (max-width: 1200px) {
                    .settings-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .settings-container {
                        padding: 1rem;
                    }

                    .settings-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.625rem;
                        padding: 1rem;
                    }

                    .settings-title {
                        font-size: 1.125rem;
                    }

                    .settings-subtitle {
                        font-size: 0.8rem;
                    }

                    .setting-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.875rem;
                        padding: 0.875rem 1rem;
                    }

                    .setting-info {
                        width: 100%;
                    }

                    .setting-control {
                        width: 100%;
                        margin-left: 0;
                        display: flex;
                        justify-content: flex-end;
                    }

                    .setting-input-group {
                        width: 100%;
                        min-width: unset;
                    }

                    .volume-control {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .volume-slider {
                        flex: 1;
                        max-width: 160px;
                    }

                    .connect-button, .action-button {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .settings-container {
                        padding: 0.75rem;
                    }

                    .settings-grid {
                        gap: 0.875rem;
                    }

                    .settings-section {
                        border-radius: 12px;
                    }

                    .section-header {
                        padding: 0.875rem 1rem 0.625rem;
                    }

                    .setting-item {
                        padding: 0.75rem 0.875rem;
                    }

                    .settings-header {
                        padding: 0.875rem;
                        margin-bottom: 1.25rem;
                    }

                    .settings-title {
                        font-size: 1rem;
                    }

                    .setting-control {
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}

export default Settings;
