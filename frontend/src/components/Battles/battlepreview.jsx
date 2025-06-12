import GreenCount from "../Count/greencount";
import {createEffect, createSignal, createMemo, For} from "solid-js";
import Avatar from "../Level/avatar";
import {getCents} from "../../util/balance";
import {A, useNavigate} from "@solidjs/router";
import {authedAPI} from "../../util/api";
import ActiveGame from "../Loader/activegame";

function BattlePreview(props) {

  const navigate = useNavigate()
  const [state, setState] = createSignal('waiting')
  const [isHoveringCases, setIsHoveringCases] = createSignal(false)
  const [needsScrolling, setNeedsScrolling] = createSignal(false)
  const [currentRound, setCurrentRound] = createSignal(0)
  let casesScrollRef

  createEffect(() => {
    const battle = props?.battle
    if (!battle) return
    
    let newState = 'waiting'
    
    // Battle is finished if it has an endedAt timestamp or winnerTeam is set
    if (battle.endedAt || battle.winnerTeam !== null) {
      newState = 'finished'
    }
    // Battle is rolling if it has a round number > 0 and not ended
    else if (battle.round > 0 && !battle.endedAt) {
      newState = 'rolling'
    }
    // Battle is waiting if it hasn't started yet
    else if (!battle.startedAt) {
      newState = 'waiting'
    }

    
    setState(newState)
  })

  // Track current round changes
  createEffect(() => {
    setCurrentRound(props?.battle?.round || 0)
  })

  // Create reactive round data
  const roundsWithState = createMemo(() => {
    const rounds = props?.battle?.rounds || []
    const battleState = state()
    const currentRoundNum = currentRound()
    

    
    return rounds.map((round, index) => {
      const isCurrentRound = battleState === 'rolling' && (index === (currentRoundNum - 1))
      const isOpenedRound = battleState === 'finished' || round.round < currentRoundNum
      

      
      return {
        ...round,
        isCurrentRound,
        isOpenedRound
      }
    })
  })

  createEffect(() => {
    // Check if scrolling is needed - if we have more cases than can fit in the container
    const battle = props?.battle
    if (casesScrollRef && battle?.rounds?.length > 0) {
      const containerWidth = casesScrollRef.clientWidth
      const caseWidth = 92 // 80px case + 12px gap
      const visibleCases = Math.floor(containerWidth / caseWidth)
      
      // Only show navigation if we have more cases than can fit
      setNeedsScrolling(battle.rounds.length > visibleCases)
    }
  })

  // Auto-scroll similar to battle.jsx - show active case in second position
  const [scrollTransform, setScrollTransform] = createSignal(0)
  const [isManualScrolling, setIsManualScrolling] = createSignal(false)
  let lastProcessedRound = 0
  
  createEffect(() => {
    const currentRoundNum = currentRound()
    const battleState = state()
    
    // Only auto-scroll if user hasn't manually scrolled and we have a new round
    if (!isManualScrolling() && battleState === 'rolling' && currentRoundNum > 0 && currentRoundNum !== lastProcessedRound) {
      lastProcessedRound = currentRoundNum
      
      // Smart scrolling: only scroll when necessary
      const caseWidth = 92 // 80px case + 12px gap
      const totalRounds = roundsWithState().length
      const containerWidth = casesScrollRef?.clientWidth || 400
      const visibleCases = Math.floor(containerWidth / caseWidth)
      
      let transform = 0
      
      if (totalRounds <= visibleCases) {
        // All cases fit in container, no need to scroll at all
        transform = 0
      } else {
        // Check if current round is visible without scrolling
        const currentRoundIndex = currentRoundNum - 1 // Convert to 0-based
        const currentTransform = scrollTransform()
        const firstVisibleIndex = Math.floor(currentTransform / caseWidth)
        const lastVisibleIndex = firstVisibleIndex + visibleCases - 1
        
        if (currentRoundIndex >= firstVisibleIndex && currentRoundIndex <= lastVisibleIndex) {
          // Current round is already visible, no need to scroll
          transform = currentTransform
        } else if (currentRoundIndex < firstVisibleIndex) {
          // Current round is to the left, scroll to show it in second position
          transform = Math.max(0, (currentRoundNum - 2) * caseWidth)
        } else {
          // Current round is to the right, scroll to show it
          const maxTransform = (totalRounds - visibleCases) * caseWidth
          const normalTransform = Math.max(0, (currentRoundNum - 2) * caseWidth)
          transform = Math.min(normalTransform, maxTransform)
        }
      }
      
      setScrollTransform(transform)
    }
  })



  function getType() {
    if (props?.battle?.gamemode === 'group') return 'Group'
    if (props?.battle?.playersPerTeam === 2 && props?.battle?.teams === 2) return '2v2'
    if (props?.battle?.playersPerTeam === 1 && props?.battle?.teams === 4) return '1v1v1v1'
    if (props?.battle?.playersPerTeam === 1 && props?.battle?.teams === 3) return '1v1v1'
    if (props?.battle?.playersPerTeam === 1 && props?.battle?.teams === 2) return '1v1'
    return Array(props?.battle?.teams).map(e => props?.battle?.playersPerTeam).join('v')
  }

  function getColor(team) {
    if (props?.battle?.gamemode !== 'group' && props?.battle?.playersPerTeam === 2) return team === 0 ? 'blueteam' : 'yellowteam'
    return 'purple'
  }

  function getCase(id) {
    return props?.battle?.cases?.find(c => id === c.id)
  }

  function getFirstAvailableSlot() {
    return props?.battle?.players?.findIndex(u => u === null) + 1
  }

  function hasLost(index) {
    return (index + 1) !== props?.battle?.winnerTeam && state() === 'finished'
  }

  function scrollCasesLeft() {
    setIsManualScrolling(true) // Disable auto-scroll when user manually scrolls
    const currentTransform = scrollTransform()
    const newTransform = Math.max(0, currentTransform - 92) // Move left by one case
    setScrollTransform(newTransform)
    
    // Re-enable auto-scroll after a delay
    setTimeout(() => setIsManualScrolling(false), 3000)
  }

  function scrollCasesRight() {
    setIsManualScrolling(true) // Disable auto-scroll when user manually scrolls
    const currentTransform = scrollTransform()
    const battle = props?.battle
    if (!battle?.rounds) return
    
    const totalRounds = battle.rounds.length
    const containerWidth = casesScrollRef?.clientWidth || 400
    const caseWidth = 92
    const visibleCases = Math.floor(containerWidth / caseWidth)
    
    // Calculate max transform using the same logic as auto-scroll
    const maxTransform = Math.max(0, (totalRounds - visibleCases) * caseWidth)
    const newTransform = Math.min(maxTransform, currentTransform + 92) // Move right by one case
    setScrollTransform(newTransform)
    
    // Re-enable auto-scroll after a delay
    setTimeout(() => setIsManualScrolling(false), 3000)
  }

  return (
    <>
      {props?.battle && (
        <div class={`battle-card ${state() === 'finished' ? 'ended' : ''}`}>
          {props?.battle?.ownerFunding > 0 && (
            <div class='funding-badge'>
              -{props?.battle?.ownerFunding}%
            </div>
          )}

          {/* Left Section - Battle Info & Teams */}
          <div class='battle-left-section'>
            <div class='battle-mode-info'>
              <div class='mode-header'>
                <div class='mode-icon'>
                  {props?.battle?.gamemode === 'group' && (
                    <img src='/assets/icons/group.svg' height='18' alt=''/>
                  )}
                  {props?.battle?.gamemode === 'crazy' && (
                    <img src='/assets/icons/crazy.svg' height='18' alt=''/>
                  )}
                </div>
                <span class='mode-text'>{props?.battle?.gamemode === 'group' ? 'Group' : props?.battle?.gamemode === 'crazy' ? 'Crazy' : props?.battle?.gamemode === 'standard' ? 'Standard' : props?.battle?.gamemode}</span>
              </div>
              
              <div class='mode-divider'></div>
              
              <div class='rounds-info'>
                <div class='fast-mode-icon'>
                  <svg width="8" height="8" viewBox="0 0 14 14" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.167 1.167A.583.583 0 0 0 7.079.873l-4.08 7a.583.583 0 0 0 .505.877h2.33v4.083a.583.583 0 0 0 1.087.294l4.08-7a.584.584 0 0 0-.505-.877h-2.33z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class='rounds-text'>{props?.battle?.rounds?.length} Rounds</span>
              </div>
            </div>

            <div class='teams-section'>
              <For each={new Array(props?.battle?.teams)}>{(t, teamIndex) => (
                <div class='team-group'>
                  <For each={new Array(props?.battle?.playersPerTeam)}>{(p, playerIndex) => {
                    let player = props?.battle?.players[playerIndex() + (teamIndex() * props?.battle?.playersPerTeam)]
                    return (
                      <div class='player-avatar'>
                        <Avatar height={38} xp={getColor(teamIndex())}
                                id={player?.id || '?'} avatar={player?.avatar}/>
                      </div>
                    )
                  }}</For>
                  {teamIndex() < props?.battle?.teams - 1 && (
                    <div class='vs-icon'>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <g clip-path="url(#icon-versus_svg__a)">
                          <path fill-rule="evenodd" d="M9.163 8.944a1.36 1.36 0 0 1-.144-.654H7.332q-.01.708.267 1.221.277.515.743.846.477.332 1.087.482.622.16 1.276.161.81 0 1.42-.182.621-.183 1.032-.503A2.15 2.15 0 0 0 14 8.558q0-.642-.288-1.05a2.2 2.2 0 0 0-.666-.663 2.9 2.9 0 0 0-.788-.354 7 7 0 0 0-.61-.16l-1.21-.3a5 5 0 0 1-.72-.236q-.255-.117-.344-.257a.67.67 0 0 1-.089-.364.7.7 0 0 1 .111-.407 1 1 0 0 1 .277-.268q.178-.106.389-.15.21-.042.421-.042.322 0 .588.053.278.053.488.182t.333.354q.133.225.155.567h1.687q0-.663-.267-1.124a2.16 2.16 0 0 0-.698-.771 3 3 0 0 0-1.021-.429A5 5 0 0 0 10.56 3q-.533 0-1.065.14a3 3 0 0 0-.954.428q-.421.288-.688.728-.255.428-.255 1.017 0 .525.2.9.21.364.543.61.333.247.754.407.422.15.866.257.432.118.854.214.421.098.754.225.333.129.533.322a.65.65 0 0 1 .21.503.74.74 0 0 1-.155.482 1.1 1.1 0 0 1-.388.29 2 2 0 0 1-.5.149 4 4 0 0 1-.498.032q-.345 0-.666-.075a1.9 1.9 0 0 1-.566-.246 1.3 1.3 0 0 1-.377-.44m-6.6 1.885h1.963l2.63-7.647H5.358L3.572 8.558H3.55L1.786 3.182H0z" clip-rule="evenodd"/>
                        </g>
                        <defs>
                          <clipPath id="icon-versus_svg__a">
                            <path fill="#fff" d="M0 0h14v14H0z"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  )}
                </div>
              )}</For>
            </div>
          </div>

          {/* Center Section - Cases */}
          <div class='battle-center-section'>
            <div class='cases-container' 
                 onMouseEnter={() => setIsHoveringCases(true)}
                 onMouseLeave={() => setIsHoveringCases(false)}>
              <div class='gradient-left'></div>
              <div class='gradient-right'></div>
              
              {/* Navigation Buttons */}
              <div class={`nav-buttons ${isHoveringCases() && needsScrolling() ? 'visible' : ''}`}>
                <button class='nav-btn nav-btn-left' onClick={scrollCasesLeft}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button class='nav-btn nav-btn-right' onClick={scrollCasesRight}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
              
              <div class='cases-scroll' ref={casesScrollRef}>
                <div class='cases-track' style={`transform: translateX(-${scrollTransform()}px); transition: transform 0.3s ease;`}>
                  <For each={roundsWithState()}>{(round, index) => (
                    <div class={`case-item ${round.isCurrentRound ? 'current-round' : ''} ${round.isOpenedRound ? 'opened-round' : ''}`}>
                      <img src={getCase(round.caseId)?.img} alt=''/>
                    </div>
                  )}</For>
                </div>
              </div>
              
              <div class='round-counter'>
                <span>{state() === 'finished' ? roundsWithState().length : Math.max(0, currentRound())}</span>
                <span>/</span>
                <span>{roundsWithState().length}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Cost & Status */}
          <div class='battle-info-section'>
            <div class='battle-cost'>
              <div class='cost-label'>Entry Cost</div>
              <div class='cost-amount'>
                
                <span>$ {Math.floor(props?.battle?.entryPrice) || '0'}</span>
                <span class='cost-decimal'>.{getCents(props?.battle?.entryPrice)}</span>
              </div>
            </div>
            
            <div class='battle-status'>
              <div class='status-indicator'>
                {state() === 'rolling' && (
                  <span style="font-size: 12px; color: #FFFFFF;">In Progress...</span>
                )}
                {state() === 'waiting' && (
                  <span style="font-size: 12px; color: #FFFFFF;">Waiting for players...</span>
                )}
                {state() === 'finished' && (
                  <span style="font-size: 12px; color: #FFFFFF;">Finished</span>
                )}
              </div>
            </div>
          </div>

          {/* Far Right Section - Action Only */}
          <div class='battle-action-section'>
            {state() === 'waiting' && !props?.hasJoined ? (
              <button class='action-btn join-btn' onClick={async () => {
                let res = await authedAPI(`/battles/${props?.battle?.id}/join`, 'POST', JSON.stringify({
                  slot: getFirstAvailableSlot(),
                  privKey: props?.battle?.privKey
                }), true)

                if (res.success) {
                  let link = `/battle/${props?.battle?.id}`
                  if (props?.battle?.privKey) {
                    link += `?pk=${props?.battle?.privKey}`
                  }

                  props?.ws?.emit('battles:subscribe', props?.battle?.id, props?.battle?.privKey)
                  navigate(link)
                }
              }}>
                Join Battle
              </button>
            ) : state() === 'finished' && props?.hasJoined ? (
              <button class='action-btn your-battle-btn' title="This is your battle">
                <A href={`/battle/${props.battle.id}${props?.battle?.privKey ? `?pk=${props?.battle?.privKey}` : ''}`}
                   class='gamemode-link'></A>
               
                   See Results
                
              </button>
            ) : (
              <button class='action-btn spectate-btn'>
                <A href={`/battle/${props.battle.id}${props?.battle?.privKey ? `?pk=${props?.battle?.privKey}` : ''}`}
                   class='gamemode-link'></A>
                Spectate
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .battle-card {
          width: 100%;
          height: 130px;
          background: rgba(24, 20, 52, 0.8);
          border: 1px solid rgba(139, 120, 221, 0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 24px;
          cursor: pointer;
        }

        .battle-card:hover {
          border-color: rgba(139, 120, 221, 0.4);
          background: rgba(24, 20, 52, 0.9);
        }

        .battle-card.ended {
          opacity: 0.2;
        }

        .battle-card.ended:hover {
          opacity: 1;
        }

        .funding-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 2px 6px;
          background: linear-gradient(135deg, #64FF7D, #01FFDC);
          color: #0E0B27;
          font-size: 9px;
          font-weight: 700;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          z-index: 2;
        }

        .battle-left-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        .battle-mode-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-width: 200px;
        }

        .mode-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mode-icon {
          width: 18px;
          height: 18px;
          color: #F59E0B;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mode-icon img {
          width: 18px;
          height: 18px;
        }

        .mode-text {
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
        }

        .mode-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.1);
        }

        .rounds-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fast-mode-icon {
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 3px;
          color: #3B82F6;
          flex-shrink: 0;
        }

        .rounds-text {
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
        }

        .teams-section {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .team-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .player-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
        }

        .vs-icon {
          width: 14px;
          height: 14px;
          color: #ADA3EF;
          margin: 0 8px;
        }

        .battle-center-section {
          z-index: 10;
          width: 75%;
          cursor: default;
          overflow: hidden;
        }

        .cases-container {
          position: relative;
          height: 96px;
          width: 100%;
          overflow: hidden;
          border-radius: 8px;
          background: rgba(14, 11, 39, 0.8);
          padding: 8px;
        }

        .gradient-left {
          position: absolute;
          left: 0;
          z-index: 30;
          height: 100%;
          width: 25px;
          border-radius: 8px;
          background: linear-gradient(to right, rgba(14, 11, 39, 0.8), transparent);
        }

        .gradient-right {
          position: absolute;
          right: 0;
          z-index: 30;
          height: 100%;
          width: 30px;
          border-radius: 8px;
          background: linear-gradient(to left, rgba(14, 11, 39, 0.8), transparent);
        }

        .cases-scroll {
          z-index: 10;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .cases-track {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .case-item {
          position: relative;
          flex-shrink: 0;
          cursor: pointer;
        }

        .case-item img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          transition: all 0.5s ease;
          pointer-events: none;
          user-select: none;
        }

        .case-item.opened-round {
          opacity: 0.3;
        }

        .case-item {
          transition: opacity 0.3s ease;
        }

                .case-item.current-round {
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 30%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.02) 70%, transparent 100%);
          border-radius: 10px;
          padding: 4px;
        }

        .round-counter {
          position: absolute;
          right: 12px;
          top: 12px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 23px;
          padding: 0 12px 0 12px;
          background: rgba(24, 20, 52, 0.9);
          border-radius: 4px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
        }

        .battle-info-section {
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 120px;
          flex-shrink: 0;
        }

        .battle-action-section {
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          flex-shrink: 0;
        }

        .battle-cost {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .cost-label {
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 500;
        }

        .cost-amount {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .cost-amount img {
          width: 14px;
          height: 14px;
        }

        .cost-amount span {
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
        }

                 .cost-decimal {
           color: rgba(255, 255, 255, 0.7);
         }

        .battle-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .status-label {
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 500;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .live {
          background: linear-gradient(135deg, #F59E0B, #EAB308);
          color: #FFFFFF;
        }

        .waiting {
          background: rgba(139, 120, 221, 0.3);
          color: #FFFFFF;
          border: 1px solid rgba(139, 120, 221, 0.4);
        }

        .ended {
          background: rgba(139, 120, 221, 0.3);
          color: #FFFFFF;
          border: 1px solid rgba(139, 120, 221, 0.4);
        }

        .action-btn {
          width: 100%;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .join-btn {
          background: linear-gradient(135deg,#8b78dd,#7c6bbf);
          color: #FFFFFF;
        }

        .join-btn:hover {
          opacity: 0.9;
        }

        .your-battle-btn {
          background: rgba(139, 120, 221, 0.2);
          color: #FFFFFF;
          border: 1px solid rgba(139, 120, 221, 0.3);
        }

        .your-battle-btn:hover {
          background: rgba(139, 120, 221, 0.3);
        }

        .spectate-btn {
          background: rgba(139, 120, 221, 0.2);
          color: #FFFFFF;
          border: 1px solid rgba(139, 120, 221, 0.3);
        }

        .spectate-btn:hover {
          background: rgba(139, 120, 221, 0.3);
        }

        .gamemode-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }



        .spectate-with-check {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        @media (max-width: 1200px) {
          .battle-card {
            gap: 16px;
          }

          .battle-left-section {
            width: 200px;
            min-width: 200px;
          }

          .battle-center-section {
            width: 65%;
          }

          .battle-info-section {
            width: 120px;
            min-width: 120px;
          }

          .battle-action-section {
            width: 100px;
            min-width: 100px;
          }
        }

        @media (max-width: 1024px) {
          .battle-card {
            height: auto;
            flex-direction: column;
            padding: 18px;
            gap: 16px;
            align-items: stretch;
          }

          .battle-left-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            min-width: auto;
          }

          .battle-mode-info {
            width: 100%;
            min-width: auto;
          }

          .teams-section {
            justify-content: flex-start;
            width: 100%;
            min-width: auto;
            flex-wrap: wrap;
          }

          .battle-center-section {
            height: 60px;
            width: 100%;
            min-width: auto;
          }

          .battle-info-section {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            min-width: auto;
          }

          .battle-action-section {
            width: 100%;
            min-width: auto;
            margin-top: 8px;
          }
        }

        @media (max-width: 768px) {
          .battle-card {
            padding: 12px;
            gap: 12px;
          }

          .teams-section {
            gap: 4px;
          }

          .team-group {
            gap: 2px;
          }

          .cases-container {
            gap: 4px;
            padding: 4px 8px;
          }

          .case-item {
            width: 50px;
            height: 50px;
            min-width: 50px;
            min-height: 50px;
          }

          .battle-info-section {
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }

          .battle-action-section {
            width: 100%;
            margin-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .battle-card {
            padding: 10px;
            gap: 10px;
          }

          .battle-left-section {
            font-size: 10px;
            padding: 3px 6px;
          }

          .cases-container {
            padding: 3px 6px;
          }

          .case-item {
            width: 45px;
            height: 45px;
            min-width: 45px;
            min-height: 45px;
          }

          .join-btn,
          .spectate-btn {
            font-size: 10px;
            padding: 6px 12px;
          }

          .battle-center-section {
            height: 50px;
          }
        }

        .nav-buttons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .nav-buttons.visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .nav-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 5px;
          background: rgba(24, 20, 52, 0.95);
          border: 1px solid rgba(139, 120, 221, 0.3);
          color: #FFFFFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .nav-btn:hover {
          background: rgba(139, 120, 221, 0.4);
          border-color: rgba(139, 120, 221, 0.6);
        }

        .nav-btn:active {
          background: rgba(139, 120, 221, 0.5);
        }

        .nav-btn-left {
          margin-left: 12px;
        }

        .nav-btn-right {
          margin-right: 12px;
        }

        /* Responsive nav-buttons */
        @media (max-width: 1200px) {
          .nav-btn-left {
            margin-left: 10px;
          }

          .nav-btn-right {
            margin-right: 10px;
          }
        }

        @media (max-width: 1024px) {
          .nav-btn-left {
            margin-left: 8px;
          }

          .nav-btn-right {
            margin-right: 8px;
          }
        }

        @media (max-width: 768px) {
          .nav-btn {
            width: 24px;
            height: 24px;
          }

          .nav-btn-left {
            margin-left: 6px;
          }

          .nav-btn-right {
            margin-right: 6px;
          }
        }

        @media (max-width: 480px) {
          .nav-btn {
            width: 20px;
            height: 20px;
          }

          .nav-btn svg {
            width: 10px;
            height: 10px;
          }

          .nav-btn-left {
            margin-left: 4px;
          }

          .nav-btn-right {
            margin-right: 4px;
          }
        }
      `}</style>
    </>
  );
}

export default BattlePreview;
