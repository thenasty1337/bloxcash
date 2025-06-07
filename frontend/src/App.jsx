import {Routes, Route, useSearchParams, useLocation} from '@solidjs/router'
import {createEffect, createSignal, ErrorBoundary, lazy, Suspense} from "solid-js";
import {useUser} from "./contexts/usercontextprovider";
import { TbAlertTriangle, TbRefresh, TbArrowLeft } from 'solid-icons/tb';
import GamesSidebar from "./components/GamesSidebar/gamesSidebar";
import ChatSidebar from "./components/ChatSidebar/chatSidebar";
import {authedAPI, closeDropdowns, createNotification} from "./util/api";
import Navbar from "./components/NavBar/navbar";
import {Toaster} from "solid-toast";
import Loader from "./components/Loader/loader";
import LoadingScreen from "./components/Loader/loadingscreen";
import {Redirect} from "./util/redirect";
import {useWebsocket} from "./contexts/socketprovider";
import {ADMIN_ROLES} from "./resources/users";
import Footer from "./components/Footer/footer";
import Freecoins from "./components/Freecoins/freecoins";
import Rakeback from "./components/Rakeback/rakeback";
import AML from "./components/Documentation/aml";
import UserModal from "./components/UserPopup/userpopup";
import AuthInitializer from "./components/AuthInitializer";
import { AuthStoreSync } from "./components/AuthStoreSync";

const Admin = lazy(() => import('./pages/admin'))
const AdminDashboard = lazy(() => import('./components/Admin/dashboard'))
const AdminUsers = lazy(() => import('./components/Admin/users'))
const AdminStatistics = lazy(() => import('./components/Admin/statistics'))
const AdminFilter = lazy(() => import('./components/Admin/filter'))
const AdminCashier = lazy(() => import('./components/Admin/cashier'))
const AdminRain = lazy(() => import('./components/Admin/rain'))
const AdminStatsbook = lazy(() => import('./components/Admin/statsbook'))
const AdminSettings = lazy(() => import('./components/Admin/settings'))
const AdminCases = lazy(() => import('./components/Admin/cases'))
const AdminSpinShield = lazy(() => import('./components/Admin/spinshield'))

const Mines = lazy(() => import('./pages/mines'))
const Crash = lazy(() => import('./pages/crash'))

const Slot = lazy(() => import('./pages/slot'))
const Slots = lazy(() => import('./pages/slots'))

const Surveys = lazy(() => import('./pages/surveys'))

const Docs = lazy(() => import('./pages/docs'))
const TOS = lazy(() => import('./components/Documentation/tos'))
const Privacy = lazy(() => import('./components/Documentation/privacy'))
const Provably = lazy(() => import('./components/Documentation/provably'))
const FAQ = lazy(() => import('./components/Documentation/faq'))

const SignIn = lazy(() => import('./components/Signin/signin'))

const Home = lazy(() => import('./pages/home'))

const Profile = lazy(() => import('./pages/profile'))
const Transactions = lazy(() => import('./components/Profile/transactions'))
const History = lazy(() => import('./components/Profile/history'))
const Settings = lazy(() => import('./components/Profile/settings'))

const Deposit = lazy(() => import('./pages/deposits'))
const Withdraws = lazy(() => import('./pages/withdraws'))

const Leaderboard = lazy(() => import('./pages/leaderboard'))
const Affiliates = lazy(() => import('./pages/affiliates'))

const Coinflips = lazy(() => import('./pages/coinflips'))
const Roulette = lazy(() => import('./pages/roulette'))
const Jackpot = lazy(() => import('./pages/jackpot'))

const Battles = lazy(() => import('./pages/battles'))
const Battle = lazy(() => import('./pages/battle'))
const CreateBattle = lazy(() => import('./pages/createbattle'))

const Cases = lazy(() => import('./pages/cases'))
const CasesPage = lazy(() => import("./components/Cases/casespage"))
const CasePage = lazy(() => import("./components/Cases/casepage"))

