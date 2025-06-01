import { createSignal } from "solid-js";
import { authedAPI, createNotification } from "../../util/api";
import { TbLock } from 'solid-icons/tb';

function PasswordModal(props) {
    const [passwordForm, setPasswordForm] = createSignal({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordLoading, setPasswordLoading] = createSignal(false);

    async function changePassword() {
        const form = passwordForm();
        
        if (!form.current || !form.new || !form.confirm) {
            createNotification('error', 'Please fill in all password fields');
            return;
        }

        if (form.new !== form.confirm) {
            createNotification('error', 'New passwords do not match');
            return;
        }

        if (form.new.length < 8) {
            createNotification('error', 'New password must be at least 8 characters');
            return;
        }

        if (form.current === form.new) {
            createNotification('error', 'New password must be different from current password');
            return;
        }

        setPasswordLoading(true);
        try {
            let res = await authedAPI('/user/settings/password', 'POST', JSON.stringify({
                currentPassword: form.current,
                newPassword: form.new
            }));
            
            if (res.success) {
                createNotification('success', res.message || 'Password changed successfully');
                setPasswordForm({ current: '', new: '', confirm: '' });
                props.onClose();
            }
        } catch (e) {
            console.error(e);
            const errorMsg = e.error === 'INVALID_CURRENT_PASSWORD' 
                ? 'Current password is incorrect'
                : e.error === 'WEAK_PASSWORD'
                ? 'Password is too weak. Please choose a stronger password.'
                : e.error === 'TOO_MANY_ATTEMPTS'
                ? 'Too many attempts. Please try again later.'
                : 'Failed to change password';
            createNotification('error', errorMsg);
        } finally {
            setPasswordLoading(false);
        }
    }

    function handleClose() {
        setPasswordForm({ current: '', new: '', confirm: '' });
        props.onClose();
    }

    return (
        <div class="global-modal-overlay" onClick={(e) => {
            if (e.target.classList.contains('global-modal-overlay')) {
                handleClose();
            }
        }}>
            <div class="global-modal-content password-modal">
                <div class="global-modal-header">
                    <div class="global-modal-title">
                        <TbLock size={20}/>
                        <h3>Change Password</h3>
                    </div>
                    <button 
                        class="global-modal-close"
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </div>
                
                <div class="global-modal-body">
                    <p class="global-modal-description">
                        Update your account password to keep your account secure.
                    </p>
                    
                    <div class="password-form">
                        <div class="password-field">
                            <label>Current Password</label>
                            <input 
                                type="password"
                                placeholder="Enter your current password"
                                value={passwordForm().current}
                                onInput={(e) => setPasswordForm({...passwordForm(), current: e.target.value})}
                                class="password-input"
                            />
                        </div>
                        <div class="password-field">
                            <label>New Password</label>
                            <input 
                                type="password"
                                placeholder="Enter new password (minimum 8 characters)"
                                value={passwordForm().new}
                                onInput={(e) => setPasswordForm({...passwordForm(), new: e.target.value})}
                                class="password-input"
                            />
                        </div>
                        <div class="password-field">
                            <label>Confirm New Password</label>
                            <input 
                                type="password"
                                placeholder="Confirm your new password"
                                value={passwordForm().confirm}
                                onInput={(e) => setPasswordForm({...passwordForm(), confirm: e.target.value})}
                                class="password-input"
                            />
                        </div>
                    </div>
                </div>
                
                <div class="global-modal-footer">
                    <button 
                        class="global-modal-button cancel"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button 
                        class="global-modal-button primary"
                        onClick={changePassword}
                        disabled={passwordLoading()}
                    >
                        {passwordLoading() ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </div>

            <style>{`
                /* Global Modal Styles */
                .global-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    padding: 1rem;
                    animation: globalFadeIn 0.25s ease;
                    box-sizing: border-box;
                }

                @keyframes globalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .global-modal-content {
                    background: rgba(26, 35, 50, 0.98);
                    border: 1px solid rgba(78, 205, 196, 0.25);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 420px;
                    max-height: calc(100vh - 2rem);
                    overflow-y: auto;
                    box-shadow: 
                        0 25px 50px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(78, 205, 196, 0.1);
                    animation: globalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    backdrop-filter: blur(20px);
                }

                @keyframes globalSlideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .global-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 1px solid rgba(78, 205, 196, 0.12);
                }

                .global-modal-title {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    color: #4ecdc4;
                }

                .global-modal-title h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .global-modal-close {
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    color: #8aa3b8;
                    font-size: 18px;
                    font-weight: 300;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .global-modal-close:hover {
                    background: rgba(255, 74, 74, 0.15);
                    border-color: rgba(255, 74, 74, 0.3);
                    color: #ff4a4a;
                    transform: scale(1.05);
                }

                .global-modal-body {
                    padding: 1.5rem;
                }

                .global-modal-description {
                    font-size: 0.95rem;
                    color: #8aa3b8;
                    margin: 0 0 1.75rem 0;
                    line-height: 1.6;
                    text-align: center;
                }

                .password-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .password-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                }

                .password-field label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.01em;
                }

                .password-input {
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 12px;
                    color: #ffffff;
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.3s ease;
                    width: 100%;
                    box-sizing: border-box;
                }

                .password-input:focus {
                    background: rgba(78, 205, 196, 0.08);
                    border-color: rgba(78, 205, 196, 0.4);
                    box-shadow: 0 0 0 4px rgba(78, 205, 196, 0.12);
                    transform: translateY(-1px);
                }

                .password-input::placeholder {
                    color: #8aa3b8;
                    opacity: 0.8;
                }

                .global-modal-footer {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 1.5rem 1.5rem;
                    border-top: 1px solid rgba(78, 205, 196, 0.12);
                    justify-content: flex-end;
                }

                .global-modal-button {
                    padding: 0.875rem 1.75rem;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    min-width: 110px;
                    position: relative;
                }

                .global-modal-button.cancel {
                    background: rgba(255, 255, 255, 0.08);
                    color: #8aa3b8;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .global-modal-button.cancel:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .global-modal-button.primary {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    color: #ffffff;
                    border: 1px solid rgba(78, 205, 196, 0.3);
                }

                .global-modal-button.primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #44a08d, #3d9980);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
                }

                .global-modal-button.primary:disabled {
                    background: rgba(255, 255, 255, 0.1);
                    color: #8aa3b8;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                    border-color: rgba(255, 255, 255, 0.1);
                }

                /* Modal Responsive Design */
                @media (max-width: 768px) {
                    .global-modal-overlay {
                        padding: 0.75rem;
                        align-items: flex-start;
                        padding-top: 2rem;
                    }

                    .global-modal-content {
                        max-width: 100%;
                        margin-top: 1rem;
                        border-radius: 16px;
                        animation: globalSlideInMobile 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }

                    @keyframes globalSlideInMobile {
                        from { 
                            opacity: 0;
                            transform: translateY(20px) scale(0.95);
                        }
                        to { 
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    .global-modal-header {
                        padding: 1.25rem 1.25rem 0.875rem;
                    }

                    .global-modal-title h3 {
                        font-size: 1.125rem;
                    }

                    .global-modal-close {
                        width: 32px;
                        height: 32px;
                        font-size: 16px;
                    }

                    .global-modal-body {
                        padding: 1.25rem;
                    }

                    .global-modal-description {
                        font-size: 0.9rem;
                        margin-bottom: 1.5rem;
                        text-align: left;
                    }

                    .password-form {
                        gap: 1rem;
                    }

                    .password-field label {
                        font-size: 0.85rem;
                    }

                    .password-input {
                        padding: 0.875rem;
                        font-size: 0.9rem;
                        border-radius: 10px;
                    }

                    .global-modal-footer {
                        padding: 0.875rem 1.25rem 1.25rem;
                        gap: 0.75rem;
                        flex-direction: column-reverse;
                    }

                    .global-modal-button {
                        width: 100%;
                        padding: 1rem;
                        font-size: 0.9rem;
                        border-radius: 10px;
                        min-width: unset;
                    }
                }

                @media (max-width: 480px) {
                    .global-modal-overlay {
                        padding: 0.5rem;
                        padding-top: 1rem;
                    }

                    .global-modal-content {
                        border-radius: 14px;
                    }

                    .global-modal-header {
                        padding: 1rem 1rem 0.75rem;
                    }

                    .global-modal-title {
                        gap: 0.625rem;
                    }

                    .global-modal-title h3 {
                        font-size: 1rem;
                    }

                    .global-modal-close {
                        width: 28px;
                        height: 28px;
                        font-size: 14px;
                        border-radius: 8px;
                    }

                    .global-modal-body {
                        padding: 1rem;
                    }

                    .global-modal-description {
                        font-size: 0.85rem;
                        margin-bottom: 1.25rem;
                    }

                    .password-field label {
                        font-size: 0.8rem;
                    }

                    .password-input {
                        padding: 0.75rem;
                        font-size: 0.85rem;
                        border-radius: 8px;
                    }

                    .global-modal-footer {
                        padding: 0.75rem 1rem 1rem;
                    }

                    .global-modal-button {
                        padding: 0.875rem;
                        font-size: 0.85rem;
                        border-radius: 8px;
                    }
                }
            `}</style>
        </div>
    );
}

export default PasswordModal; 