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
            <Title>Nova Casino | Profile</Title>

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
                            <div class="profile-info">
                                <div class="avatar-section">
                                    <Avatar id={props.user()?.id} xp={props.user()?.xp} height='80' avatar={props.user()?.avatar}/>
                                    <div class="level-overlay">
                                        <Level xp={props.user()?.xp}/>
                                    </div>
                                </div>
                                <div class="user-details">
                                    <h1 class="username-profile">{props.user()?.username}</h1>
                                    <div class="user-meta">
                                        <span class="user-id">#{props.user()?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="xp-section">
                            <div class="xp-info">
                                <div class="xp-text">
                                    <span class="xp-label">Experience Progress</span>
                                    <div class="xp-numbers">
                                        <span class="xp-current">{props.getCurrentXP()?.toLocaleString()}</span>
                                        <span class="xp-separator">/</span>
                                        <span class="xp-total">{props.getTotalXPForNext()?.toLocaleString()}</span>
                                        <span class="xp-unit">XP</span>
                                    </div>
                                </div>
                                <div class="level-progression">
                                    <div class="level-badge current">
                                        <Level xp={xpForLevel(props.user()?.xp || 0)}/>
                                    </div>
                                    <div class="level-arrow">→</div>
                                    <div class="level-badge next">
                                        <Level xp={getUserNextLevel(props.user()?.xp || 0)}/>
                                    </div>
                                </div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div 
                                        class="progress-fill" 
                                        style={{width: `${100 - progressToNextLevel(props.user()?.xp || 0)}%`}}
                                    ></div>
                                </div>
                                <div class="progress-percentage">
                                    {Math.round(100 - progressToNextLevel(props.user()?.xp || 0))}%
                                </div>
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
                    background: linear-gradient(135deg, rgba(24, 20, 52, 0.95), rgba(14, 11, 39, 0.9));
                    border: 1px solid rgba(139, 120, 221, 0.3);
                    border-radius: 20px;
                    padding: 2rem;
                    backdrop-filter: blur(12px);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    box-shadow: 0 8px 32px rgba(139, 120, 221, 0.1);
                    position: relative;
                    overflow: hidden;
                }

                .profile-main::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(139, 120, 221, 0.5), transparent);
                    z-index: 1;
                }

                .profile-header {
                    position: relative;
                    z-index: 2;
                }

                .profile-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .avatar-section {
                    position: relative;
                    flex-shrink: 0;
                    filter: drop-shadow(0 4px 12px rgba(139, 120, 221, 0.3));
                }

                .level-overlay {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    background: rgba(24, 20, 52, 0.95);
                    border: 2px solid rgba(139, 120, 221, 0.4);
                    border-radius: 12px;
                    padding: 0.25rem 0.375rem;
                    backdrop-filter: blur(8px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transform: scale(0.85);
                    z-index: 10;
                }

                .user-details {
                    flex: 1;
                    min-width: 0;
                }

                .username-profile {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0 0 0.75rem 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    line-height: 1.1;
                    background: linear-gradient(135deg, #ffffff, #e1deff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .user-meta {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .user-id {
                    background: rgba(139, 120, 221, 0.15);
                    color: #c4b8ff;
                    padding: 0.375rem 0.75rem;
                    border-radius: 8px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid rgba(139, 120, 221, 0.3);
                    backdrop-filter: blur(4px);
                }



                /* XP Section */
                .xp-section {
                    background: rgba(139, 120, 221, 0.08);
                    border: 1px solid rgba(139, 120, 221, 0.2);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    backdrop-filter: blur(4px);
                    position: relative;
                }

                .xp-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .xp-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .xp-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #c4b8ff;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .xp-numbers {
                    display: flex;
                    align-items: baseline;
                    gap: 0.375rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .xp-current {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #ffffff;
                }

                .xp-separator {
                    font-size: 1.25rem;
                    color: #8aa3b8;
                    font-weight: 400;
                }

                .xp-total {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #8b78dd;
                }

                .xp-unit {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #8aa3b8;
                    margin-left: 0.25rem;
                }

                .level-progression {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .level-badge {
                    background: rgba(139, 120, 221, 0.1);
                    border: 1px solid rgba(139, 120, 221, 0.2);
                    border-radius: 12px;
                    padding: 0.5rem;
                    backdrop-filter: blur(4px);
                    transform: scale(0.9);
                }

                .level-badge.current {
                    background: rgba(139, 120, 221, 0.2);
                    border-color: rgba(139, 120, 221, 0.4);
                }

                .level-badge.next {
                    background: rgba(139, 120, 221, 0.05);
                    border-color: rgba(139, 120, 221, 0.15);
                    opacity: 0.8;
                }

                .level-arrow {
                    font-size: 1.25rem;
                    color: #8b78dd;
                    font-weight: 600;
                }

                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .progress-bar {
                    flex: 1;
                    height: 8px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(139, 120, 221, 0.15);
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #8b78dd, #c4b8ff, #8b78dd);
                    background-size: 200% 100%;
                    border-radius: 6px;
                    transition: width 1s ease;
                    animation: shimmer 2s ease-in-out infinite;
                    position: relative;
                }

                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: progress-shine 2s ease-in-out infinite;
                }

                .progress-percentage {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #8b78dd;
                    min-width: 2.5rem;
                    text-align: right;
                }

                @keyframes shimmer {
                    0%, 100% { background-position: 200% 0; }
                    50% { background-position: -200% 0; }
                }

                @keyframes progress-shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                /* Content Grid */
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 1.5rem;
                }

                /* Stats Container */
                .stats-container {
                    background: rgba(24, 20, 52, 0.8);
                    border: 1px solid rgba(139, 120, 221, 0.2);
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
                    background: rgba(139, 120, 221, 0.04);
                    border: 1px solid rgba(139, 120, 221, 0.1);
                    border-radius: 10px;
                    padding: 1rem;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    background: rgba(139, 120, 221, 0.08);
                    border-color: rgba(139, 120, 221, 0.2);
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
                    background: rgba(139, 120, 221, 0.1);
                    border: 1px solid rgba(139, 120, 221, 0.2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8b78dd;
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
                    color: #8b78dd;
                }

                .profit-negative {
                    color: #ff4a4a;
                }

                /* Navigation */
                .nav-container {
                    background: rgba(24, 20, 52, 0.8);
                    border: 1px solid rgba(139, 120, 221, 0.2);
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
                    background: rgba(139, 120, 221, 0.08);
                    color: #ffffff;
                    transform: translateX(2px);
                }

                .nav-item.active {
                    background: rgba(139, 120, 221, 0.15);
                    color: #8b78dd;
                    border: 1px solid rgba(139, 120, 221, 0.3);
                }

                /* Content Section */
                .content-section {
                    background: rgba(24, 20, 52, 0.8);
                    border: 1px solid rgba(139, 120, 221, 0.2);
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
                        padding: 1.5rem;
                    }

                    .profile-info {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .username-profile {
                        font-size: 1.75rem;
                    }

                    .user-meta {
                        justify-content: center;
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .xp-info {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }

                    .level-progression {
                        justify-content: center;
                    }

                    .xp-numbers {
                        justify-content: center;
                    }

                    .progress-container {
                        flex-direction: column;
                        gap: 0.75rem;
                        align-items: stretch;
                    }

                    .progress-percentage {
                        text-align: center;
                        min-width: auto;
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
                        padding: 1.25rem;
                        gap: 1.25rem;
                    }

                    .username-profile {
                        font-size: 1.5rem;
                    }

                    .user-id {
                        font-size: 0.8rem;
                        padding: 0.3rem 0.6rem;
                    }

                    .xp-section {
                        padding: 1.25rem;
                    }

                    .xp-current {
                        font-size: 1.25rem;
                    }

                    .xp-separator, .xp-total {
                        font-size: 1.1rem;
                    }

                    .level-progression {
                        gap: 0.5rem;
                    }

                    .level-badge {
                        padding: 0.375rem;
                        transform: scale(0.8);
                    }

                    .level-overlay {
                        transform: scale(0.75);
                        bottom: -2px;
                        right: -2px;
                    }

                    .stat-value {
                        font-size: 1rem;
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