function App() {

  let pageContent

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, {hasFetched, setBalance, setXP, getUser}] = useUser()
  const [ws] = useWebsocket()

  // Utility functions for localStorage
  const getStoredPreference = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const setStoredPreference = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  // Initialize states with localStorage persistence
  // Chat is open by default (true), unless user previously closed it
  const [chat, setChat] = createSignal(getStoredPreference('chatOpen', true))
  const [gamesSidebar, setGamesSidebar] = createSignal(getStoredPreference('gamesSidebarOpen', false))
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false)

  // Create wrapped setters that also save to localStorage
  const setChatWithStorage = (value) => {
    setChat(value);
    setStoredPreference('chatOpen', value);
  };

  const setGamesSidebarWithStorage = (value) => {
    setGamesSidebar(value);
    setStoredPreference('gamesSidebarOpen', value);
  };

  createEffect(() => {
    if (location.pathname && pageContent) {
      pageContent.scrollTo({top: 0})
    }
  })

  createEffect(() => {
    const socket = ws();
    if (!socket) return;
    
    // Check initial connection state
    if (socket.connected) {
      setupBalanceListeners(socket);
    }
    
    // Also listen for future connections/reconnections
    socket.on('connect', () => {
      setupBalanceListeners(socket);
    });
  });
  
  // Separate function to set up balance listeners to avoid code duplication
  function setupBalanceListeners(socket) {
    // First remove any existing listeners to prevent duplicates
    socket.off('balance');
    socket.off('balance:update');
    socket.off('xp');
    socket.off('coinflip:own:started');
      
    // Handle the legacy balance event (keeping this for compatibility)
    socket.on('balance', (type, amount, delay) => {
      console.log(`💰 Legacy balance event: ${type} ${amount}`);
      
      if(type === 'add') {
        console.log('Adding ' + amount + ' to balance');
        const currentBalance = user().balance;
        console.log('Balance before add: ' + currentBalance);
        const newBalance = Number(currentBalance) + Number(amount);
        console.log('Will add: ' + Number(currentBalance) + ' + ' + Number(amount) + ' = ' + newBalance);
        // Direct value update instead of callback
        setBalance(newBalance);
        // Note: user().balance won't reflect the change immediately, it will be updated in the next render
      } else if (type === 'set') {
        setBalance(Number(amount));
      } else if (type === 'subtract') {
        const currentBalance = user().balance;
        const newBalance = Math.max(0, Number(currentBalance) - Number(amount));
        setBalance(newBalance);
      }

      // Only show notifications for add/subtract, not for set operations
      if (type !== 'set') {
        setTimeout(() => {
          // Format the notification properly
          const prefix = type === 'add' ? '+' : '-';
          createNotification(`${prefix}$${amount}`, type === 'add' ? 'success' : 'error');
        }, delay ?? 1);
      }
    });

    // Handle the new balance:update event (new format with user filtering)
    socket.on('balance:update', (data) => {
      console.log(`💰 New balance update received:`, data);
      
      // Only process updates for the current user
      if (user() && data.userId === user().id) {
        console.log(`💰 Processing balance update for current user`);
        
        if (data.type === 'set') {
          console.log(`💰 Setting balance to: ${data.amount}`);
          setTimeout(() => {
            setBalance(data.amount);
            console.log(`💰 Balance updated to: ${data.amount}`);
          }, +data.delay || 0);
        }
  
        if (data.type === 'add') {
          const newBalance = (user()?.balance || 0) + data.amount;
          console.log(`💰 Adding ${data.amount} to balance. New balance will be: ${newBalance}`);
          setTimeout(() => {
            setBalance(newBalance);
            console.log(`💰 Balance updated to: ${newBalance}`);
          }, +data.delay || 0);
        }
      }
    });

    // Handle XP updates
    socket.on('xp', (xp) => {
      setXP(xp);
    });

    // Handle coinflips
    socket.on('coinflip:own:started', (flip) => {
      if (!user()) return;
      let isCreator = flip[flip.ownerSide]?.id === user()?.id;
      let creatorWon = flip.winnerSide === flip.ownerSide;

      if ((isCreator && !creatorWon) || (!isCreator && creatorWon)) return;
    });
  }

  createEffect(async () => {
    try {
      if (!hasFetched()) return

      if (!user() && searchParams.a)  {
        setSearchParams({ a: null, modal: 'login' })
        localStorage.setItem('aff', searchParams.a)
        return
      }

      if (user() && searchParams.a) {
        setSearchParams({a: null})

        let res = await authedAPI('/user/affiliate', 'POST', JSON.stringify({
          code: searchParams.a
        }), true)

        if (res.success) {
          createNotification('success', `Successfully redeemed affiliate code ${searchParams.a}.`)
        }
      }
    } catch (e) {
      console.error(e)
      setSearchParams({a: null})
    }
  })

  return (
    <AuthInitializer>
      <AuthStoreSync />
      {!hasFetched() ? (
        <LoadingScreen/>
      ) : (
        <>
          <Toaster
            position='bottom-right'
          />

          {searchParams.modal === 'login' && !user() && (
            <SignIn ws={ws}/>
          )}

          {searchParams.modal === 'freecoins' && user() && (
            <Freecoins ws={ws}/>
          )}

          {searchParams?.modal === 'rakeback' && user() && (
            <Rakeback ws={ws} user={user()}/>
          )}

          {searchParams?.user && (
              <UserModal user={user()}/>
          )}

          <ErrorBoundary
            fallback={err => {
              console.log(err.message)
              if (err.message.includes('dynamically imported module')) {
                return window.location.reload()
              }

              return (
                <div class="error-container">
                  <div class="error-card">
                    <div class="error-icon">
                      <TbAlertTriangle size={32} />
                    </div>
                    <h3 class="error-title">Something went wrong</h3>
                    <p class="error-message">
                      An unexpected error occurred. Help us fix it by sharing the console details.
                    </p>
                    <div class="error-instructions">
                      <span class="instruction">Press <kbd>F12</kbd> → <strong>Console</strong> → Copy red errors → Report to support</span>
                    </div>
                    <div class="error-actions">
                      <button 
                        class="btn-primary" 
                        onClick={() => window.location.reload()}
                      >
                        <TbRefresh size={16} />
                        Reload
                      </button>
                      <button 
                        class="btn-secondary" 
                        onClick={() => window.history.back()}
                      >
                        <TbArrowLeft size={16} />
                        Go Back
                      </button>
                    </div>
                  </div>
                  
                  <style jsx>{`
                    .error-container {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      padding: 20px;
                      background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(32, 45, 65, 0.9) 100%);
                    }
                    
                    .error-card {
                      background: rgba(26, 35, 50, 0.6);
                      border: 1px solid rgba(78, 205, 196, 0.2);
                      border-radius: 10px;
                      padding: 32px;
                      max-width: 420px;
                      width: 100%;
                      text-align: center;
                      backdrop-filter: blur(8px);
                      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                      transition: all 0.3s ease;
                    }
                    
                    .error-card:hover {
                      border-color: rgba(78, 205, 196, 0.3);
                      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                      transform: translateY(-1px);
                    }
                    
                    .error-icon {
                      margin-bottom: 16px;
                      color: #4ecdc4;
                      display: flex;
                      justify-content: center;
                      opacity: 0.9;
                    }
                    
                    .error-title {
                      color: #ffffff;
                      font-size: 18px;
                      font-weight: 600;
                      margin: 0 0 8px 0;
                      font-family: inherit;
                    }
                    
                    .error-message {
                      color: #8aa3b8;
                      font-size: 14px;
                      line-height: 1.4;
                      margin: 0 0 20px 0;
                    }
                    
                    .error-instructions {
                      background: rgba(45, 75, 105, 0.25);
                      border: 1px solid rgba(78, 205, 196, 0.15);
                      border-radius: 8px;
                      padding: 12px;
                      margin-bottom: 24px;
                      backdrop-filter: blur(8px);
                    }
                    
                    .instruction {
                      color: #8aa3b8;
                      font-size: 12px;
                      line-height: 1.3;
                    }
                    
                    .instruction kbd {
                      background: rgba(78, 205, 196, 0.1);
                      border: 1px solid rgba(78, 205, 196, 0.2);
                      border-radius: 4px;
                      padding: 2px 6px;
                      font-size: 11px;
                      font-family: 'Monaco', 'Menlo', monospace;
                      color: #4ecdc4;
                      margin: 0 2px;
                    }
                    
                    .instruction strong {
                      color: #ffffff;
                      font-weight: 600;
                    }
                    
                    .error-actions {
                      display: flex;
                      gap: 10px;
                      justify-content: center;
                    }
                    
                    .btn-primary, .btn-secondary {
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      padding: 11px 14px;
                      border-radius: 8px;
                      font-size: 13px;
                      font-weight: 600;
                      border: none;
                      cursor: pointer;
                      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      font-family: inherit;
                    }
                    
                    .btn-primary {
                      background: rgba(45, 75, 105, 0.25);
                      border: 1px solid rgba(78, 205, 196, 0.2);
                      color: #8aa3b8;
                      backdrop-filter: blur(8px);
                    }
                    
                    .btn-primary:hover {
                      background: rgba(78, 205, 196, 0.15);
                      border-color: #4ecdc4;
                      color: #4ecdc4;
                      transform: translateY(-2px);
                      box-shadow: 0 6px 16px rgba(78, 205, 196, 0.2);
                    }
                    
                    .btn-secondary {
                      background: rgba(45, 75, 105, 0.2);
                      color: #8aa3b8;
                      border: 1px solid rgba(78, 205, 196, 0.15);
                      backdrop-filter: blur(8px);
                    }
                    
                    .btn-secondary:hover {
                      background: rgba(78, 205, 196, 0.1);
                      color: #ffffff;
                      border-color: rgba(78, 205, 196, 0.2);
                      transform: translateY(-2px);
                      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.15);
                    }
                    
                    @media (max-width: 640px) {
                      .error-card {
                        padding: 24px;
                        margin: 0 16px;
                      }
                      
                      .error-title {
                        font-size: 16px;
                      }
                      
                      .error-message {
                        font-size: 13px;
                      }
                      
                      .error-actions {
                        flex-direction: column;
                      }
                      
                      .btn-primary, .btn-secondary {
                        width: 100%;
                        justify-content: center;
                      }
                    }
                  `}</style>
                  {console.log(err)}
                </div>
              )
            }}>
            <div class='app' onClick={() => closeDropdowns()}>
              <GamesSidebar 
                gamesSidebar={gamesSidebar()} 
                setGamesSidebar={setGamesSidebarWithStorage} 
                user={user()} 
                collapsed={sidebarCollapsed()}
              />
              
              <Navbar 
                user={user()} 
                chat={chat()} 
                setChat={setChatWithStorage} 
                gamesSidebar={gamesSidebar()} 
                setGamesSidebar={setGamesSidebarWithStorage}
                sidebarCollapsed={sidebarCollapsed()}
                setSidebarCollapsed={setSidebarCollapsed}
              />
              
              <div class={`center ${sidebarCollapsed() ? 'collapsed' : ''} ${chat() ? 'chat-open' : ''}`} ref={pageContent}>
                <div class='content'>
                  <Routes>
                    <Route path='/' element={
                      <Suspense fallback={<Loader/>}>
                        <Home user={user()}/>
                      </Suspense>
                    }/>

                    <Route path='/surveys' element={
                      <Suspense fallback={<Loader/>}>
                        <Surveys user={user()}/>
                      </Suspense>
                    }/>

                    <Route path='/roulette' element={
                      <Suspense fallback={<Loader/>}>
                        <Roulette user={user()}/>
                      </Suspense>
                    }/>

                    <Route path='/jackpot' element={
                      <Suspense fallback={<Loader/>}>
                        <Jackpot user={user()}/>
                      </Suspense>
                    }/>

                    {/*<Route path='/crash' element={*/}
                    {/*    <Suspense fallback={<Loader/>}>*/}
                    {/*        <Crash user={user()}/>*/}
                    {/*    </Suspense>*/}
                    {/*}/>*/}

                    <Route path='/mines' element={
                      <Suspense fallback={<Loader/>}>
                        <Mines user={user()}/>
                      </Suspense>
                    }/>

                    <Route path='/cases' element={
                      <Suspense fallback={<Loader/>}>
                        <Cases/>
                      </Suspense>
                    }>

                      <Route path='/' element={
                        <Suspense fallback={<Loader/>}>
                          <CasesPage/>
                        </Suspense>
                      }/>

                      <Route path='/:slug' element={
                        <Suspense fallback={<Loader/>}>
                          <CasePage/>
                        </Suspense>
                      }/>
                    </Route>

                    <Route path='/battles' element={
                      <Suspense fallback={<Loader/>}>
                        <Battles user={user()}/>
                      </Suspense>
                    }/>
                    <Route path='/battle/create' element={
                      <Suspense fallback={<Loader/>}>
                        <CreateBattle user={user()}/>
                      </Suspense>
                    }/>
                    <Route path='/battle/:id' element={
                      <Suspense fallback={<Loader/>}>
                        <Battle user={user()}/>
                      </Suspense>
                    }/>

                    <Route path='/coinflip' element={
                      <Suspense fallback={<Loader/>}>
                        <Coinflips/>
                      </Suspense>
                    }/>

                    <Route path='/slots' element={
                      <Suspense fallback={<Loader/>}>
                        <Slots/>
                      </Suspense>
                    }/>

                    <Route path='/slots/:slug/*' element={
                      <Suspense fallback={<Loader/>}>
                        <Slot/>
                      </Suspense>
                    }/>

                    <Route path='/leaderboard' element={
                      <Suspense fallback={<Loader/>}>
                        <Leaderboard/>
                      </Suspense>
                    }/>

                    <Route path='/docs' element={
                      <Suspense fallback={<Loader/>}>
                        <Docs/>
                      </Suspense>
                    }>
                      <Route path='/faq' element={
                        <Suspense fallback={<Loader/>}>
                          <FAQ/>
                        </Suspense>
                      }/>
                      <Route path='/provably' element={
                        <Suspense fallback={<Loader/>}>
                          <Provably/>
                        </Suspense>
                      }/>
                      <Route path='/tos' element={
                        <Suspense fallback={<Loader/>}>
                          <TOS/>
                        </Suspense>
                      }/>
                      <Route path='/privacy' element={
                        <Suspense fallback={<Loader/>}>
                          <Privacy/>
                        </Suspense>
                      }/>
                      <Route path='/aml' element={
                        <Suspense fallback={<Loader/>}>
                          <AML/>
                        </Suspense>
                      }/>
                    </Route>

                    {user() && (
                      <>
                        <Route path='/affiliates' element={
                          <Suspense fallback={<Loader/>}>
                            <Affiliates user={user()}/>
                          </Suspense>
                        }/>

                        <Route path='/profile' element={
                          <Suspense fallback={<Loader/>}>
                            <Profile/>
                          </Suspense>
                        }>
                          <Route path='/transactions' element={<Transactions/>}/>
                          <Route path='/history' element={<History/>}/>
                          <Route path='/settings' element={<Settings/>}/>
                        </Route>

                        <Route path='/deposit' element={
                          <Suspense fallback={<Loader/>}>
                            <Deposit/>
                          </Suspense>
                        }/>

                        <Route path='/deposit' element={
                          <Suspense fallback={<Loader/>}>
                            <Deposit/>
                          </Suspense>
                        }/>

                        <Route path='/withdraw' element={
                          <Suspense fallback={<Loader/>}>
                            <Withdraws/>
                          </Suspense>
                        }/>
                      </>
                    )}

                    {user() && ADMIN_ROLES.includes(user().role) && (
                      <>
                        <Route path='/admin' element={
                          <Suspense fallback={<Loader/>}>
                            <Admin/>
                          </Suspense>
                        }>
                          <Route path='/' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminDashboard/>
                            </Suspense>
                          }/>

                          <Route path='/users' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminUsers/>
                            </Suspense>
                          }/>

                          <Route path='/statistics' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminStatistics/>
                            </Suspense>
                          }/>

                          <Route path='/filter' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminFilter/>
                            </Suspense>
                          }/>

                          <Route path='/cashier' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminCashier/>
                            </Suspense>
                          }/>

                          <Route path='/rain' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminRain/>
                            </Suspense>
                          }/>

                          <Route path='/statsbook' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminStatsbook/>
                            </Suspense>
                          }/>

                          <Route path='/cases' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminCases/>
                            </Suspense>
                          }/>

                          <Route path='/settings' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminSettings/>
                            </Suspense>
                          }/>

                          <Route path='/spinshield' element={
                            <Suspense fallback={<Loader/>}>
                              <AdminSpinShield/>
                            </Suspense>
                          }/>
                        </Route>
                      </>
                    )}

                    {hasFetched() && (
                      <Route path='*' element={<Redirect/>}/>
                    )}
                  </Routes>

                  {/* <div class='background'/> */}
                </div>

                <Footer/>
              </div>

                              <ChatSidebar chat={chat()} setChat={setChatWithStorage}/>
            </div>
          </ErrorBoundary>
        </>
      )}

      <style jsx>{`
        .app {
          width: 100vw;
          height: 100vh;

          display: flex;
          position: relative;
          overflow: hidden;
          scrollbar-color: transparent transparent;
        }

        .center {
          height: calc(100vh - 70px); /* Subtract navbar height */
          width: 100%;
          position: relative;
          overflow: auto;
          scrollbar-color: transparent transparent;
          margin-left: 240px; /* Account for games sidebar */
          margin-right: 0; /* Default - no chat open */
          margin-top: 70px; /* Account for navbar height */
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .center.collapsed {
          margin-left: 60px; /* Account for collapsed sidebar */
        }

        .center.chat-open {
          margin-right: 300px; /* Account for chat sidebar */
        }

        .center::-webkit-scrollbar {
          display: none;
        }

        .content {
          width: 100%;
          min-height: calc(100% - 130px);
          {/* background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(32, 45, 65, 0.9) 100%);
          border-radius: 25px 0 0 0; */}
          position: relative;
          {/* padding: 0 25px; */}
          scrollbar-color: transparent transparent;
        }

        .content::-webkit-scrollbar {
          display: none;
        }

        .background {
          position: absolute;
          max-width: 1500px;
          top: 0;
          left: 50%;
          transform: translateX(-50%);

          height: 100%;
          width: 100%;

          background-image: url("/assets/art/background.png");
          mix-blend-mode: luminosity;
          z-index: -1;

          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        }

        .app::-webkit-scrollbar {
          display: none;
        }

        @media only screen and (max-width: 1250px) {
          .center {
            margin-left: 0;
            margin-right: 0; /* Reset right margin on mobile */
            padding-bottom: 50px;
            margin-top: 70px; /* Adjust for smaller navbar on mobile */
            height: calc(100vh - 70px);
          }

          .center.chat-open {
            margin-right: 0; /* Chat overlays on mobile, doesn't push content */
          }
        }
      `}</style>
    </AuthInitializer>
  );
}

export default App;
