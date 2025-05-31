import {A, Outlet, useLocation} from "@solidjs/router";

function Docs(props) {

    const location = useLocation()

    function isActive(page) {
        const pathname = location?.pathname || '';
        console.log('Current pathname:', pathname, 'Checking page:', page); // Debug log
        if (page === 'faq' && pathname === '/docs/faq') return true;
        if (page === 'provably' && pathname === '/docs/provably') return true;
        if (page === 'tos' && pathname === '/docs/tos') return true;
        if (page === 'aml' && pathname === '/docs/aml') return true;
        if (page === 'privacy' && pathname === '/docs/privacy') return true;
        return false;
    }

    const getActiveTextStyles = () => ({
        color: '#A594F9'
    });

    const getActiveSubtitleStyles = () => ({
        color: 'rgba(165, 148, 249, 0.7)'
    });

    return (
        <>
            <div class='docs-container'>
                <div class='docs-layout'>
                    <nav class='docs-sidebar'>
                        <div class='docu-sidebar-header'>
                            <h2 class='docs-title'>Documentation</h2>
                            <div class='title-underline'></div>
                        </div>
                        
                        <div class='docu-docu-nav-links'>
                            <A 
                                href='/docs/faq' 
                                class={`docu-nav-link ${isActive('faq') ? 'docs-active' : ''}`}
                            >
                                <div class='link-content'>
                                    <span 
                                        class='link-text'
                                        style={isActive('faq') ? getActiveTextStyles() : {}}
                                    >
                                        Frequently Asked Questions
                                    </span>
                                    <span 
                                        class='link-subtitle'
                                        style={isActive('faq') ? getActiveSubtitleStyles() : {}}
                                    >
                                        Common questions & answers
                                    </span>
                                </div>
                            </A>

                            <A 
                                href='/docs/provably' 
                                class={`docu-nav-link ${isActive('provably') ? 'docs-active' : ''}`}
                            >
                                <div class='link-content'>
                                    <span 
                                        class='link-text'
                                        style={isActive('provably') ? getActiveTextStyles() : {}}
                                    >
                                        Provably Fair
                                    </span>
                                    <span 
                                        class='link-subtitle'
                                        style={isActive('provably') ? getActiveSubtitleStyles() : {}}
                                    >
                                        Game fairness verification
                                    </span>
                                </div>
                            </A>

                            <A 
                                href='/docs/tos' 
                                class={`docu-nav-link ${isActive('tos') ? 'docs-active' : ''}`}
                            >
                                <div class='link-content'>
                                    <span 
                                        class='link-text'
                                        style={isActive('tos') ? getActiveTextStyles() : {}}
                                    >
                                        Terms of Service
                                    </span>
                                    <span 
                                        class='link-subtitle'
                                        style={isActive('tos') ? getActiveSubtitleStyles() : {}}
                                    >
                                        Usage terms & conditions
                                    </span>
                                </div>
                            </A>

                            <A 
                                href='/docs/aml' 
                                class={`docu-nav-link ${isActive('aml') ? 'docs-active' : ''}`}
                            >
                                <div class='link-content'>
                                    <span 
                                        class='link-text'
                                        style={isActive('aml') ? getActiveTextStyles() : {}}
                                    >
                                        AML Policy
                                    </span>
                                    <span 
                                        class='link-subtitle'
                                        style={isActive('aml') ? getActiveSubtitleStyles() : {}}
                                    >
                                        Anti-money laundering
                                    </span>
                                </div>
                            </A>

                            <A 
                                href='/docs/privacy' 
                                class={`docu-nav-link ${isActive('privacy') ? 'docs-active' : ''}`}
                            >
                                <div class='link-content'>
                                    <span 
                                        class='link-text'
                                        style={isActive('privacy') ? getActiveTextStyles() : {}}
                                    >
                                        Privacy Policy
                                    </span>
                                    <span 
                                        class='link-subtitle'
                                        style={isActive('privacy') ? getActiveSubtitleStyles() : {}}
                                    >
                                        Data protection & privacy
                                    </span>
                                </div>
                            </A>
                        </div>
                    </nav>

                    <main class='docs-content'>
                        <Outlet/>
                    </main>
                </div>
            </div>

            <style jsx>{`
              .docs-container {
                width: 100%;
                max-width: 1400px;
                min-height: calc(100vh - 120px);
                
                box-sizing: border-box;
                padding: 40px 20px;
                margin: 0 auto;
              }
              
              .docs-layout {
                width: 100%;
                min-height: 600px;
                
                border-radius: 20px;
                background: rgba(45, 42, 85, 0.51);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                
                display: grid;
                grid-template-columns: 350px 1fr;
                overflow: hidden;
              }
              
              .docs-sidebar {
                background: rgba(0, 0, 0, 0.15);
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                padding: 40px 0;
                
                display: flex;
                flex-direction: column;
                gap: 40px;
              }
              
              .docu-sidebar-header {
                padding: 0 30px;
              }
              
              .docs-title {
                font-size: 26px;
                font-weight: 800;
                color: white;
                margin: 0 0 12px 0;
                letter-spacing: -0.8px;
                background: linear-gradient(135deg, #ffffff 0%, #e8e4ff 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              
              .title-underline {
                height: 4px;
                width: 80px;
                background: linear-gradient(90deg, #7B6FCF 0%, #A594F9 50%, #7B6FCF 100%);
                border-radius: 2px;
              }
              
              .docu-docu-nav-links {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 0 30px;
              }
              
              .docu-nav-link {
                display: flex;
                align-items: center;
                text-decoration: none;
                padding: 24px 26px;
                border-radius: 14px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
              }
              
              .docu-nav-link::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
                transition: left 0.5s ease;
              }
              
              .docu-nav-link:hover::before {
                left: 100%;
              }
              
              .docu-nav-link:hover {
                background: rgba(255, 255, 255, 0.07);
                border-color: rgba(255, 255, 255, 0.15);
                transform: translateX(2px);
              }
              
              .link-content {
                display: flex;
                flex-direction: column;
                gap: 6px;
                flex: 1;
                min-width: 0;
              }
              
              .link-text {
                font-size: 16px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.85);
                transition: all 0.3s ease;
                letter-spacing: 0.2px;
                line-height: 1.3;
              }
              
              .docu-nav-link:hover .link-text {
                color: rgba(255, 255, 255, 0.95);
              }
              
              .link-subtitle {
                font-size: 13px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.45);
                transition: all 0.3s ease;
                letter-spacing: 0.3px;
                line-height: 1.4;
              }
              
              .docu-nav-link:hover .link-subtitle {
                color: rgba(255, 255, 255, 0.65);
              }
              
              .docs-content {
                padding: 50px;
                overflow-y: auto;
                max-height: calc(100vh - 200px);
              }
              
              .docs-content::-webkit-scrollbar {
                width: 8px;
              }
              
              .docs-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
              }
              
              .docs-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
              }
              
              .docs-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
              
              @media only screen and (max-width: 900px) {
                .docs-container {
                  padding: 25px 20px 90px 20px;
                }
                
                .docs-layout {
                  grid-template-columns: 1fr;
                  grid-template-rows: auto 1fr;
                  border-radius: 16px;
                }
                
                .docs-sidebar {
                  border-right: none;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  padding: 30px 0;
                  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
                }
                
                .docu-sidebar-header {
                  padding: 0 25px;
                  margin-bottom: 25px;
                  text-align: center;
                }
                
                .docs-title {
                  font-size: 22px;
                }
                
                .title-underline {
                  margin: 0 auto;
                  width: 60px;
                  height: 3px;
                }
                
                .docu-docu-nav-links {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                  padding: 0 25px;
                }
                
                .docu-nav-link {
                  padding: 18px 24px;
                  border-radius: 12px;
                  justify-content: center;
                  text-align: center;
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  backdrop-filter: blur(10px);
                }
                
                .docu-nav-link:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
                }
                
                .link-content {
                  align-items: center;
                  gap: 0;
                }
                
                .link-text {
                  font-size: 16px;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 0.95);
                }
                
                .link-subtitle {
                  display: none;
                }
                
                .docs-content {
                  padding: 35px 25px;
                  max-height: none;
                }
              }
              
              @media only screen and (max-width: 600px) {
                .docs-container {
                  padding: 20px 15px 90px 15px;
                }
                
                .docs-layout {
                  border-radius: 14px;
                }
                
                .docs-sidebar {
                  padding: 25px 0;
                  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.03) 100%);
                }
                
                .docu-sidebar-header {
                  padding: 0 20px;
                  margin-bottom: 20px;
                }
                
                .docs-title {
                  font-size: 20px;
                }
                
                .title-underline {
                  width: 50px;
                  height: 3px;
                }
                
                .docu-docu-nav-links {
                  gap: 10px;
                  padding: 0 20px;
                }
                
                .docu-nav-link {
                  padding: 16px 20px;
                  border-radius: 10px;
                  background: linear-gradient(135deg, rgba(123, 111, 207, 0.15) 0%, rgba(165, 148, 249, 0.08) 100%);
                  border: 1px solid rgba(165, 148, 249, 0.2);
                  box-shadow: 0 3px 10px rgba(123, 111, 207, 0.1);
                  backdrop-filter: blur(8px);
                }
                
                .docu-nav-link:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 5px 15px rgba(123, 111, 207, 0.2);
                  background: linear-gradient(135deg, rgba(123, 111, 207, 0.2) 0%, rgba(165, 148, 249, 0.12) 100%);
                  border-color: rgba(165, 148, 249, 0.3);
                }
                
                .link-text {
                  font-size: 15px;
                  font-weight: 600;
                  color: #ffffff;
                  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
                
                .docs-content {
                  padding: 25px 20px;
                }
              }
              
              @media only screen and (max-width: 480px) {
                .docs-container {
                  padding: 15px 12px 90px 12px;
                }
                
                .docs-layout {
                  border-radius: 12px;
                }
                
                .docs-sidebar {
                  padding: 20px 0;
                }
                
                .docu-sidebar-header {
                  padding: 0 15px;
                  margin-bottom: 18px;
                }
                
                .docs-title {
                  font-size: 18px;
                }
                
                .docu-docu-nav-links {
                  gap: 8px;
                  padding: 0 15px;
                }
                
                .docu-nav-link {
                  padding: 14px 18px;
                  border-radius: 8px;
                  background: linear-gradient(135deg, rgba(123, 111, 207, 0.2) 0%, rgba(165, 148, 249, 0.1) 100%);
                  border: 1px solid rgba(165, 148, 249, 0.25);
                  box-shadow: 0 2px 8px rgba(123, 111, 207, 0.15);
                }
                
                .docu-nav-link:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(123, 111, 207, 0.25);
                }
                
                .link-text {
                  font-size: 14px;
                  font-weight: 600;
                  color: #ffffff;
                }
                
                .docs-content {
                  padding: 20px 15px;
                }
              }
            `}</style>
        </>
    );
}

export default Docs;
