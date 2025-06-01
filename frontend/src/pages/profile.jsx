import {A, Outlet, useLocation} from "@solidjs/router";
import {createResource, Show} from "solid-js";
import Loader from "../components/Loader/loader";
import {authedAPI} from "../util/api";
import {useUser} from "../contexts/usercontextprovider";
import Level from "../components/Level/level";
import {getUserNextLevel, progressToNextLevel, xpForLevel} from "../resources/levels";
import Avatar from "../components/Level/avatar";
import {Title} from "@solidjs/meta";
import { TbChartBar, TbHistory, TbSettings, TbCoin, TbArrowUp, TbArrowDown, TbTrendingUp } from 'solid-icons/tb';
import PasswordModal from "../components/Modal/PasswordModal";
import { ModalProvider, useModal } from "../contexts/ModalContext";

function Profile(props) {

    const location = useLocation()
    const [user] = useUser()
    const [stats, {mutate: mutateStats}] = createResource(fetchStats)

    async function fetchStats() {
        try {
            let stats = await authedAPI(`/user/${user()?.id}/profile`, 'GET', null)
            return mutateStats(stats)
        } catch (e) {
            console.log(e)
            return mutateStats(null)
        }
    }

    function getCurrentXP() {
        return Math.floor(user().xp - xpForLevel(user()?.xp || 0))
    }

    function getTotalXPForNext() {
        return Math.floor(getUserNextLevel(user()?.xp || 0) - xpForLevel(user()?.xp || 0))
    }

    function isActive(page) {
        return location?.pathname?.includes(page)
    }

    return (
        <>
            <Title>BloxClash | Profile</Title>

            <ModalProvider>
                <ProfileContent 
                    location={location}
                    user={user}
                    stats={stats}
                    fetchStats={fetchStats}
                    getCurrentXP={getCurrentXP}
                    getTotalXPForNext={getTotalXPForNext}
                    isActive={isActive}
                />
            </ModalProvider>
        </>
    );
}

