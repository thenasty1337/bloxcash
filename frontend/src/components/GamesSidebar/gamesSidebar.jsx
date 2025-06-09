import { A, useSearchParams, useLocation } from "@solidjs/router";
import {openSupport} from "../../util/support";
import { createSignal } from "solid-js";
import { 
  AiOutlineStar,
  AiOutlineMessage,
  AiOutlineAppstore,
  AiOutlineTrophy,
  AiOutlineTeam,
  AiOutlineQuestionCircle,
  AiOutlineLock,
  AiOutlineFileText,
  AiOutlineDollar
} from 'solid-icons/ai';

import { FiChevronDown } from 'solid-icons/fi';
import { 
  BiSolidDiamond,
  BiSolidCube,
  BiSolidTrophy,
  BiSolidCircle
} from 'solid-icons/bi';
import { 
  FaBrandsDiscord,
  FaBrandsTelegram,
  FaBrandsInstagram,
  FaBrandsFacebook
} from 'solid-icons/fa';
import { 
  IoGameController,
  IoDocumentText
} from 'solid-icons/io';
import { TbCards, TbTool, TbFileDescription } from 'solid-icons/tb';
import { RiMediaPlayCircleFill } from 'solid-icons/ri';
import "./gamesSidebar.css";

function GamesSidebar(props) {
  const [houseGamesExpanded, setHouseGamesExpanded] = createSignal(false);
  const [slotsExpanded, setSlotsExpanded] = createSignal(true);
  const [communityExpanded, setCommunityExpanded] = createSignal(false);
  const [legalExpanded, setLegalExpanded] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Function to handle dropdown toggling - simple toggle behavior
  const toggleDropdown = (dropdown) => {
    if (props.collapsed) return; // Don't allow dropdown toggling when collapsed
    
    if (dropdown === 'houseGames') {
      setHouseGamesExpanded(!houseGamesExpanded());
    } else if (dropdown === 'slots') {
      setSlotsExpanded(!slotsExpanded());
    } else if (dropdown === 'community') {
      setCommunityExpanded(!communityExpanded());
    } else if (dropdown === 'legal') {
      setLegalExpanded(!legalExpanded());
    }
  };

  // Function to check if a link is active
  const isActive = (href) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // Handle query-based URLs like /slots?sort=popularity
    if (href.includes('?')) {
      const [linkPath, linkQuery] = href.split('?');
      
      // Path must match exactly
      if (linkPath !== currentPath) return false;
      
      // For query-based links, check exact parameter match
      const currentParams = new URLSearchParams(currentSearch);
      const linkParams = new URLSearchParams(linkQuery);
      
      // Must have same number of parameters
      if (currentParams.size !== linkParams.size) return false;
      
      // All link parameters must match current parameters exactly
      for (const [key, value] of linkParams) {
        if (currentParams.get(key) !== value) return false;
      }
      
      return true;
    } else {
      // Handle direct path URLs like /slots/featured, /, /favorites
      return href === currentPath;
    }
  };

  // Function to check if a link is active, but only for the current view mode
  const isActiveForCurrentView = (href, isCollapsedView) => {
    // Only apply active state to links in the currently visible section
    if (props.collapsed !== isCollapsedView) return false;
    return isActive(href);
  };

  return (
    <>
      <div class={`games-sidebar ${props.gamesSidebar ? 'active' : ''} ${props.collapsed ? 'collapsed' : ''}`}>
        {/* Content Section */}
        <div class="sidebar-content">
          {/* All Games Card */}
          <div class="games-card">
            <A href="/" class={`all-games-item ${isActive('/') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Home">
              <div class="item-left">
                <div class="item-icon">
                  <img src="/assets/game-icons/home.svg" alt="Home" width="18" height="18" />
                </div>
                <span class="item-text">Home</span>
              </div>
            </A>
          </div>

                        {/* When collapsed, show individual game icons */}
          {props.collapsed ? (
            <>
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('slots')}
                  title="Slots"
                >
                  <div class="item-left">
                    <div class="item-icon">
                      <img src="/assets/game-icons/slots.svg" alt="Slots" width="18" height="18" />
                    </div>
                    <span class="item-text">Slots</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${slotsExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${slotsExpanded() ? 'expanded' : ''}`}>
                  <A href="/slots/featured" class={`game-item ${isActiveForCurrentView('/slots/featured', true) ? 'active' : ''}`} activeClass="" inactiveClass="" title="Featured Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/favourites.svg" alt="Featured Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Featured Slots</span>
                    </div>
                  </A>

                  <A href="/slots?sort=popularity" class={`game-item ${isActive('/slots?sort=popularity') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Popular Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/popular.svg" alt="Popular Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Popular Slots</span>
                    </div>
                  </A>

                  <A href="/slots?isNew=true" class={`game-item ${isActive('/slots?isNew=true') ? 'active' : ''}`} activeClass="" inactiveClass="" title="New Releases">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/new.svg" alt="New Releases" width="18" height="18" />
                      </div>
                      <span class="game-text">New Releases</span>
                    </div>
                  </A>

                  <A href="/slots?type=video-slots" class={`game-item ${isActive('/slots?type=video-slots') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Video Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/slot.svg" alt="Video Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Video Slots</span>
                    </div>
                  </A>

                  <A href="/slots?type=live" class={`game-item ${isActive('/slots?type=live') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Game Shows">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/game-shows.svg" alt="Game Shows" width="18" height="18" />
                      </div>
                      <span class="game-text">Game Shows</span>
                    </div>
                  </A>

                  {props.user && (
                    <A href="/favorites" class={`game-item ${isActive('/favorites') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Your Favorites">
                      <div class="item-left">
                        <div class="game-icon">
                          <img src="/assets/GameIcons/favourites.svg" alt="Your Favorites" width="18" height="18" />
                        </div>
                        <span class="game-text">Your Favorites</span>
                      </div>
                    </A>
                  )}
                </div>
              </div>

              <div class="games-card">
                <A href="/battles" class={`game-item ${isActive('/battles') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Case Battles">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/battles.svg" alt="Case Battles" width="18" height="18" />
                    </div>
                    <span class="game-text">Case Battles</span>
                  </div>
                  <span class="badge hot">HOT</span>
                </A>
              </div>

              <div class="games-card">
                <A href="/mines" class={`game-item ${isActive('/mines') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Mines">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/mines.svg" alt="Mines" width="18" height="18" />
                    </div>
                    <span class="game-text">Mines</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/jackpot" class={`game-item ${isActive('/jackpot') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Jackpot">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/jackpot.svg" alt="Jackpot" width="18" height="18" />
                    </div>
                    <span class="game-text">Jackpot</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/coinflip" class={`game-item ${isActive('/coinflip') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Coinflip">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/coin-flip.svg" alt="Coinflip" width="18" height="18" />
                    </div>
                    <span class="game-text">Coinflip</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/roulette" class={`game-item ${isActive('/roulette') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Roulette">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/roulette.svg" alt="Roulette" width="18" height="18" />
                    </div>
                    <span class="game-text">Roulette</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/cases" class={`game-item ${isActive('/cases') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Cases">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/packs.svg" alt="Cases" width="18" height="18" />
                    </div>
                    <span class="game-text">Cases</span>
                  </div>
                </A>
              </div>
            </>
          ) : (
            <>
              {/* Slots Card - when not collapsed */}
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('slots')}
                  title="Slots"
                >
                  <div class="item-left">
                    <div class="item-icon">
                      <img src="/assets/game-icons/slots.svg" alt="Slots" width="18" height="18" />
                    </div>
                    <span class="item-text">Slots</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${slotsExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${slotsExpanded() ? 'expanded' : ''}`}>
                  <A href="/slots/featured" class={`game-item ${isActive('/slots/featured') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Featured Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/favourites.svg" alt="Featured Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Featured Slots</span>
                    </div>
                  </A>

                  <A href="/slots?sort=popularity" class={`game-item ${isActive('/slots?sort=popularity') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Popular Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/popular.svg" alt="Popular Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Popular Slots</span>
                    </div>
                  </A>

                  <A href="/slots?isNew=true" class={`game-item ${isActive('/slots?isNew=true') ? 'active' : ''}`} activeClass="" inactiveClass="" title="New Releases">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/new.svg" alt="New Releases" width="18" height="18" />
                      </div>
                      <span class="game-text">New Releases</span>
                    </div>
                  </A>

                  <A href="/slots?type=video-slots" class={`game-item ${isActive('/slots?type=video-slots') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Video Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/slot.svg" alt="Video Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Video Slots</span>
                    </div>
                  </A>

                  <A href="/slots?type=live" class={`game-item ${isActive('/slots?type=live') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Game Shows">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/GameIcons/game-shows.svg" alt="Game Shows" width="18" height="18" />
                      </div>
                      <span class="game-text">Game Shows</span>
                    </div>
                  </A>

                  {props.user && (
                    <A href="/favorites" class={`game-item ${isActive('/favorites') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Your Favorites">
                      <div class="item-left">
                        <div class="game-icon">
                          <img src="/assets/GameIcons/favourites.svg" alt="Your Favorites" width="18" height="18" />
                        </div>
                        <span class="game-text">Your Favorites</span>
                      </div>
                    </A>
                  )}
                </div>
              </div>

              {/* House Games Card - when not collapsed */}
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('houseGames')}
                  title="House Games"
                >
                  <div class="item-left">
                    <div class="item-icon">
                    <img src="/assets/game-icons/featured.svg" alt="House Games" width="18" height="18" />
                    </div>
                    <span class="item-text">House Games</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${houseGamesExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${houseGamesExpanded() ? 'expanded' : ''}`}>
                  <A href="/battles" class={`game-item ${isActive('/battles') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Case Battles">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/battles.svg" alt="Case Battles" width="18" height="18" />
                      </div>
                      <span class="game-text">Battles</span>
                      <span class="badge hot">HOT</span>
                    </div>
                  </A>

                  <A href="/mines" class={`game-item ${isActive('/mines') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Mines">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/mines.svg" alt="Mines" width="18" height="18" />
                      </div>
                      <span class="game-text">Mines</span>
                    </div>
                  </A>

                  <A href="/jackpot" class={`game-item ${isActive('/jackpot') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Jackpot">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/jackpot.svg" alt="Jackpot" width="18" height="18" />
                      </div>
                      <span class="game-text">Jackpot</span>
                    </div>
                  </A>

                  <A href="/coinflip" class={`game-item ${isActive('/coinflip') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Coinflip">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/coin-flip.svg" alt="Coinflip" width="18" height="18" />
                      </div>
                      <span class="game-text">Coinflip</span>
                    </div>
                  </A>

                  <A href="/roulette" class={`game-item ${isActive('/roulette') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Roulette">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/roulette.svg" alt="Roulette" width="18" height="18" />
                      </div>
                      <span class="game-text">Roulette</span>
                    </div>
                  </A>

                  <A href="/cases" class={`game-item ${isActive('/cases') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Cases">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/packs.svg" alt="Cases" width="18" height="18" />
                      </div>
                      <span class="game-text">Packs</span>
                    </div>
                  </A>
                </div>
              </div>

              {/* Community & Features - only show when not collapsed */}
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('community')}
                  title="Community"
                >
                  <div class="item-left">
                    <div class="item-icon">
                      <img src="/assets/game-icons/community.svg" alt="Community" width="18" height="18" />
                    </div>
                    <span class="item-text">Community</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${communityExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${communityExpanded() ? 'expanded' : ''}`}>
                  <A href="/leaderboard" class={`game-item ${isActive('/leaderboard') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Leaderboard">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/leaderboard.svg" alt="Leaderboard" width="18" height="18" />
                      </div>
                      <span class="game-text">Leaderboard</span>
                    </div>
                  </A>

                  {props.user && (
                    <A href="/affiliates" class={`game-item ${isActive('/affiliates') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Affiliates">
                      <div class="item-left">
                        <div class="game-icon">
                          <img src="/assets/game-icons/affiliates.svg" alt="Affiliates" width="18" height="18" />
                        </div>
                        <span class="game-text">Affiliates</span>
                        <span class="badge new">EARN</span>
                      </div>
                    </A>
                  )}

                  
                </div>
              </div>

              {/* Legal & Support - only show when not collapsed */}
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('legal')}
                  title="Legal & Support"
                >
                  <div class="item-left">
                    <div class="item-icon">
                      <img src="/assets/game-icons/legal.svg" alt="Legal & Support" width="18" height="18" />
                    </div>
                    <span class="item-text">Legal & Support</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${legalExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${legalExpanded() ? 'expanded' : ''}`}>
                  <A href="/docs/faq" class={`game-item ${isActive('/docs/faq') ? 'active' : ''}`} activeClass="" inactiveClass="" title="FAQ">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/faq.svg" alt="FAQ" width="18" height="18" />
                      </div>
                      <span class="game-text">FAQ</span>
                    </div>
                  </A>

                  <A href="/docs/provably" class={`game-item ${isActive('/docs/provably') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Fairness">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/fairness.svg" alt="Fairness" width="18" height="18" />
                      </div>
                      <span class="game-text">Fairness</span>
                    </div>
                  </A>

                  <A href="/docs/tos" class={`game-item ${isActive('/docs/tos') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Terms of Service">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/tos.svg" alt="Terms of Service" width="18" height="18" />
                      </div>
                      <span class="game-text">Terms of Service</span>
                    </div>
                  </A>

                  <A href="/docs/aml" class={`game-item ${isActive('/docs/aml') ? 'active' : ''}`} activeClass="" inactiveClass="" title="AML Policy">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/aml.svg" alt="AML Policy" width="18" height="18" />
                      </div>
                      <span class="game-text">AML Policy</span>
                    </div>
                  </A>

                  <A href="/docs/privacy" class={`game-item ${isActive('/docs/privacy') ? 'active' : ''}`} activeClass="" inactiveClass="" title="Privacy Policy">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/legal.svg" alt="Privacy Policy" width="18" height="18" />
                      </div>
                      <span class="game-text">Privacy Policy</span>
                    </div>
                  </A>
                </div>
              </div>
            </>
          )}
          
        </div>

        {/* Footer */}
        <div class="sidebar-footer">
          <button class="live-support" onClick={() => openSupport()} title="Live Support">
            <AiOutlineMessage size={16} />
            <span>Live Support</span>
          </button>

          <div class="social-icons">
            <button class="social-icon" title="Discord">
              <FaBrandsDiscord size={18} />
            </button>
            <button class="social-icon" title="Telegram">
              <FaBrandsTelegram size={18} />
            </button>
            <button class="social-icon" title="Instagram">
              <FaBrandsInstagram size={18} />
            </button>
            <button class="social-icon" title="Facebook">
              <FaBrandsFacebook size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GamesSidebar; 