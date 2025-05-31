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
            ),
            color: 'from-blue-500 to-cyan-500'
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
            ),
            color: 'from-emerald-500 to-teal-500'
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
            ),
            color: 'from-purple-500 to-indigo-500'
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
            ),
            color: 'from-orange-500 to-red-500'
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
            ),
            color: 'from-pink-500 to-rose-500'
        }
    ];

    return (
        <>
            <div class='docs-container'>

                <div class='docs-wrapper'>
                    {/* Sidebar */}
                    <aside class='docs-sidebar'>
                        <div class='sidebar-header'>
                            <div class='header-icon'>
                                <div class='icon-wrapper'>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <div class='header-content'>
                                <h1>Documentation</h1>
                                <p>Legal information & platform policies</p>
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
                                        <div class='card-shine'></div>
                                        <div class='nav-icon'>
                                            <div class={`icon-bg bg-gradient-to-br ${item.color}`}>
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
                position: relative;
                overflow: hidden;
                padding: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
              }

        

              .bg-orb {
                position: absolute;
                border-radius: 50%;
                filter: blur(100px);
                opacity: 0.1;
                animation: float 20s ease-in-out infinite;
              }

              .bg-orb-1 {
                width: 400px;
                height: 400px;
                background: linear-gradient(45deg, #3b82f6, #06b6d4);
                top: -200px;
                left: -200px;
                animation-delay: 0s;
              }

              .bg-orb-2 {
                width: 300px;
                height: 300px;
                background: linear-gradient(45deg, #10b981, #06b6d4);
                top: 50%;
                right: -150px;
                animation-delay: -7s;
              }

              .bg-orb-3 {
                width: 350px;
                height: 350px;
                background: linear-gradient(45deg, #8b5cf6, #ec4899);
                bottom: -175px;
                left: 30%;
                animation-delay: -14s;
              }

              @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(30px, -30px) rotate(90deg); }
                50% { transform: translate(-20px, 20px) rotate(180deg); }
                75% { transform: translate(-30px, -10px) rotate(270deg); }
              }

              .docs-wrapper {
                width: 100%;
                max-width: 1400px;
                height: 85vh;
                display: grid;
                grid-template-columns: 420px 1fr;
                background: #1a2332;
                border-radius: 7px;
                overflow: hidden;
                backdrop-filter: blur(20px);
                box-shadow: 
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(255, 255, 255, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                position: relative;
                z-index: 1;
                animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
              }

              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(40px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .docs-sidebar {
                background: linear-gradient(180deg, 
                  rgba(30, 41, 59, 0.9) 0%, 
                  rgba(15, 23, 42, 0.9) 100%);
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                padding: 2rem 0;
                overflow-y: auto;
                position: relative;
              }

              .docs-sidebar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.03) 0%, 
                  rgba(6, 182, 212, 0.02) 50%, 
                  rgba(139, 92, 246, 0.03) 100%);
                pointer-events: none;
              }

              .sidebar-header {
                padding: 0 2rem 2rem 2rem;
                text-align: center;
                position: relative;
              }

              .header-icon {
                margin-bottom: 1.5rem;
                display: flex;
                justify-content: center;
              }

              .icon-wrapper {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, 
                  rgba(59, 130, 246, 0.2) 0%, 
                  rgba(6, 182, 212, 0.2) 100%);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #60a5fa;
                backdrop-filter: blur(10px);
                box-shadow: 
                  0 8px 32px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                animation: iconGlow 2s ease-in-out infinite alternate;
                transition: all 0.3s ease;
              }

              @keyframes iconGlow {
                from { box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
                to { box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2); }
              }

              .header-content h1 {
                color: #f8fafc;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
              }

              .header-content p {
                color: #94a3b8;
                font-size: 14px;
                margin: 0;
                font-weight: 500;
                opacity: 0.9;
              }

              .header-divider {
                height: 1px;
                background: linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(59, 130, 246, 0.3) 20%, 
                  rgba(6, 182, 212, 0.3) 50%, 
                  rgba(139, 92, 246, 0.3) 80%, 
                  transparent 100%);
                margin-top: 2rem;
                position: relative;
              }


              .sidebar-nav {
                padding: 0 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .nav-item {
                text-decoration: none;
                color: inherit;
                border-radius: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
                background: rgba(30, 41, 59, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 16px;
                padding: 1.25rem;
                position: relative;
                overflow: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
              }

              .card-shine {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255, 255, 255, 0.1) 50%, 
                  transparent 100%);
                transition: left 0.6s ease;
                pointer-events: none;
              }

              .nav-item:hover .card-shine {
                left: 100%;
              }

              .nav-item:hover .nav-card {
                background: rgba(30, 41, 59, 0.6);
                border-color: rgba(255, 255, 255, 0.12);
                transform: translateY(-2px);
                box-shadow: 
                  0 12px 24px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.05);
              }

              .nav-item.active .nav-card {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.3);
                box-shadow: 
                  0 8px 32px rgba(59, 130, 246, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
              }

              .nav-icon {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
              }

              .icon-bg {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              }

              .nav-item:hover .icon-bg {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
              }

              .nav-content h3 {
                color: #f8fafc;
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
                transition: all 0.3s ease;
              }

              .nav-subtitle {
                color: #94a3b8;
                font-size: 12px;
                font-weight: 500;
                margin: 0 0 0.5rem 0;
                opacity: 0.8;
                transition: all 0.3s ease;
              }

              .nav-description {
                color: #64748b;
                font-size: 11px;
                margin: 0;
                line-height: 1.4;
                opacity: 0.7;
                transition: all 0.3s ease;
              }

              .nav-item:hover .nav-content h3 {
                color: #ffffff;
              }

              .nav-item:hover .nav-subtitle {
                color: #cbd5e1;
                opacity: 1;
              }

              .nav-item:hover .nav-description {
                color: #94a3b8;
                opacity: 0.9;
              }

              .nav-item.active .nav-content h3 {
                color: #60a5fa;
              }

              .nav-item.active .nav-subtitle {
                color: rgba(96, 165, 250, 0.8);
              }

              .nav-arrow {
                position: absolute;
                top: 1.25rem;
                right: 1.25rem;
                color: #64748b;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0.5;
              }

              .nav-item:hover .nav-arrow {
                color: #94a3b8;
                opacity: 1;
                transform: translateX(4px);
              }

              .nav-item.active .nav-arrow {
                color: #60a5fa;
                opacity: 1;
              }

              .docs-content {
                background: linear-gradient(180deg, 
                  rgba(15, 23, 42, 0.9) 0%, 
                  rgba(30, 41, 59, 0.9) 100%);
                position: relative;
                overflow: hidden;
              }

              .docs-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                  radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(6, 182, 212, 0.02) 0%, transparent 50%);
                pointer-events: none;
              }

              .content-wrapper {
                height: 100%;
                overflow-y: auto;
                padding: 3rem;
                position: relative;
                z-index: 1;
              }

              .content-wrapper::-webkit-scrollbar {
                width: 8px;
              }

              .content-wrapper::-webkit-scrollbar-track {
                background: rgba(15, 23, 42, 0.5);
                border-radius: 4px;
              }

              .content-wrapper::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, 
                  rgba(59, 130, 246, 0.4) 0%, 
                  rgba(6, 182, 212, 0.4) 100%);
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
              }

              .content-wrapper::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, 
                  rgba(59, 130, 246, 0.6) 0%, 
                  rgba(6, 182, 212, 0.6) 100%);
              }

              /* Responsive Design */
              @media (max-width: 1200px) {
                .docs-wrapper {
                  grid-template-columns: 380px 1fr;
                }
                
                .content-wrapper {
                  padding: 2.5rem;
                }
              }

              @media (max-width: 968px) {
                .docs-container {
                  padding: 1rem;
                }
                
                .docs-wrapper {
                  height: 90vh;
                  grid-template-columns: 1fr;
                  grid-template-rows: auto 1fr;
                }
                
                .docs-sidebar {
                  border-right: none;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                  padding: 1.5rem 0;
                  max-height: 40vh;
                  overflow-y: auto;
                }
                
                .sidebar-nav {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 0.75rem;
                  padding: 0 1rem;
                }
                
                .content-wrapper {
                  padding: 2rem;
                }
              }

              @media (max-width: 640px) {
                .docs-container {
                  padding: 0.5rem;
                }
                
                .docs-wrapper {
                  border-radius: 16px;
                  height: 95vh;
                }
                
                .sidebar-header {
                  padding: 0 1rem 1.5rem 1rem;
                }
                
                .header-content h1 {
                  font-size: 24px;
                }
                
                .icon-wrapper {
                  width: 50px;
                  height: 50px;
                }
                
                .sidebar-nav {
                  grid-template-columns: 1fr;
                  padding: 0 0.75rem;
                }
                
                .nav-card {
                  padding: 1rem;
                }
                
                .nav-description {
                  display: none;
                }
                
                .content-wrapper {
                  padding: 1.5rem;
                }
              }

              /* Utility classes for gradients */
              .bg-gradient-to-br {
                background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
              }
              
              .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
              .to-cyan-500 { --tw-gradient-to: #06b6d4; }
              
              .from-emerald-500 { --tw-gradient-from: #10b981; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0)); }
              .to-teal-500 { --tw-gradient-to: #14b8a6; }
              
              .from-purple-500 { --tw-gradient-from: #8b5cf6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0)); }
              .to-indigo-500 { --tw-gradient-to: #6366f1; }
              
              .from-orange-500 { --tw-gradient-from: #f97316; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 115, 22, 0)); }
              .to-red-500 { --tw-gradient-to: #ef4444; }
              
              .from-pink-500 { --tw-gradient-from: #ec4899; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(236, 72, 153, 0)); }
              .to-rose-500 { --tw-gradient-to: #f43f5e; }
            `}</style>
        </>
    );
}

export default Docs;

