import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Loader from "../Loader/loader";
import { TbVolume, TbEyeOff, TbBell, TbBrandDiscord, TbSettings, TbShieldCheck, TbPalette, TbMail, TbLock, TbKey, TbPhone, TbCurrencyDollar, TbClock, TbUserCheck, TbNotification, TbShield, TbDeviceMobile } from 'solid-icons/tb';
import { useModal } from "../../contexts/ModalContext";

function Settings(props) {
    /* 
     * DATA PRIORITIZATION:
     * - email: users.email (primary) → user_settings.email (fallback)
     * - verified: users.verified (primary) → user_settings.email_verified (fallback)
     * - 2FA: users.2fa (primary) → user_settings.two_factor_enabled (fallback)
     * - anon: users.anon (primary, already implemented)
     * - mentions: users.mentionsEnabled (primary) → localStorage (fallback)
     * - Other settings: user_settings table (phone, notifications, limits, etc.)
     */

    let slider
    const [mentions, setMentions] = createSignal(false) // Fallback for mentions, prioritize users table
    const [discord, { mutate }] = createResource(fetchDiscord)
    const [linked, setLinked] = createSignal(false)
    const [sound, setSound] = createSignal(localStorage.getItem('sound') || 100)
    const [user, { mutateUser }] = useUser()
    const modal = useModal()

    // Backend-connected settings
    const [userSettings, { mutate: mutateSettings }] = createResource(fetchUserSettings)
    const [loading, setLoading] = createSignal(false)

    // Local state for form inputs
    const [emailInput, setEmailInput] = createSignal('')
    const [phoneInput, setPhoneInput] = createSignal('')
    const [depositLimit, setDepositLimit] = createSignal('')
    const [withdrawalLimit, setWithdrawalLimit] = createSignal('')
    const [monthlyLossLimit, setMonthlyLossLimit] = createSignal('')
    const [realityCheckInterval, setRealityCheckInterval] = createSignal('')
    const [sessionTimeout, setSessionTimeout] = createSignal('')
    const [twoFactorSetup, setTwoFactorSetup] = createSignal(null)

    // Initialize form values from API response
    createEffect(() => {
        if (userSettings()) {
            setSessionTimeout(userSettings().session_timeout?.toString() || '43200') // Default 30 days
            setDepositLimit(userSettings().daily_deposit_limit || '')
            setWithdrawalLimit(userSettings().weekly_withdrawal_limit || '')
            setMonthlyLossLimit(userSettings().monthly_loss_limit || '')
            setRealityCheckInterval(userSettings().reality_check_interval ? userSettings().reality_check_interval.toString() : '')
            
            // Sync anonymous mode with userSettings if available, fallback to user context
            if (userSettings().anonymous_mode !== undefined) {
                // If userSettings has the anonymous_mode, update the user context to match
                if (user()?.anon !== userSettings().anonymous_mode) {
                    mutateUser({...user(), anon: userSettings().anonymous_mode})
                }
            }
        }
    })

    createEffect(() => {
        if (!localStorage.getItem('sound')) {
            localStorage.setItem('sound', 100)
            setSound(100)
        }

        // Initialize mentions from users table or localStorage as fallback
        if (user()?.mentionsEnabled !== undefined) {
            setMentions(user().mentionsEnabled)
        } else if (localStorage.getItem('mentions') !== null) {
            setMentions(localStorage.getItem('mentions') === 'true')
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

    async function fetchUserSettings() {
        try {
            let res = await authedAPI('/user/settings', 'GET', null)
            return mutateSettings(res)
        } catch (e) {
            console.log(e)
            return mutateSettings(null)
        }
    }

    async function updateEmail() {
        if (!emailInput().trim()) {
            createNotification('error', 'Please enter an email address')
            return
        }
        
        setLoading(true)
        try {
            let res = await authedAPI('/user/settings/email', 'POST', JSON.stringify({
                email: emailInput().trim()
            }))
            
            if (res.success) {
                createNotification('success', res.message)
                setEmailInput('')
                fetchUserSettings()
            }
        } catch (e) {
            console.error(e)
            createNotification('error', 'Failed to update email')
        } finally {
            setLoading(false)
        }
    }

    async function updatePhone() {
        if (!phoneInput().trim()) {
            createNotification('error', 'Please enter a phone number')
            return
        }
        
        setLoading(true)
        try {
            let res = await authedAPI('/user/settings/phone', 'POST', JSON.stringify({
                phone: phoneInput().trim()
            }))
            
            if (res.success) {
                createNotification('success', res.message)
                setPhoneInput('')
                fetchUserSettings()
            }
        } catch (e) {
            console.error(e)
            createNotification('error', 'Failed to update phone number')
        } finally {
            setLoading(false)
        }
    }

    async function setup2FA() {
        setLoading(true)
        try {
            let res = await authedAPI('/user/settings/2fa/setup', 'POST', null)
            
            if (res.secret) {
                setTwoFactorSetup(res)
                createNotification('info', res.message)
            }
        } catch (e) {
            console.error(e)
            createNotification('error', 'Failed to setup 2FA')
        } finally {
            setLoading(false)
        }
    }

    async function updateNotificationSettings(field, value) {
        try {
            let res = await authedAPI('/user/settings/notifications', 'POST', JSON.stringify({
                [field]: value
            }))
            
            if (res.success) {
                fetchUserSettings()
            }
        } catch (e) {
            console.error(e)
            createNotification('error', 'Failed to update notification settings')
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
                                        {(user()?.email || userSettings()?.email) && (
                                            <div class={`verification-status ${user()?.verified || userSettings()?.email_verified ? 'verified' : 'unverified'}`}>
                                                {user()?.verified || userSettings()?.email_verified ? '✓ Verified' : '⚠ Unverified'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="email"
                                        placeholder={user()?.email || userSettings()?.email || "Enter email address"}
                                        value={emailInput() || user()?.email || userSettings()?.email || ''}
                                        onInput={(e) => setEmailInput(e.target.value)}
                                        button={true}
                                        buttonText={loading() ? "Updating..." : "Update"}
                                        onButtonClick={updateEmail}
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
                                        {userSettings()?.phone && (
                                            <div class={`verification-status ${userSettings()?.phone_verified ? 'verified' : 'unverified'}`}>
                                                {userSettings()?.phone_verified ? '✓ Verified' : '⚠ Unverified'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="tel"
                                        placeholder={userSettings()?.phone || "Enter phone number"}
                                        value={phoneInput() || userSettings()?.phone || ''}
                                        onInput={(e) => setPhoneInput(e.target.value)}
                                        button={true}
                                        buttonText={loading() ? "Updating..." : (userSettings()?.phone ? "Update" : "Add")}
                                        onButtonClick={updatePhone}
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
                                        <p>Change your account password</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <button 
                                        class="action-button secondary"
                                        onClick={modal.openPasswordModal}
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
                                        active={user()?.['2fa'] || userSettings()?.two_factor_enabled || false} 
                                        toggle={() => {
                                            if (user()?.['2fa'] || userSettings()?.two_factor_enabled) {
                                                createNotification('info', '2FA disable feature requires additional verification')
                                            } else {
                                                setup2FA()
                                            }
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
                                        active={userSettings()?.anonymous_mode || user()?.anon || false} 
                                        toggle={async () => {
                                            const currentState = userSettings()?.anonymous_mode !== undefined 
                                                ? userSettings().anonymous_mode 
                                                : user()?.anon || false
                                            
                                            try {
                                                let res = await authedAPI('/user/anon', 'POST', JSON.stringify({
                                                    enable: !currentState
                                                }))

                                                if (res.success) {
                                                    // Update both user context and refetch settings
                                                    mutateUser({...user(), anon: !currentState})
                                                    fetchUserSettings()
                                                }
                                            } catch (e) {
                                                console.error('Failed to update anonymous mode:', e)
                                                createNotification('error', 'Failed to update anonymous mode')
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
                                        <p>Automatically log out after period of inactivity</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <select 
                                        class="setting-select"
                                        value={sessionTimeout() || userSettings()?.session_timeout?.toString() || '43200'}
                                        onChange={async (e) => {
                                            setSessionTimeout(e.target.value)
                                            localStorage.setItem('sessionTimeout', e.target.value)
                                            try {
                                                let res = await authedAPI('/user/settings/limits', 'POST', JSON.stringify({
                                                    session_timeout: parseInt(e.target.value)
                                                }))
                                                if (res.success) {
                                                    fetchUserSettings()
                                                    createNotification('success', 'Session timeout updated successfully')
                                                }
                                            } catch (e) {
                                                console.error('Failed to update session timeout:', e)
                                                createNotification('error', 'Failed to update session timeout')
                                            }
                                        }}
                                    >
                                        <option value="30">30 minutes</option>
                                        <option value="120">2 hours</option>
                                        <option value="1440">1 day</option>
                                        <option value="10080">7 days</option>
                                        <option value="43200">30 days</option>
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
                                        active={userSettings()?.email_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('email_notifications', !userSettings()?.email_notifications)
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
                                        active={userSettings()?.sms_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('sms_notifications', !userSettings()?.sms_notifications)
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
                                        active={user()?.mentionsEnabled || mentions()} 
                                        toggle={async () => {
                                            const newValue = !(user()?.mentionsEnabled || mentions())
                                            setMentions(newValue)
                                            localStorage.setItem('mentions', newValue)
                                            
                                            // Update in backend if we have user data
                                            try {
                                                let res = await authedAPI('/user/mentions', 'POST', JSON.stringify({
                                                    enable: newValue
                                                }))
                                                if (res.success) {
                                                    mutateUser({...user(), mentionsEnabled: newValue})
                                                }
                                            } catch (e) {
                                                console.error('Failed to update mentions setting:', e)
                                            }
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
                                        active={userSettings()?.marketing_emails || false} 
                                        toggle={() => {
                                            updateNotificationSettings('marketing_emails', !userSettings()?.marketing_emails)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Push Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbNotification size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Push Notifications</h4>
                                        <p>Receive browser notifications for important updates</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.push_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('push_notifications', !userSettings()?.push_notifications)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Login Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbShield size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Login Notifications</h4>
                                        <p>Get notified when someone logs into your account</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.login_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('login_notifications', !userSettings()?.login_notifications)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Security Alerts */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbShieldCheck size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Security Alerts</h4>
                                        <p>Receive alerts for suspicious account activity</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.security_alerts || false} 
                                        toggle={() => {
                                            updateNotificationSettings('security_alerts', !userSettings()?.security_alerts)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Deposit Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Deposit Notifications</h4>
                                        <p>Get notified when deposits are processed</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.deposit_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('deposit_notifications', !userSettings()?.deposit_notifications)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Withdrawal Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Withdrawal Notifications</h4>
                                        <p>Get notified when withdrawals are processed</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.withdrawal_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('withdrawal_notifications', !userSettings()?.withdrawal_notifications)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Bonus Notifications */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Bonus Notifications</h4>
                                        <p>Get notified about bonus rewards and promotions</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <CustomSwitch 
                                        active={userSettings()?.bonus_notifications || false} 
                                        toggle={() => {
                                            updateNotificationSettings('bonus_notifications', !userSettings()?.bonus_notifications)
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
                                        placeholder={userSettings()?.daily_deposit_limit || "Enter amount (USD)"}
                                        value={depositLimit() || userSettings()?.daily_deposit_limit || ''}
                                        onInput={(e) => setDepositLimit(e.target.value)}
                                        button={true}
                                        buttonText="Set Limit"
                                        onButtonClick={async () => {
                                            try {
                                                const limitValue = depositLimit() ? parseFloat(depositLimit()) : null
                                                let res = await authedAPI('/user/settings/limits', 'POST', JSON.stringify({
                                                    daily_deposit_limit: limitValue
                                                }))
                                                if (res.success) {
                                                    createNotification('success', `Daily deposit limit set to $${depositLimit()}`)
                                                    fetchUserSettings()
                                                }
                                            } catch (e) {
                                                createNotification('error', 'Failed to update deposit limit')
                                            }
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
                                        placeholder={userSettings()?.weekly_withdrawal_limit || "Enter amount (USD)"}
                                        value={withdrawalLimit() || userSettings()?.weekly_withdrawal_limit || ''}
                                        onInput={(e) => setWithdrawalLimit(e.target.value)}
                                        button={true}
                                        buttonText="Set Limit"
                                        onButtonClick={async () => {
                                            try {
                                                const limitValue = withdrawalLimit() ? parseFloat(withdrawalLimit()) : null
                                                let res = await authedAPI('/user/settings/limits', 'POST', JSON.stringify({
                                                    weekly_withdrawal_limit: limitValue
                                                }))
                                                if (res.success) {
                                                    createNotification('success', `Weekly withdrawal limit set to $${withdrawalLimit()}`)
                                                    fetchUserSettings()
                                                }
                                            } catch (e) {
                                                createNotification('error', 'Failed to update withdrawal limit')
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Monthly Loss Limit */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbCurrencyDollar size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Monthly Loss Limit</h4>
                                        <p>Set a monthly limit for losses (responsible gambling)</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <SettingInput 
                                        type="number"
                                        placeholder={userSettings()?.monthly_loss_limit || "Enter amount (USD)"}
                                        value={monthlyLossLimit() || userSettings()?.monthly_loss_limit || ''}
                                        onInput={(e) => setMonthlyLossLimit(e.target.value)}
                                        button={true}
                                        buttonText="Set Limit"
                                        onButtonClick={async () => {
                                            try {
                                                const limitValue = monthlyLossLimit() ? parseFloat(monthlyLossLimit()) : null
                                                let res = await authedAPI('/user/settings/limits', 'POST', JSON.stringify({
                                                    monthly_loss_limit: limitValue
                                                }))
                                                if (res.success) {
                                                    createNotification('success', `Monthly loss limit set to $${monthlyLossLimit()}`)
                                                    fetchUserSettings()
                                                }
                                            } catch (e) {
                                                createNotification('error', 'Failed to update loss limit')
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Reality Check */}
                            <div class="setting-item">
                                <div class="setting-info">
                                    <div class="setting-icon">
                                        <TbClock size={16}/>
                                    </div>
                                    <div class="setting-text">
                                        <h4>Reality Check Interval</h4>
                                        <p>Get reminders about your gambling time (minutes)</p>
                                    </div>
                                </div>
                                <div class="setting-control">
                                    <select 
                                        class="setting-select"
                                        value={(() => {
                                            const localValue = realityCheckInterval()
                                            const backendValue = userSettings()?.reality_check_interval
                                            console.log('Reality check - Local state:', localValue, 'Backend value:', backendValue)
                                            
                                            // If we have a local value (user just changed it), use that
                                            if (localValue !== undefined && localValue !== null) {
                                                return localValue
                                            }
                                            
                                            // Otherwise use backend value
                                            return backendValue ? backendValue.toString() : ''
                                        })()}
                                        onChange={async (e) => {
                                            const newValue = e.target.value
                                            setRealityCheckInterval(newValue)
                                            
                                            try {
                                                const intervalValue = newValue === '' ? null : parseInt(newValue)
                                                console.log('Sending reality check interval:', intervalValue, 'from value:', newValue) // Debug log
                                                
                                                let res = await authedAPI('/user/settings/limits', 'POST', JSON.stringify({
                                                    reality_check_interval: intervalValue
                                                }))
                                                
                                                if (res.success) {
                                                    // Ensure local state matches what we sent to backend
                                                    setRealityCheckInterval(newValue) 
                                                    createNotification('success', intervalValue === null ? 'Reality check disabled' : 'Reality check interval updated')
                                                    fetchUserSettings()
                                                } else {
                                                    // Revert local state if backend call failed
                                                    setRealityCheckInterval(userSettings()?.reality_check_interval ? userSettings().reality_check_interval.toString() : '')
                                                }
                                            } catch (e) {
                                                console.error('Reality check update error:', e)
                                                // Revert local state on error
                                                setRealityCheckInterval(userSettings()?.reality_check_interval ? userSettings().reality_check_interval.toString() : '')
                                                createNotification('error', 'Failed to update reality check')
                                            }
                                        }}
                                    >
                                        <option value="">Disabled</option>
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                    </select>
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

                .verification-status {
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-top: 0.25rem;
                    padding: 0.125rem 0.375rem;
                    border-radius: 4px;
                    display: inline-block;
                }

                .verification-status.verified {
                    background: rgba(78, 205, 196, 0.15);
                    color: #4ecdc4;
                    border: 1px solid rgba(78, 205, 196, 0.25);
                }

                .verification-status.unverified {
                    background: rgba(255, 193, 7, 0.15);
                    color: #ffc107;
                    border: 1px solid rgba(255, 193, 7, 0.25);
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
