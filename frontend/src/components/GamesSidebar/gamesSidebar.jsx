import { A, useSearchParams } from "@solidjs/router";
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
  const [featuredExpanded, setFeaturedExpanded] = createSignal(true);
  const [communityExpanded, setCommunityExpanded] = createSignal(false);
  const [legalExpanded, setLegalExpanded] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Function to handle dropdown toggling - simple toggle behavior
  const toggleDropdown = (dropdown) => {
    if (props.collapsed) return; // Don't allow dropdown toggling when collapsed
    
    if (dropdown === 'featured') {
      setFeaturedExpanded(!featuredExpanded());
    } else if (dropdown === 'community') {
      setCommunityExpanded(!communityExpanded());
    } else if (dropdown === 'legal') {
      setLegalExpanded(!legalExpanded());
    }
  };

  return (
    <>
      <div class={`games-sidebar ${props.gamesSidebar ? 'active' : ''} ${props.collapsed ? 'collapsed' : ''}`}>
        {/* Content Section */}
        <div class="sidebar-content">
          {/* All Games Card */}
          <div class="games-card">
            <A href="/" class="all-games-item" title="Home">
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
                <A href="/slots" class="game-item" title="Slots">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/slots.svg" alt="Slots" width="18" height="18" />
                    </div>
                    <span class="game-text">Slots</span>
                  </div>
                  <span class="badge new">NEW</span>
                </A>
              </div>

              <div class="games-card">
                <A href="/battles" class="game-item" title="Case Battles">
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
                <A href="/mines" class="game-item" title="Mines">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/mines.svg" alt="Mines" width="18" height="18" />
                    </div>
                    <span class="game-text">Mines</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/jackpot" class="game-item" title="Jackpot">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/jackpot.svg" alt="Jackpot" width="18" height="18" />
                    </div>
                    <span class="game-text">Jackpot</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/coinflip" class="game-item" title="Coinflip">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/coin-flip.svg" alt="Coinflip" width="18" height="18" />
                    </div>
                    <span class="game-text">Coinflip</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/roulette" class="game-item" title="Roulette">
                  <div class="item-left">
                    <div class="game-icon">
                      <img src="/assets/game-icons/roulette.svg" alt="Roulette" width="18" height="18" />
                    </div>
                    <span class="game-text">Roulette</span>
                  </div>
                </A>
              </div>

              <div class="games-card">
                <A href="/cases" class="game-item" title="Cases">
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
              {/* Featured Games Card - when not collapsed */}
              <div class="games-card">
                <button 
                  class="featured-header"
                  onClick={() => toggleDropdown('featured')}
                  title="Featured Games"
                >
                  <div class="item-left">
                    <div class="item-icon">
                    <img src="/assets/game-icons/featured.svg" alt="Featured Games" width="18" height="18" />
                    </div>
                    <span class="item-text">Featured Games</span>
                  </div>
                  <FiChevronDown 
                    size={16}
                    class={`expand-arrow ${featuredExpanded() ? 'expanded' : ''}`}
                  />
                </button>
                
                <div class={`featured-games-list ${featuredExpanded() ? 'expanded' : ''}`}>
                  <A href="/slots" class="game-item" title="Slots">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/slots.svg" alt="Slots" width="18" height="18" />
                      </div>
                      <span class="game-text">Slots</span>
                      <span class="badge new">NEW</span>
                    </div>
                  </A>

                  <A href="/battles" class="game-item" title="Case Battles">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/battles.svg" alt="Case Battles" width="18" height="18" />
                      </div>
                      <span class="game-text">Battles</span>
                      <span class="badge hot">HOT</span>
                    </div>
                  </A>

                  <A href="/mines" class="game-item" title="Mines">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/mines.svg" alt="Mines" width="18" height="18" />
                      </div>
                      <span class="game-text">Mines</span>
                    </div>
                  </A>

                  <A href="/jackpot" class="game-item" title="Jackpot">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/jackpot.svg" alt="Jackpot" width="18" height="18" />
                      </div>
                      <span class="game-text">Jackpot</span>
                    </div>
                  </A>

                  <A href="/coinflip" class="game-item" title="Coinflip">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/coin-flip.svg" alt="Coinflip" width="18" height="18" />
                      </div>
                      <span class="game-text">Coinflip</span>
                    </div>
                  </A>

                  <A href="/roulette" class="game-item" title="Roulette">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/roulette.svg" alt="Roulette" width="18" height="18" />
                      </div>
                      <span class="game-text">Roulette</span>
                    </div>
                  </A>

                  <A href="/cases" class="game-item" title="Cases">
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
                  <A href="/leaderboard" class="game-item" title="Leaderboard">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/leaderboard.svg" alt="Leaderboard" width="18" height="18" />
                      </div>
                      <span class="game-text">Leaderboard</span>
                    </div>
                  </A>

                  {props.user && (
                    <A href="/affiliates" class="game-item" title="Affiliates">
                      <div class="item-left">
                        <div class="game-icon">
                          <img src="/assets/game-icons/affiliates.svg" alt="Affiliates" width="18" height="18" />
                        </div>
                        <span class="game-text">Affiliates</span>
                        <span class="badge new">EARN</span>
                      </div>
                    </A>
                  )}

                  {props.user && (
                    <A href="/surveys" class="game-item" title="Surveys">
                      <div class="item-left">
                        <div class="game-icon">
                          <TbFileDescription size={18} />
                        </div>
                        <span class="game-text">Surveys</span>
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
                  <A href="/docs/faq" class="game-item" title="FAQ">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/faq.svg" alt="FAQ" width="18" height="18" />
                      </div>
                      <span class="game-text">FAQ</span>
                    </div>
                  </A>

                  <A href="/docs/provably" class="game-item" title="Fairness">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/fairness.svg" alt="Fairness" width="18" height="18" />
                      </div>
                      <span class="game-text">Fairness</span>
                    </div>
                  </A>

                  <A href="/docs/tos" class="game-item" title="Terms of Service">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/tos.svg" alt="Terms of Service" width="18" height="18" />
                      </div>
                      <span class="game-text">Terms of Service</span>
                    </div>
                  </A>

                  <A href="/docs/aml" class="game-item" title="AML Policy">
                    <div class="item-left">
                      <div class="game-icon">
                        <img src="/assets/game-icons/aml.svg" alt="AML Policy" width="18" height="18" />
                      </div>
                      <span class="game-text">AML Policy</span>
                    </div>
                  </A>

                  <A href="/docs/privacy" class="game-item" title="Privacy Policy">
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