function ProfileContent(props) {
    const modal = useModal();

    return (
        <>
            {/* Global Password Modal */}
            <Show when={modal.showPasswordModal()}>
                <PasswordModal onClose={modal.closePasswordModal} />
            </Show>

            <div class="profile-page">
                <div class="profile-container">
                    
                    {/* Main Profile Section */}
                    <div class="profile-main">
                        <div class="profile-header">
                            <div class="avatar-section">
                                <Avatar id={props.user()?.id} xp={props.user()?.xp} height='64' avatar={props.user()?.avatar}/>
                            </div>
                            <div class="user-info">
                                <h1 class="username-profile">{props.user()?.username}</h1>
                                <div class="user-meta">
                                    <span class="user-id">#{props.user()?.id}</span>
                                    <Level xp={props.user()?.xp}/>
                                </div>
                            </div>
                        </div>

                        <div class="xp-section">
                            <div class="xp-header">
                                <div class="level-info">
                                    <Level xp={xpForLevel(props.user()?.xp || 0)}/>
                                </div>
                                <div class="xp-numbers">
                                    <span class="xp-current">{props.getCurrentXP()?.toLocaleString()}</span>
                                    <span>/</span>
                                    <span class="xp-total">{props.getTotalXPForNext()?.toLocaleString()}</span>
                                </div>
                                <div class="level-info">
                                    <Level xp={getUserNextLevel(props.user()?.xp || 0)}/>
                                </div>
                            </div>
                            <div class="progress-bar">
                                <div 
                                    class="progress-fill" 
                                    style={{width: `${100 - progressToNextLevel(props.user()?.xp || 0)}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats and Navigation Grid */}
                    <div class="content-grid">
                        
                        {/* Stats Section */}
                        <div class="stats-container">
                            <div class="stats-header">
                                <h3 class="stats-title">Account Statistics</h3>
                                <div class="stats-subtitle">Your gambling performance overview</div>
                            </div>
                            <Show when={!props.stats.loading} fallback={
                                <div class="stats-loading">
                                    <Loader/>
                                    <span>Loading statistics...</span>
                                </div>
                            }>
                                <div class="stats-grid">
                                    <div class="stat-card wagered-card">
                                        <div class="stat-header">
                                            <div class="stat-icon-wrapper wagered">
                                                <TbCoin size={20}/>
                                            </div>
                                           
                                        </div>
                                        <div class="stat-content">
                                            <div class="stat-label">Total Wagered</div>
                                            <div class="stat-value">
                                            <span class="currency">$</span>
                                                {(props.stats()?.wagered || 0)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2
                                                })}
                                                
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-card withdrawn-card">
                                        <div class="stat-header">
                                            <div class="stat-icon-wrapper withdrawn">
                                                <TbArrowUp size={20}/>
                                            </div>
                                       
                                        </div>
                                        <div class="stat-content">
                                            <div class="stat-label">Total Withdrawn</div>
                                            <div class="stat-value">
                                            <span class="currency">$</span>
                                                {(props.stats()?.withdraws || 0)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-card deposited-card">
                                        <div class="stat-header">
                                            <div class="stat-icon-wrapper deposited">
                                                <TbArrowDown size={20}/>
                                            </div>
                                           
                                        </div>
                                        <div class="stat-content">
                                            <div class="stat-label">Total Deposited</div>
                                            <div class="stat-value">
                                            <span class="currency">$</span>
                                                {(props.stats()?.deposits || 0)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-card profit-card">
                                        <div class="stat-header">
                                            <div class="stat-icon-wrapper profit">
                                                <TbTrendingUp size={20}/>
                                            </div>
                                           
                                        </div>
                                        <div class="stat-content">
                                            <div class="stat-label">Net Profit/Loss</div>
                                            <div class={`stat-value ${(props.stats()?.withdraws - props.stats()?.deposits) >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                                            <span class="currency">$</span>
                                                {((props.stats()?.withdraws - props.stats()?.deposits) || 0)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </div>

                        {/* Navigation */}
                        <div class="nav-container">
                            <h3 class="nav-title">Account</h3>
                            <div class="nav-list">
                                <A href='/profile/transactions' class={`nav-item ${props.isActive('transactions') ? 'active' : ''}`}>
                                    <TbChartBar size={16}/>
                                    <span>Transactions</span>
                                </A>
                                <A href='/profile/history' class={`nav-item ${props.isActive('history') ? 'active' : ''}`}>
                                    <TbHistory size={16}/>
                                    <span>History</span>
                                </A>
                                <A href='/profile/settings' class={`nav-item ${props.isActive('settings') ? 'active' : ''}`}>
                                    <TbSettings size={16}/>
                                    <span>Settings</span>
                                </A>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div class="content-section">
                        <Outlet />
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page {
                    min-height: 100vh;
                    padding: 1.5rem 1rem;
                }

                .profile-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* Main Profile Section */
                .profile-main {
                    background: rgba(26, 35, 50, 0.7);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar-section {
                    position: relative;
                    flex-shrink: 0;
                }

                .user-info {
                    flex: 1;
                    min-width: 0;
                }

                .username-profile {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 0.5rem 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    line-height: 1.2;
                }

                .user-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .user-id {
                    background: rgba(78, 205, 196, 0.1);
                    color: #4ecdc4;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 0.8rem;
                    font-weight: 500;
                    border: 1px solid rgba(78, 205, 196, 0.2);
                }

                /* XP Section */
                .xp-section {
                    background: rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(78, 205, 196, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .xp-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .level-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    transform: scale(0.85);
                }

                .level-text {
                    font-size: 0.7rem;
                    color: #8aa3b8;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .xp-numbers {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: #8aa3b8;
                }

                .xp-current {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                }

                .xp-total {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #4ecdc4;
                }

                .progress-bar {
                    height: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                    overflow: hidden;
                    border: 1px solid rgba(78, 205, 196, 0.1);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4ecdc4, #44a08d);
                    border-radius: 3px;
                    transition: width 0.8s ease;
                }

                /* Content Grid */
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 1.5rem;
                }

                /* Stats Container */
                .stats-container {
                    background: rgba(26, 35, 50, 0.7);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 16px;
                    padding: 1.25rem;
                    backdrop-filter: blur(10px);
                }

                .stats-header {
                    margin-bottom: 1rem;
                }

                .stats-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 0.5rem 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .stats-subtitle {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #8aa3b8;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .stats-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    color: #8aa3b8;
                    font-size: 0.9rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .stat-card {
                    background: rgba(78, 205, 196, 0.04);
                    border: 1px solid rgba(78, 205, 196, 0.1);
                    border-radius: 10px;
                    padding: 1rem;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    background: rgba(78, 205, 196, 0.08);
                    border-color: rgba(78, 205, 196, 0.2);
                    transform: translateX(2px);
                }

                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .stat-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid rgba(78, 205, 196, 0.2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4ecdc4;
                    flex-shrink: 0;
                }


                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                    min-width: 0;
                }

                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #8aa3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    word-break: break-all;
                }

                .currency {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #8aa3b8;
                }

                .profit-positive {
                    color: #4ecdc4;
                }

                .profit-negative {
                    color: #ff4a4a;
                }

                /* Navigation */
                .nav-container {
                    background: rgba(26, 35, 50, 0.7);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 16px;
                    padding: 1.25rem;
                    backdrop-filter: blur(10px);
                    height: fit-content;
                }

                .nav-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 1rem 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .nav-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 8px;
                    color: #8aa3b8;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .nav-item:hover {
                    background: rgba(78, 205, 196, 0.08);
                    color: #ffffff;
                    transform: translateX(2px);
                }

                .nav-item.active {
                    background: rgba(78, 205, 196, 0.15);
                    color: #4ecdc4;
                    border: 1px solid rgba(78, 205, 196, 0.3);
                }

                /* Content Section */
                .content-section {
                    background: rgba(26, 35, 50, 0.7);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    min-height: 400px;
                    overflow: hidden;
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .nav-container {
                        order: -1;
                    }

                    .nav-list {
                        flex-direction: row;
                        gap: 0.5rem;
                    }

                    .nav-item {
                        flex: 1;
                        justify-content: center;
                        text-align: center;
                    }
                }

                @media (max-width: 768px) {
                    .profile-page {
                        padding: 1rem 0.75rem;
                    }

                    .profile-main {
                        padding: 1.25rem;
                    }

                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                        gap: 0.75rem;
                    }

                    .username-profile {
                        font-size: 1.5rem;
                    }

                    .user-meta {
                        justify-content: center;
                    }

                    .xp-header {
                        flex-direction: column;
                        gap: 0.75rem;
                        text-align: center;
                    }

                    .stats-container,
                    .nav-container {
                        padding: 1rem;
                    }

                    .nav-list {
                        flex-direction: column;
                        gap: 0.375rem;
                    }

                    .nav-item {
                        justify-content: flex-start;
                    }
                }

                @media (max-width: 480px) {
                    .profile-page {
                        padding: 0.875rem 0.5rem;
                    }

                    .profile-main {
                        padding: 1rem;
                    }

                    .username-profile {
                        font-size: 1.375rem;
                    }

                    .xp-current {
                        font-size: 1rem;
                    }

                    .stat-value {
                        font-size: 1rem;
                    }

                    .user-meta {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .content-grid {
                        gap: 0.875rem;
                    }
                }
            `}</style>
        </>
    );
}

export default Profile;
