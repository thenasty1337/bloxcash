import {A} from "@solidjs/router";
import {openSupport} from "../../util/support";

function Footer(props) {

    return (
        <>
            <footer class='footer-container'>
                {/* Main footer content */}
                <div class='footer-content'>
                    {/* Logo and description section */}
                    <div class='footer-brand'>
                        <div class='logo-container'>
                            <img src='/assets/icons/logoswords.svg' height='90' width='120' alt='BloxClash Logo'/>
                            <img src='/assets/logo/blox-clash-words.png' width='150' height='23' alt='BloxClash'/>
                        </div>
                        <p class='brand-description'>
                            The ultimate Roblox gaming platform. Experience creative game modes, 
                            multiple deposit methods, and provably fair gaming.
                        </p>
                        <div class='rating-badge'>
                            <span class='rating-stars'>★★★★★</span>
                            <span class='rating-text'>Trusted by 100K+ Players</span>
                        </div>
                    </div>

                    {/* Links sections */}
                    <div class='footer-links'>
                        <div class='link-column'>
                            <h3 class='column-title'>Company</h3>
                            <nav class='link-list'>
                                <A class='footer-link' href='/docs/provably'>
                                    <span>Provably Fair</span>
                                    <svg class='link-arrow' width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 9L9 3M9 3H3M9 3V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </A>
                                <A class='footer-link' href='/docs/privacy'>
                                    <span>Privacy Policy</span>
                                    <svg class='link-arrow' width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 9L9 3M9 3H3M9 3V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </A>
                                <A class='footer-link' href='/docs/tos'>
                                    <span>Terms of Service</span>
                                    <svg class='link-arrow' width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 9L9 3M9 3H3M9 3V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </A>
                                <A class='footer-link' href='/docs/faq'>
                                    <span>FAQ</span>
                                    <svg class='link-arrow' width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 9L9 3M9 3H3M9 3V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </A>
                            </nav>
                        </div>

                        <div class='link-column'>
                            <h3 class='column-title'>Community</h3>
                            <nav class='link-list'>
                                <A class='footer-link social-link' href='https://discord.gg/bloxclash' target='_blank'>
                                    <div class='social-icon discord'>
                                        <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                                            <path d="M16.9309 1.24343C15.6561 0.667925 14.289 0.243898 12.86 0.00101906C12.834 -0.00367015 12.8079 0.00805286 12.7945 0.0314605C12.6188 0.339143 12.424 0.740493 12.2876 1.05598C10.7504 0.829509 9.22102 0.829509 7.71531 1.05598C7.5789 0.733496 7.37711 0.339143 7.20051 0.0314605C7.18712 0.00881037 7.15609 -0.00290143 7.13008 0.00101906C5.70164 0.243273 4.33469 0.667301 3.05914 1.24343C3.04826 1.24869 3.03863 1.25593 3.03234 1.26606C0.444523 5.07759 -0.265791 8.79544 0.0826467 12.4672C0.0842084 12.4851 0.094451 12.5023 0.108637 12.5132C1.81933 13.7494 3.47644 14.4999 5.10273 14.9972C5.12875 15.0051 5.15632 14.9958 5.17292 14.9746C5.55758 14.4578 5.9005 13.9126 6.19453 13.3395C6.21237 13.3059 6.19531 13.266 6.15988 13.2528C5.61589 13.0498 5.09796 12.8021 4.59972 12.5211C4.56032 12.4985 4.55715 12.4418 4.59344 12.4164C4.69828 12.3391 4.80316 12.2587 4.90328 12.1775C4.92214 12.1626 4.94664 12.1595 4.96792 12.1689C8.24105 13.6394 11.7846 13.6394 15.0191 12.1689C15.0404 12.1587 15.0656 12.1619 15.0853 12.1769C15.1854 12.2579 15.2903 12.3391 15.3958 12.4164C15.4314 12.4418 15.429 12.4985 15.3896 12.5211C14.8914 12.8076 14.3735 13.0498 13.8288 13.252C13.7933 13.2652 13.7775 13.3059 13.7954 13.3395C14.0953 13.9118 14.4381 14.457 14.8158 14.9738C14.8315 14.9958 14.8597 15.0051 14.8857 14.9972C16.5201 14.4999 18.1772 13.7494 19.8879 12.5132C19.9029 12.5023 19.9124 12.4859 19.9139 12.4679C20.3309 8.22301 19.2154 4.53564 16.9569 1.26668C16.9514 1.25593 16.9418 1.24869 16.9309 1.24343ZM6.68339 10.2315C5.69796 10.2315 4.88597 9.34128 4.88597 8.2488C4.88597 7.15633 5.68219 6.26605 6.68339 6.26605C7.69243 6.26605 8.49656 7.16256 8.48079 8.2488C8.48079 9.34128 7.68453 10.2315 6.68339 10.2315ZM13.329 10.2315C12.3436 10.2315 11.5316 9.34128 11.5316 8.2488C11.5316 7.15633 12.3278 6.26605 13.329 6.26605C14.338 6.26605 15.1421 7.16256 15.1264 8.2488C15.1264 9.34128 14.3381 10.2315 13.329 10.2315Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <span>Discord</span>
                                </A>
                                <A class='footer-link social-link' href='https://twitter.com/bloxclashcom' target='_blank'>
                                    <div class='social-icon twitter'>
                                        <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                                            <path d="M20 1.77577C19.2563 2.06693 18.4638 2.27654 17.6375 2.37346C18.4875 1.905 19.1363 1.16885 19.4413 0.281539C18.6488 0.717693 17.7738 1.02577 16.8413 1.19769C16.0888 0.458077 15.0163 0 13.8463 0C11.5763 0 9.74875 1.70077 9.74875 3.78577C9.74875 4.08577 9.77625 4.37423 9.84375 4.64885C6.435 4.49539 3.41875 2.98731 1.3925 0.69C1.03875 1.25654 0.83125 1.905 0.83125 2.60308C0.83125 3.91385 1.5625 5.07577 2.6525 5.74846C1.99375 5.73692 1.3475 5.56039 0.8 5.28231C0.8 5.29385 0.8 5.30885 0.8 5.32385C0.8 7.16308 2.22125 8.69077 4.085 9.04269C3.75125 9.12692 3.3875 9.17231 3.01 9.17231C2.7475 9.17231 2.4825 9.15346 2.23375 9.10269C2.765 10.6015 4.2725 11.7035 6.065 11.7392C4.67 12.7465 2.89875 13.3535 0.98125 13.3535C0.645 13.3535 0.3225 13.3396 0 13.3015C1.81625 14.3827 3.96875 15 6.29 15C13.835 15 17.96 9.23077 17.96 4.23C17.96 4.06269 17.9538 3.90115 17.945 3.74077C18.7588 3.20769 19.4425 2.54192 20 1.77577Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <span>Twitter</span>
                                </A>
                                <A class='footer-link social-link' href='https://youtube.com/@bloxclash' target='_blank'>
                                    <div class='social-icon youtube'>
                                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                                            <path d="M21.5434 2.498C21.2834 1.498 20.4967 0.715 19.4934 0.456C17.7234 0 10.9267 0 10.9267 0C10.9267 0 4.13005 0 2.36005 0.456C1.35672 0.716 0.570052 1.498 0.310052 2.498C-0.146613 4.262 -0.146613 7.97 -0.146613 7.97C-0.146613 7.97 -0.146613 11.677 0.310052 13.442C0.570052 14.442 1.35672 15.224 2.36005 15.483C4.13005 15.94 10.9267 15.94 10.9267 15.94C10.9267 15.94 17.7234 15.94 19.4934 15.483C20.4967 15.224 21.2834 14.442 21.5434 13.442C22.0001 11.677 22.0001 7.97 22.0001 7.97C22.0001 7.97 22.0001 4.262 21.5434 2.498ZM8.74672 11.394V4.546L14.4067 7.97L8.74672 11.394Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <span>YouTube</span>
                                </A>
                                <A class='footer-link social-link' href='https://twitch.tv/bloxclash' target='_blank'>
                                    <div class='social-icon twitch'>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M0.812378 3.47917V17.3909H5.60297V20H8.21905L10.8297 17.39H14.7514L19.9798 12.175V0H2.11822L0.812378 3.47917ZM3.86071 1.7375H18.237V11.3033L15.1873 14.3467H10.3967L7.78321 16.9525V14.3467H3.86071V1.7375Z" fill="currentColor"/>
                                            <path d="M8.65417 5.21835H10.3958V10.435H8.65417V5.21835Z" fill="currentColor"/>
                                            <path d="M13.4439 5.21835H15.1864V10.435H13.4439V5.21835Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <span>Twitch</span>
                                </A>
                            </nav>
                        </div>

                        <div class='link-column'>
                            <h3 class='column-title'>Support</h3>
                            <nav class='link-list'>
                                <button class='footer-link support-link' onClick={() => openSupport()}>
                                    <div class='support-icon'>
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 10.5 1.3 11.9 1.8 13.2L1 17L4.8 16.2C6.1 16.7 7.5 17 9 17Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M7 9H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M11 9H11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <span>Live Chat</span>
                                    <div class='live-indicator'></div>
                                </button>
                                <a class='footer-link' href='mailto:support@bloxclash.com' target='_blank'>
                                    <div class='email-icon'>
                                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                                            <path d="M1 3L9 8L17 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            <rect x="1" y="1" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                                        </svg>
                                    </div>
                                    <span>support@bloxclash.com</span>
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div class='footer-bottom'>
                    <div class='footer-bottom-content'>
                        <div class='legal-notice'>
                            <p class='main-disclaimer'>
                                Roblox and its individual marks and logos are trademarks of Roblox Corporation. 
                                <strong> BloxClash</strong> is NOT endorsed, sponsored or affiliated with Roblox Corporation in any way.
                            </p>
                            <div class='legal-links'>
                                <span class='age-requirement'>18+ Only</span>
                                <span class='separator'>•</span>
                                <span class='copyright'>© 2024 BloxClash</span>
                                <span class='separator'>•</span>
                                <span class='responsible-gaming'>Play Responsibly</span>
                            </div>
                        </div>
                        
                        <div class='security-badges'>
                            <div class='security-badge'>
                                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                                    <path d="M8 0L14 3V9C14 14 8 18 8 18C8 18 2 14 2 9V3L8 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 9L7.5 10.5L10.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>SSL Secured</span>
                            </div>
                            <div class='security-badge'>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M6.5 9L8.5 11L11.5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
              .footer-container {
                width: 100%;
                margin-top: 10px;
                background: #1b1738;
                border-top: 1px solid rgba(139, 120, 221, 0.1);
              }
              
              .footer-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 50px 24px;
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 80px;
                align-items: start;
              }
              
              .footer-brand {
                display: flex;
                flex-direction: column;
                gap: 24px;
              }
              
              .logo-container {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
              }
              
              .logo-container img {
                display: block;
              }
              
              .brand-description {
                color: #b8b4d1;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
                font-weight: 400;
                max-width: 280px;
              }
              
              .rating-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                background: rgba(139, 120, 221, 0.15);
                border: 1px solid rgba(139, 120, 221, 0.2);
                border-radius: 6px;
                width: fit-content;
              }
              
              .rating-stars {
                color: #FFD700;
                font-size: 16px;
                font-weight: 600;
              }
              
              .rating-text {
                color: #8b78dd;
                font-size: 13px;
                font-weight: 600;
              }
              
              .footer-links {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 60px;
              }
              
              .link-column {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }
              
              .column-title {
                color: #e8e5f3;
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 16px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .link-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                list-style: none;
                margin: 0;
                padding: 0;
              }
              
              .footer-link {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #a8a3c7;
                text-decoration: none;
                font-size: 14px;
                font-weight: 400;
                padding: 6px 0;
                border: none;
                background: none;
                cursor: pointer;
                transition: color 0.2s ease;
              }
              
              .footer-link:hover {
                color: #8b78dd;
              }
              
              .link-arrow {
                opacity: 0;
                transform: translateX(-4px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .footer-link:hover .link-arrow {
                opacity: 1;
                transform: translateX(0);
              }
              
              .social-link {
                font-weight: 600;
              }
              
              .social-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .social-icon.discord {
                background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
              }
              
              .social-icon.twitter {
                background: linear-gradient(135deg, #1DA1F2 0%, #1A91DA 100%);
              }
              
              .social-icon.youtube {
                background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
              }
              
              .social-icon.twitch {
                background: linear-gradient(135deg, #9146FF 0%, #7B38D8 100%);
              }
              
              .social-icon svg {
                color: white;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .social-link:hover .social-icon {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
              }
              
              .support-link {
                position: relative;
              }
              
              .support-icon, .email-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: linear-gradient(135deg, #8b78dd 0%, #7366c7 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .email-icon {
                background: linear-gradient(135deg, #8b78dd 0%, #7366c7 100%);
              }
              
              .support-icon svg, .email-icon svg {
                color: white;
              }
              
              .live-indicator {
                width: 8px;
                height: 8px;
                background: #00FF88;
                border-radius: 50%;
                animation: pulse 2s infinite;
                margin-left: auto;
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              
              .footer-bottom {
                border-top: 1px solid rgba(139, 120, 221, 0.15);
                padding: 24px 0;
                background: rgba(15, 14, 29, 0.7);
              }
              
              .footer-bottom-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 40px;
              }
              
              .legal-notice {
                flex: 1;
              }
              
              .main-disclaimer {
                color: #a8a3c7;
                font-size: 13px;
                line-height: 1.5;
                margin: 0 0 12px 0;
                max-width: 600px;
              }
              
              .main-disclaimer strong {
                color: #8b78dd;
                font-weight: 700;
              }
              
              .legal-links {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 12px;
                color: #8a85a5;
              }
              
              .separator {
                opacity: 0.5;
              }
              
              .age-requirement {
                color: #FF6B6B;
                font-weight: 600;
              }
              
              .responsible-gaming {
                color: #8b78dd;
                font-weight: 600;
              }
              
              .security-badges {
                display: flex;
                gap: 16px;
              }
              
              .security-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(139, 120, 221, 0.12);
                border: 1px solid rgba(139, 120, 221, 0.25);
                border-radius: 6px;
                color: #8b78dd;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .security-badge svg {
                width: 14px;
                height: 14px;
              }
              
              @media (max-width: 1024px) {
                .footer-content {
                  grid-template-columns: 1fr;
                  gap: 50px;
                  padding: 40px 20px;
                }
                
                .footer-brand {
                  text-align: center;
                }
                
                .logo-container {
                  align-items: center;
                }
                
                .brand-description {
                  text-align: center;
                }
                
                .rating-badge {
                  align-self: center;
                }
                
                .footer-links {
                  grid-template-columns: repeat(3, 1fr);
                  gap: 40px;
                }
                
                .footer-bottom-content {
                  flex-direction: column;
                  text-align: center;
                  gap: 20px;
                  padding: 0 20px;
                }
              }
              
              @media (max-width: 768px) {
                .footer-content {
                  padding: 30px 16px;
                  gap: 40px;
                }
                
                .footer-links {
                  grid-template-columns: 1fr;
                  gap: 30px;
                }
                
                .column-title {
                  text-align: center;
                }
                
                .link-list {
                  align-items: center;
                }
                
                .footer-bottom-content {
                  padding: 0 16px;
                }
                
                .security-badges {
                  flex-wrap: wrap;
                  justify-content: center;
                }
              }
              
              @media (max-width: 480px) {
                .footer-content {
                  padding: 24px 12px;
                  gap: 30px;
                }
                
                .brand-description {
                  font-size: 13px;
                }
                
                .footer-links {
                  gap: 24px;
                }
                
                .column-title {
                  font-size: 13px;
                }
                
                .footer-link {
                  font-size: 13px;
                }
                
                .social-icon {
                  width: 32px;
                  height: 32px;
                }
                
                .footer-bottom {
                  padding: 20px 0;
                }
                
                .footer-bottom-content {
                  padding: 0 12px;
                  gap: 16px;
                }
                
                .main-disclaimer {
                  font-size: 12px;
                }
                
                .legal-links {
                  flex-wrap: wrap;
                  justify-content: center;
                  font-size: 11px;
                  gap: 8px;
                }
                
                .security-badge {
                  padding: 6px 8px;
                  font-size: 10px;
                }
              }
            `}</style>
        </>
    );
}

export default Footer;
