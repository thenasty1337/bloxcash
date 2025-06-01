import { TbUser, TbCoin, TbBuildingBank, TbTarget, TbLock, TbGift, TbTrophy, TbWifi, TbClock, TbShield, TbHeadset } from 'solid-icons/tb';

function FAQ(props) {

    function toggleDropdown(e) {
        e.target.closest('.dropdown-faq-wrapper-faq').classList.toggle('active')
    }

    function handleCategoryFilter(e, category) {
        // Remove active class from all category tags
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.classList.remove('active')
        })
        
        // Add active class to clicked tag
        e.target.classList.add('active')
        
        // Get all FAQ items
        const faqItems = document.querySelectorAll('.dropdown-faq-wrapper-faq')
        
        // Show/hide items based on category
        faqItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category')
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block'
            } else {
                item.style.display = 'none'
            }
        })
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase()
        const faqItems = document.querySelectorAll('.dropdown-faq-wrapper-faq')
        
        faqItems.forEach(item => {
            const questionText = item.querySelector('.question-text h3').textContent.toLowerCase()
            const descriptionText = item.querySelector('.question-text p').textContent.toLowerCase()
            const contentText = item.querySelector('.dropdown-faq-content').textContent.toLowerCase()
            
            const matchesSearch = questionText.includes(searchTerm) || 
                                descriptionText.includes(searchTerm) || 
                                contentText.includes(searchTerm)
            
            if (matchesSearch || searchTerm === '') {
                item.style.display = 'block'
            } else {
                item.style.display = 'none'
            }
        })
        
        // If search is active, reset category filter to show all matching results
        if (searchTerm !== '') {
            document.querySelectorAll('.category-tag').forEach(tag => {
                tag.classList.remove('active')
            })
            document.querySelector('.category-tag[data-category="all"]').classList.add('active')
        }
    }

    return (
        <>
            <div className='faq-container'>
                <div className='header-section'>
                    <h1 className='main-title'>Frequently Asked Questions</h1>
                    <p className='subtitle'>
                        Find answers to common questions about BloxClash. If you can't find what you're 
                        looking for, don't hesitate to contact our support team.
                    </p>
                </div>

                <div className='search-section'>
                    <div className='search-box'>
                        <svg className='search-icon' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search FAQ..." 
                            className='search-input'
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className='categories-section'>
                    <h2 className='categories-title'>Popular Topics</h2>
                    <div className='category-tags'>
                        <span 
                            className='category-tag active' 
                            data-category="all"
                            onClick={(e) => handleCategoryFilter(e, 'all')}
                        >
                            All
                        </span>
                        <span 
                            className='category-tag'
                            data-category="account"
                            onClick={(e) => handleCategoryFilter(e, 'account')}
                        >
                            Account
                        </span>
                        <span 
                            className='category-tag'
                            data-category="deposits"
                            onClick={(e) => handleCategoryFilter(e, 'deposits')}
                        >
                            Deposits
                        </span>
                        <span 
                            className='category-tag'
                            data-category="withdrawals"
                            onClick={(e) => handleCategoryFilter(e, 'withdrawals')}
                        >
                            Withdrawals
                        </span>
                        <span 
                            className='category-tag'
                            data-category="gaming"
                            onClick={(e) => handleCategoryFilter(e, 'gaming')}
                        >
                            Gaming
                        </span>
                        <span 
                            className='category-tag'
                            data-category="security"
                            onClick={(e) => handleCategoryFilter(e, 'security')}
                        >
                            Security
                        </span>
                        <span 
                            className='category-tag'
                            data-category="support"
                            onClick={(e) => handleCategoryFilter(e, 'support')}
                        >
                            Support
                        </span>
                    </div>
                </div>

                <div className='faq-sections'>
                    <div className='dropdown-faq-wrapper-faq' data-category="account">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbUser size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How do I create an account on BloxClash?</h3>
                                    <p>Learn about our simple registration process</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    Creating an account on BloxClash is quick and easy! Simply click the "Sign Up" button 
                                    and choose from our supported authentication methods including Google, Discord, or email 
                                    registration. You can also use our OAuth integration for seamless account creation. 
                                    Once registered, you'll need to verify your email address to start playing.
                                </p>
                                <div className='helpful-info'>
                                    <strong>Note:</strong> Make sure to use a valid email address as you'll need it for 
                                    account verification and important notifications.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="deposits">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbCoin size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How do I deposit funds to play on the site?</h3>
                                    <p>Learn about our supported deposit methods</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    BloxClash supports multiple deposit methods for your convenience:
                                </p>
                                <ul className='info-list'>
                                    <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum, Litecoin, and other popular coins</li>
                                    <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard (processed securely)</li>
                                    <li><strong>Digital Wallets:</strong> PayPal, Skrill, and other e-wallets</li>
                                    <li><strong>Bank Transfer:</strong> Direct bank transfers for larger amounts</li>
                                </ul>
                                <p>
                                    To make a deposit, click the "Deposit" button, select your preferred method, 
                                    and follow the instructions. Most deposits are processed instantly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="withdrawals">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbBuildingBank size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How long do withdrawals take to process?</h3>
                                    <p>Information about withdrawal processing times</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>Withdrawal processing times vary by method:</p>
                                <ul className='info-list'>
                                    <li><strong>Cryptocurrency:</strong> 15-30 minutes (after blockchain confirmation)</li>
                                    <li><strong>E-wallets:</strong> 1-24 hours</li>
                                    <li><strong>Bank Transfer:</strong> 1-5 business days</li>
                                    <li><strong>Credit/Debit Cards:</strong> 3-7 business days</li>
                                </ul>
                                <p>
                                    Verified accounts with completed KYC enjoy faster processing times. All withdrawals 
                                    are manually reviewed for security purposes, which may add additional time during peak periods.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="gaming">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbTarget size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>Are the games fair and transparent?</h3>
                                    <p>Learn about our provably fair gaming system</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    Absolutely! BloxClash uses a state-of-the-art provably fair system to ensure 
                                    all game outcomes are completely transparent and cannot be manipulated by us or anyone else.
                                </p>
                                <ul className='info-list'>
                                    <li>Every game result can be independently verified</li>
                                    <li>Cryptographic algorithms ensure true randomness</li>
                                    <li>You can verify any game result using our verification tools</li>
                                    <li>Seeds are generated using secure, transparent methods</li>
                                </ul>
                                <p>
                                    You can access our Provably Fair documentation at any time to verify game results 
                                    or learn more about how our system works.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="account">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbLock size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How do I enable two-factor authentication (2FA)?</h3>
                                    <p>Secure your account with additional protection</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    To enable 2FA and secure your account:
                                </p>
                                <ol className='info-list'>
                                    <li>Go to your Account Settings</li>
                                    <li>Click on "Security Settings"</li>
                                    <li>Select "Enable Two-Factor Authentication"</li>
                                    <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                                    <li>Scan the QR code with your authenticator app</li>
                                    <li>Enter the 6-digit code to confirm setup</li>
                                </ol>
                                <div className='helpful-info'>
                                    <strong>Important:</strong> Save your backup codes in a secure location. 
                                    You'll need them if you lose access to your authenticator app.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="gaming">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbGift size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How can I tip other users or participate in rain events?</h3>
                                    <p>Learn about our community features</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>BloxClash has several ways to share your winnings with the community:</p>
                                <ul className='info-list'>
                                    <li><strong>Tipping:</strong> Click on a user's profile in chat and select "Tip" to send them funds</li>
                                    <li><strong>Rain Events:</strong> Use the command "/rain [amount]" in chat to create a rain for others to join</li>
                                    <li><strong>Chat Commands:</strong> Type "/tip [username] [amount]" to tip users directly</li>
                                </ul>
                                <p>
                                    Please note that tipping and rain participation may be restricted for new accounts 
                                    or accounts that haven't completed verification to prevent abuse.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="account">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbTrophy size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How does the affiliate program work?</h3>
                                    <p>Earn rewards by referring friends</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    Our affiliate program offers generous rewards for bringing new users to BloxClash:
                                </p>
                                <ul className='info-list'>
                                    <li><strong>Commission Rate:</strong> Earn 0.5% of your referrals' wagering volume</li>
                                    <li><strong>Instant Payouts:</strong> Commissions are credited to your account immediately</li>
                                    <li><strong>No Limits:</strong> Refer as many users as you want</li>
                                    <li><strong>Bonus Tiers:</strong> High-volume affiliates receive additional perks and bonuses</li>
                                </ul>
                                <p>
                                    To get started, visit your profile settings and generate your unique affiliate code. 
                                    Share it with friends and start earning today!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="gaming">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbWifi size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>What happens if I disconnect during a game?</h3>
                                    <p>Information about connection issues and game outcomes</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    Don't worry! Your game outcomes are determined the moment you place your bet using 
                                    our provably fair system, so disconnections won't affect your results:
                                </p>
                                <ul className='info-list'>
                                    <li><strong>Instant Games:</strong> Results are determined immediately when you bet</li>
                                    <li><strong>Crash:</strong> We recommend stable internet; auto-cashout features can help</li>
                                    <li><strong>Live Games:</strong> Your position is maintained during temporary disconnections</li>
                                    <li><strong>History Check:</strong> All results are available in your game history</li>
                                </ul>
                                <p>
                                    If you experience frequent disconnections, check your internet connection and consider 
                                    using auto-bet features for consistent gameplay.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="deposits">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbClock size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>My deposit hasn't arrived yet. What should I do?</h3>
                                    <p>Troubleshooting delayed deposits</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>If your deposit is delayed, here's what to check:</p>
                                <ul className='info-list'>
                                    <li><strong>Cryptocurrency:</strong> Check blockchain confirmations (usually 1-3 required)</li>
                                    <li><strong>Bank Transfer:</strong> Processing can take 1-5 business days</li>
                                    <li><strong>Card Payments:</strong> May require additional verification</li>
                                    <li><strong>Payment Processor:</strong> Third-party delays can occur</li>
                                </ul>
                                <p>
                                    If your deposit is significantly delayed or if funds were deducted but not credited, 
                                    please contact our support team immediately with your transaction details and receipt.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="security">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbShield size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>I found a security vulnerability. How do I report it?</h3>
                                    <p>Responsible disclosure and bug bounty information</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>
                                    We take security seriously and appreciate responsible disclosure. If you've found a vulnerability:
                                </p>
                                <ol className='info-list'>
                                    <li>Email our security team at security@bloxclash.com immediately</li>
                                    <li>Include detailed information about the vulnerability</li>
                                    <li>Do not publicly disclose the issue until we've addressed it</li>
                                    <li>Allow us reasonable time to investigate and fix the issue</li>
                                </ol>
                                <div className='helpful-info'>
                                    <strong>Bug Bounty:</strong> We offer rewards for valid security reports, 
                                    ranging from platform credits to cash bounties depending on severity.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-faq-wrapper-faq' data-category="support">
                        <button className='faq-button' onClick={toggleDropdown}>
                            <div className='question-content'>
                                <span className='question-icon'>
                                    <TbHeadset size={20}/>
                                </span>
                                <div className='question-text'>
                                    <h3>How can I contact customer support?</h3>
                                    <p>Get help when you need it most</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <p>We offer multiple ways to get support when you need help:</p>
                                <ul className='info-list'>
                                    <li><strong>Live Chat:</strong> Available 24/7 on our website for immediate assistance</li>
                                    <li><strong>Email:</strong> support@bloxclash.com for detailed inquiries</li>
                                    <li><strong>Discord:</strong> Join our community at discord.gg/bloxclash</li>
                                    <li><strong>Help Center:</strong> Browse our comprehensive knowledge base</li>
                                </ul>
                                <p>
                                    For faster resolution, please include relevant details like your username, 
                                    transaction IDs, and screenshots when contacting support.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .faq-container {
                width: 100%;
                max-width: 1200px;
                height: fit-content;
                box-sizing: border-box;
                padding: 2rem;
                margin: 0 auto;
                color: #8aa3b8;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 0.9rem;
                font-weight: 400;
                line-height: 1.6;
              }

              .header-section {
                text-align: center;
                margin-bottom: 2rem;
              }

              .main-title {
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 2rem;
                font-weight: 700;
                margin: 0 0 1rem 0;
                letter-spacing: -0.5px;
              }

              .subtitle {
                color: #8aa3b8;
                font-size: 1rem;
                font-weight: 500;
                max-width: 600px;
                margin: 0 auto;
                line-height: 1.5;
              }

              .search-section {
                margin-bottom: 2rem;
                display: flex;
                justify-content: center;
              }

              .search-box {
                position: relative;
                max-width: 500px;
                width: 100%;
              }

              .search-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: #8aa3b8;
                opacity: 0.7;
              }

              .search-input {
                width: 100%;
                padding: 1rem 1rem 1rem 3rem;
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 12px;
                color: #ffffff;
                font-family: inherit;
                font-size: 0.9rem;
                outline: none;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
              }

              .search-input:focus {
                border-color: rgba(78, 205, 196, 0.3);
                background: rgba(26, 35, 50, 0.8);
              }

              .search-input::placeholder {
                color: #8aa3b8;
                opacity: 0.7;
              }

              .categories-section {
                margin-bottom: 2rem;
                text-align: center;
              }

              .categories-title {
                color: #ffffff;
                font-size: 1.25rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
              }

              .category-tags {
                display: flex;
                justify-content: center;
                gap: 0.75rem;
                flex-wrap: wrap;
              }

              .category-tag {
                padding: 0.5rem 1rem;
                background: rgba(78, 205, 196, 0.04);
                border: 1px solid rgba(78, 205, 196, 0.1);
                border-radius: 20px;
                color: #8aa3b8;
                font-size: 0.8rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
              }

              .category-tag:hover,
              .category-tag.active {
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border-color: #4ecdc4;
                color: #ffffff;
              }

              .faq-sections {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .dropdown-faq-wrapper-faq {
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
              }

              .dropdown-faq-wrapper-faq:hover {
                border-color: rgba(78, 205, 196, 0.25);
                background: rgba(26, 35, 50, 0.8);
              }

              .dropdown-faq-wrapper-faq.active {
                border-color: rgba(78, 205, 196, 0.3);
                background: rgba(26, 35, 50, 0.8);
              }

              .faq-button {
                width: 100%;
                padding: 1.25rem 1.5rem;
                background: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: inherit;
                font-family: inherit;
                transition: all 0.2s ease;
              }

              .faq-button:hover {
                background: rgba(78, 205, 196, 0.05);
              }

              .question-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                text-align: left;
              }

              .question-icon {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border-radius: 8px;
                flex-shrink: 0;
                color: #ffffff;
              }

              .question-text h3 {
                color: #ffffff;
                font-size: 1rem;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              .question-text p {
                color: #8aa3b8;
                font-size: 0.8rem;
                margin: 0;
                opacity: 0.9;
              }

              .chevron {
                transition: transform 0.2s ease;
                flex-shrink: 0;
              }

              .dropdown-faq-wrapper-faq.active .chevron {
                transform: rotate(180deg);
              }

              .dropdown-faq {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
              }

              .dropdown-faq-wrapper-faq.active .dropdown-faq {
                max-height: 1000px;
              }

              .dropdown-faq-content {
                padding: 0 1.5rem 1.5rem 1.5rem;
                border-top: 1px solid rgba(78, 205, 196, 0.1);
              }

              .dropdown-faq-content p {
                margin: 1rem 0;
                color: #8aa3b8;
                line-height: 1.6;
              }

              .info-list {
                margin: 1rem 0;
                padding-left: 0;
                list-style: none;
              }

              .info-list li {
                position: relative;
                padding-left: 1.5rem;
                margin-bottom: 0.5rem;
                color: #8aa3b8;
                line-height: 1.5;
              }

              .info-list li::before {
                content: "→";
                position: absolute;
                left: 0;
                color: #4ecdc4;
                font-weight: bold;
                font-size: 0.9rem;
              }

              .info-list li strong {
                color: #ffffff;
                font-weight: 600;
              }

              .helpful-info {
                background: rgba(78, 205, 196, 0.05);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
                color: #ffffff;
                font-size: 0.8rem;
              }

              .helpful-info strong {
                color: #4ecdc4;
              }

              @media (max-width: 768px) {
                .faq-container {
                  padding: 1.25rem;
                }

                .main-title {
                  font-size: 1.5rem;
                }

                .category-tags {
                  gap: 0.5rem;
                }

                .category-tag {
                  padding: 0.375rem 0.75rem;
                  font-size: 0.75rem;
                }

                .faq-button {
                  padding: 1rem 1.25rem;
                }

                .question-content {
                  gap: 0.75rem;
                }

                .question-icon {
                  width: 35px;
                  height: 35px;
                }

                .question-text h3 {
                  font-size: 0.95rem;
                }

                .question-text p {
                  font-size: 0.75rem;
                }

                .dropdown-faq-content {
                  padding: 0 1.25rem 1.25rem 1.25rem;
                }
              }

              @media (max-width: 480px) {
                .faq-container {
                  padding: 1rem;
                }

                .main-title {
                  font-size: 1.375rem;
                }

                .search-input {
                  padding: 0.875rem 0.875rem 0.875rem 2.75rem;
                  font-size: 0.8rem;
                }

                .question-content {
                  gap: 0.5rem;
                }

                .question-icon {
                  width: 32px;
                  height: 32px;
                }

                .dropdown-faq-content {
                  padding: 0 1rem 1rem 1rem;
                }

                .info-list li {
                  padding-left: 1.25rem;
                }
              }
            `}</style>
        </>
    );
}

export default FAQ;
