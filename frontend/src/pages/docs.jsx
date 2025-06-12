import {A, Outlet, useLocation} from "@solidjs/router";

function Docs(props) {
    const location = useLocation()

    function isActive(page) {
        const pathname = location?.pathname || '';
        if (page === 'faq' && pathname === '/docs/faq') return true;
        if (page === 'provably' && pathname === '/docs/provably') return true;
        if (page === 'tos' && pathname === '/docs/tos') return true;
        if (page === 'aml' && pathname === '/docs/aml') return true;
        if (page === 'privacy' && pathname === '/docs/privacy') return true;
        return false;
    }

    const navItems = [
        {
            id: 'faq',
            href: '/docs/faq',
            title: 'FAQ',
            subtitle: 'Frequently Asked Questions',
            description: 'Find answers to common questions',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M9.09 9C9.325 8.685 9.65 8.45 10.02 8.325C10.39 8.2 10.785 8.18 11.165 8.27C11.545 8.36 11.89 8.56 12.155 8.845C12.42 9.13 12.59 9.485 12.645 9.865C12.7 10.245 12.635 10.63 12.46 10.97C12.285 11.31 12.01 11.585 11.675 11.76L11 12.5V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            )
        },
        {
            id: 'provably',
            href: '/docs/provably',
            title: 'Provably Fair',
            subtitle: 'Game Fairness System',
            description: 'Transparency in gaming verification',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
            )
        },
        {
            id: 'tos',
            href: '/docs/tos',
            title: 'Terms of Service',
            subtitle: 'Legal Terms & Conditions',
            description: 'Platform usage guidelines',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            )
        },
        {
            id: 'aml',
            href: '/docs/aml',
            title: 'AML Policy',
            subtitle: 'Anti-Money Laundering',
            description: 'Financial security measures',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1L21 5V11C21 16 17 20 12 23C7 20 3 16 3 11V5L12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            )
        },
        {
            id: 'privacy',
            href: '/docs/privacy',
            title: 'Privacy Policy',
            subtitle: 'Data Protection & Privacy',
            description: 'How we protect your information',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
            )
        }
    ];

    return (
        <>
            <div class='docs-container'>
                <div class='docs-wrapper'>
                    {/* Sidebar */}
                    <aside class='docs-sidebar'>
                        <div class='sidebar-header'>
                     
                            <div class='header-content'>
                                <h1>Documentation</h1>
                             
                            </div>
                            <div class='header-divider'></div>
                        </div>

                        <nav class='sidebar-nav'>
                            {navItems.map((item, index) => (
                                <A 
                                    href={item.href} 
                                    class={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                                    style={`--delay: ${index * 100}ms`}
                                >
                                    <div class='nav-card'>
                                        <div class='nav-icon'>
                                            <div class="icon-bg">
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div class='nav-content'>
                                            <h3>{item.title}</h3>
                                            <p class='nav-subtitle'>{item.subtitle}</p>
                                            <p class='nav-description'>{item.description}</p>
                                        </div>
                                        <div class='nav-arrow'>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </A>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <main class='docs-content'>
                        <div class='content-wrapper'>
                            <Outlet/>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx>{`
              * {
                box-sizing: border-box;
              }

              .docs-container {
                min-height: 100vh;
                padding: 1.5rem 1rem;
              }

              .docs-wrapper {
                max-width: 1200px;
                margin: 0 auto;
                height: 85vh;
                display: grid;
                grid-template-columns: 400px 1fr;
                gap: 1.5rem;
              }

              .docs-sidebar {
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 16px;
                padding: 1.5rem;
                backdrop-filter: blur(10px);
                overflow-y: auto;
                height: fit-content;
              }

              .sidebar-header {
                text-align: center;
                margin-bottom: 1.5rem;
              }

              .header-icon {
                margin-bottom: 1rem;
                display: flex;
                justify-content: center;
              }

              .icon-wrapper {
                width: 60px;
                height: 60px;
                background: rgba(78, 205, 196, 0.1);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4ecdc4;
                backdrop-filter: blur(10px);
              }

              .header-content h1 {
                color: #ffffff;
                font-size: 1.75rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              .header-content p {
                color: #8aa3b8;
                font-size: 0.9rem;
                margin: 0;
                font-weight: 500;
              }

              .header-divider {
                height: 1px;
                background: linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(78, 205, 196, 0.3) 50%, 
                  transparent 100%);
                margin-top: 1.5rem;
              }

              .sidebar-nav {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
              }

              .nav-item {
                text-decoration: none;
                color: inherit;
                transition: all 0.2s ease;
                animation: fadeInUp 0.6s ease forwards;
                animation-delay: var(--delay);
                opacity: 0;
                transform: translateY(20px);
              }

              @keyframes fadeInUp {
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .nav-card {
                background: rgba(78, 205, 196, 0.04);
                border: 1px solid rgba(78, 205, 196, 0.1);
                border-radius: 12px;
                padding: 1rem;
                position: relative;
                overflow: hidden;
                transition: all 0.2s ease;
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
              }

              .nav-item:hover .nav-card {
                background: rgba(78, 205, 196, 0.08);
                border-color: rgba(78, 205, 196, 0.2);
                transform: translateX(2px);
              }

              .nav-item.active .nav-card {
                background: rgba(78, 205, 196, 0.15);
                border-color: rgba(78, 205, 196, 0.3);
                color: #4ecdc4;
              }

              .nav-icon {
                flex-shrink: 0;
              }

              .icon-bg {
                width: 40px;
                height: 40px;
                background: rgba(78, 205, 196, 0.1);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4ecdc4;
                transition: all 0.2s ease;
              }

              .nav-item:hover .icon-bg {
                background: rgba(78, 205, 196, 0.2);
                transform: scale(1.05);
              }

              .nav-item.active .icon-bg {
                background: rgba(78, 205, 196, 0.2);
                border-color: rgba(78, 205, 196, 0.4);
              }

              .nav-content {
                flex: 1;
                min-width: 0;
              }

              .nav-content h3 {
                color: #ffffff;
                font-size: 1rem;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                transition: all 0.2s ease;
              }

              .nav-subtitle {
                color: #8aa3b8;
                font-size: 0.8rem;
                font-weight: 500;
                margin: 0 0 0.25rem 0;
                transition: all 0.2s ease;
              }

              .nav-description {
                color: #8aa3b8;
                font-size: 0.75rem;
                margin: 0;
                line-height: 1.4;
                opacity: 0.8;
                transition: all 0.2s ease;
              }

              .nav-item:hover .nav-content h3 {
                color: #ffffff;
              }

              .nav-item:hover .nav-subtitle,
              .nav-item:hover .nav-description {
                color: #ffffff;
                opacity: 0.9;
              }

              .nav-item.active .nav-content h3 {
                color: #4ecdc4;
              }

              .nav-item.active .nav-subtitle,
              .nav-item.active .nav-description {
                color: #4ecdc4;
                opacity: 0.8;
              }

              .nav-arrow {
                position: absolute;
                top: 1rem;
                right: 1rem;
                color: #8aa3b8;
                transition: all 0.2s ease;
                opacity: 0.5;
              }

              .nav-item:hover .nav-arrow {
                color: #ffffff;
                opacity: 1;
                transform: translateX(2px);
              }

              .nav-item.active .nav-arrow {
                color: #4ecdc4;
                opacity: 1;
              }

              .docs-content {
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                overflow: hidden;
              }

              .content-wrapper {
                height: 100%;
                overflow-y: auto;
                padding: 2rem;
              }

              .content-wrapper::-webkit-scrollbar {
                width: 8px;
              }

              .content-wrapper::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
              }

              .content-wrapper::-webkit-scrollbar-thumb {
                background: rgba(78, 205, 196, 0.3);
                border-radius: 4px;
                border: 1px solid rgba(78, 205, 196, 0.1);
              }

              .content-wrapper::-webkit-scrollbar-thumb:hover {
                background: rgba(78, 205, 196, 0.5);
              }

              /* Responsive Design */
              @media (max-width: 1024px) {
                .docs-wrapper {
                  grid-template-columns: 1fr;
                  gap: 1rem;
                  height: auto;
                }
                
                .docs-sidebar {
                  order: 2;
                  height: auto;
                  padding: 1.25rem;
                }
                
                .sidebar-nav {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 0.75rem;
                }
                
                .docs-content {
                  order: 1;
                  min-height: 60vh;
                }
                
                .content-wrapper {
                  padding: 1.5rem;
                }
              }

              @media (max-width: 768px) {
                .docs-container {
                  padding: 1rem 0.75rem;
                }
                
                .docs-sidebar {
                  padding: 1rem;
                }
                
                .sidebar-header {
                  margin-bottom: 1rem;
                  padding-bottom: 1rem;
                }
                
                .header-content h1 {
                  font-size: 1.5rem;
                }
                
                .icon-wrapper {
                  width: 50px;
                  height: 50px;
                }
                
                .sidebar-nav {
                  grid-template-columns: 1fr;
                }
                
                .nav-card {
                  padding: 0.875rem;
                }
                
                .content-wrapper {
                  padding: 1.25rem;
                }
              }

              @media (max-width: 480px) {
                .docs-container {
                  padding: 0.875rem 0.5rem;
                }
                
                .docs-wrapper {
                  gap: 0.875rem;
                }
                
                .docs-sidebar {
                  padding: 0.875rem;
                }
                
                .nav-description {
                  display: none;
                }
                
                .nav-card {
                  padding: 0.75rem;
                }
                
                .content-wrapper {
                  padding: 1rem;
                }
              }
            `}</style>
        </>
    );
}

export default Docs;

