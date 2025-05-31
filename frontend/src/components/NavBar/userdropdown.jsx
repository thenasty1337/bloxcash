import {A, useSearchParams} from "@solidjs/router";
import {ADMIN_ROLES} from "../../resources/users";
import {createNotification, logout} from "../../util/api";
import Avatar from "../Level/avatar";
import { 
  FiUser, 
  FiCreditCard, 
  FiSettings, 
  FiClock, 
  FiLogOut,
  FiShield,
  FiDollarSign
} from 'solid-icons/fi';

function UserDropdown(props) {

    const [searchParams, setSearchParams] = useSearchParams()

    return (
        <>
            <div class={`dropdown${props?.mobile ? ' mobile' : ''}${props.active ? ' active' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div class='dropdown-triangle'/>
                <div class='dropdown-content'>
                    <div class='dropdown-header'>
                        <div class='user-info'>
                            <Avatar 
                                avatar={props.user?.avatar}
                                xp={props.user?.xp}
                                height={40}
                                id={props.user?.id}
                            />
                            <div class='user-details'>
                                <h4 class='user-name'>{props.user?.username || 'Anonymous'}</h4>
                                <p class='user-email'>{props.user?.email || 'Guest User'}</p>
                            </div>
                        </div>
                    </div>

                    <div class='dropdown-menu'>
                        {props?.mobile && (
                            <A href='/withdraw' class='menu-item' onClick={() => props.setActive(false)}>
                                <div class='item-icon'>
                                    <FiDollarSign size={16} />
                                </div>
                                <span class='item-text'>Withdraw</span>
                            </A>
                        )}

                        <A href='/profile/transactions' class='menu-item' onClick={() => props.setActive(false)}>
                            <div class='item-icon'>
                                <FiUser size={16} />
                            </div>
                            <span class='item-text'>Profile</span>
                        </A>

                        <A href='/profile/transactions' class='menu-item' onClick={() => props.setActive(false)}>
                            <div class='item-icon'>
                                <FiCreditCard size={16} />
                            </div>
                            <span class='item-text'>Transactions</span>
                        </A>

                        <A href='/profile/settings' class='menu-item' onClick={() => props.setActive(false)}>
                            <div class='item-icon'>
                                <FiSettings size={16} />
                            </div>
                            <span class='item-text'>Settings</span>
                        </A>

                        <A href='/profile/history' class='menu-item' onClick={() => props.setActive(false)}>
                            <div class='item-icon'>
                                <FiClock size={16} />
                            </div>
                            <span class='item-text'>History</span>
                        </A>

                        <div class='menu-separator'></div>

                        <div class='menu-item special-item' onClick={() => {
                            setSearchParams({ modal: 'freecoins' })
                            props.setActive(false)
                        }}>
                            <div class='item-icon gold'>
                                <FiDollarSign size={16} />
                            </div>
                            <span class='item-text'>Free Coins</span>
                            <span class='item-badge'>Free</span>
                        </div>

                        {ADMIN_ROLES?.includes(props?.user?.role) && (
                            <>
                                <div class='menu-separator'></div>
                                <A href='/admin' class='menu-item admin-item' onClick={() => props?.setActive(false)}>
                                    <div class='item-icon'>
                                        <FiShield size={16} />
                                    </div>
                                    <span class='item-text'>Admin Panel</span>
                                    <span class='item-badge admin'>Admin</span>
                                </A>
                            </>
                        )}

                        <div class='menu-separator'></div>

                        <div class='menu-item logout-item' onClick={() => logout()}>
                            <div class='item-icon'>
                                <FiLogOut size={16} />
                            </div>
                            <span class='item-text'>Sign out</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
              .dropdown {
                position: absolute;
                min-width: 280px;
                max-height: 0;
                top: 45px;
                right: 0;
                z-index: 1000;
                border-radius: 12px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                cursor: default;
              }

              .mobile {
                top: unset !important;
                bottom: 70px !important;
                min-width: 300px !important;
                right: unset !important;
                left: 0 !important;
              }

              .dropdown.active {
                max-height: 500px;
              }

              .dropdown-triangle {
                position: absolute;
                top: -6px;
                right: 16px;
                width: 12px;
                height: 12px;
                background: rgba(26, 35, 50, 0.98);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-bottom: none;
                border-right: none;
                transform: rotate(45deg);
                backdrop-filter: blur(20px);
              }

              .mobile .dropdown-triangle {
                display: none;
              }

              .dropdown-content {
                background: rgba(26, 35, 50, 0.98);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 12px;
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
                margin-top: 8px;
                overflow: hidden;
              }

              .dropdown-header {
                padding: 20px;
                border-bottom: 1px solid rgba(78, 205, 196, 0.1);
                background: linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(78, 205, 196, 0.02) 100%);
              }

              .user-info {
                display: flex;
                align-items: center;
                gap: 12px;
              }

             

              .user-details {
                flex: 1;
                min-width: 0;
              }

              .user-name {
                margin: 0 0 4px 0;
                color: #ffffff;
                font-size: 16px;
                font-weight: 700;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .user-email {
                margin: 0;
                color: rgba(138, 163, 184, 0.8);
                font-size: 13px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .dropdown-menu {
                padding: 8px;
              }

              .menu-item {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 12px 16px;
                color: #ffffff;
                text-decoration: none;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 500;
                font-size: 14px;
                position: relative;
                border: none;
                background: transparent;
                box-sizing: border-box;
              }

              .menu-item:hover {
                background: rgba(78, 205, 196, 0.1);
                color: #4ecdc4;
                transform: translateX(4px);
              }

              .menu-item:active {
                transform: translateX(4px) scale(0.98);
              }

              .item-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(138, 163, 184, 0.8);
                transition: all 0.2s ease;
                flex-shrink: 0;
              }

              .menu-item:hover .item-icon {
                color: #4ecdc4;
                transform: scale(1.1);
              }

              .item-icon.gold {
                color: #ffd700;
              }

              .menu-item:hover .item-icon.gold {
                color: #ffed4e;
                filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
              }

              .item-text {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .item-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: rgba(78, 205, 196, 0.2);
                color: #4ecdc4;
                border: 1px solid rgba(78, 205, 196, 0.3);
              }

              .item-badge.admin {
                background: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.3);
              }

              .special-item {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
                border: 1px solid rgba(255, 215, 0, 0.1);
              }

              .special-item:hover {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
                border-color: rgba(255, 215, 0, 0.3);
                color: #ffd700;
              }

              .admin-item {
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 107, 107, 0.02) 100%);
                border: 1px solid rgba(255, 107, 107, 0.1);
              }

              .admin-item:hover {
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%);
                border-color: rgba(255, 107, 107, 0.3);
                color: #ff6b6b;
              }

              .logout-item:hover {
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
              }

              .logout-item:hover .item-icon {
                color: #ff6b6b;
              }

              .menu-separator {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, rgba(78, 205, 196, 0.2) 50%, transparent 100%);
                margin: 8px 16px;
              }

              @media only screen and (max-width: 768px) {
                .dropdown {
                  min-width: 260px;
                  right: -8px;
                }
                
                .dropdown-triangle {
                  right: 20px;
                }

                .dropdown-header {
                  padding: 16px;
                }

                .header-avatar {
                  width: 36px;
                  height: 36px;
                }

                .user-name {
                  font-size: 15px;
                }

                .user-email {
                  font-size: 12px;
                }
              }
            `}</style>
        </>
    );
}

export default UserDropdown;
