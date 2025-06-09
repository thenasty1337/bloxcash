import {A, useSearchParams, useNavigate} from "@solidjs/router";
import {createResource, createSignal, For, Show} from "solid-js";
import {authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import NumberPrefix from "../Transactions/prefix";
import Pagination from "../Pagination/pagination";
import { TbHistory, TbDice, TbShield, TbCalendar, TbCoins, TbTrendingUp, TbCheck } from 'solid-icons/tb';

const gameToImage = {
  'case': '/assets/game-icons/packs.svg',
  'battle': '/assets/game-icons/battles.svg',
  'roulette': '/assets/game-icons/roulette.svg',
  'crash': '/assets/game-icons/dices.svg',
  'coinflip': '/assets/game-icons/coin-flip.svg',
  'jackpot': '/assets/game-icons/jackpot.svg',
  'slot': '/assets/game-icons/slots.svg',
  'mines': '/assets/game-icons/mines.svg'
}

function History(props) {

  let loadedPages = new Set()
  const [total, setTotal] = createSignal(1)
  const [page, setPage] = createSignal(1)
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const [bets, setBets] = createSignal([], {equals: false})
  const [historyData, {mutate: mutateHistory}] = createResource(() => searchParams.filter || '', fetchHistory)
  const [isLoading, setIsLoading] = createSignal(true)

  async function fetchHistory() {
    try {
      setPage(+searchParams?.page || 1)
      let historyRes = await authedAPI(`/user/bets?page=${page()}${queryParams()}`, 'GET', null)

      setIsLoading(false)
      setTotal(historyRes?.pages)
      addPage(historyRes?.data)
      return mutateHistory(historyRes)
    } catch (e) {
      console.log(e)
      setIsLoading(false)
      return mutateHistory(null)
    }
  }

  function isActive(filter) {
    if (filter === '') return !searchParams?.filter || searchParams?.filter === filter

    return searchParams?.filter === filter
  }

  function queryParams() {
    let params = ''

    switch (searchParams?.filter || '') {
      case 'cases':
        params += `&games=case`
        break
      case 'battles':
        params += `&games=battle`
        break
      default:
        if (!searchParams?.filter) return params
        params += `&games=${searchParams?.filter}`
        break
    }

    return params
  }

  function addPage(data) {
    return setBets(bets => {
      bets[page()] = data
      return bets
    })
  }

  async function loadPage() {
    if (isLoading()) return
    setIsLoading(true)
    setSearchParams({page: page()})

    let moreData = await authedAPI(`/user/bets?page=${page()}${queryParams()}`, 'GET', null)
    if (!moreData) return setIsLoading(false)

    addPage(moreData.data)
    setTotal(moreData.pages)
    loadedPages.add(page())

    setIsLoading(false)
  }

  function getGameIcon(game) {
    return gameToImage[game?.toLowerCase()] || gameToImage['slot'];
  }

  function getGameName(bet) {
    if (bet?.gameDetails?.name) {
      return bet.gameDetails.name;
    }
    
    switch(bet?.game?.toLowerCase()) {
      case 'battle':
        return 'Battle Packs';
      case 'case':
        return 'Packs';
      case 'coinflip':
        return 'Coinflip';
      case 'jackpot':
        return 'Jackpot';
      case 'roulette':
        return 'Roulette';
      case 'crash':
        return 'Crash';
      case 'mines':
        return 'Mines';
      case 'slot':
        return 'Slots';
      default:
        return bet?.game?.charAt(0).toUpperCase() + bet?.game?.slice(1) || 'Unknown';
    }
  }

  function handleBetClick(bet) {
    // Handle slot bets with gameDetails
    if (bet.game === 'slot' && bet.gameDetails?.gameId) {
      navigate(`/slots/${bet.gameDetails.gameId}`)
    }
    // Handle house games
    else if (['coinflip', 'mines', 'roulette', 'crash', 'jackpot'].includes(bet.game)) {
      navigate(`/${bet.game}`)
    }
    // Handle battles
    else if (bet.game === 'battle') {
      navigate('/battles')
    }
    // Handle cases
    else if (bet.game === 'case') {
      navigate('/cases')
    }
  }

  return (
    <>
      <div class='history-container'>
        {/* Header */}
        <div class="history-header">
          <div class="header-icon">
            <TbHistory size={18}/>
          </div>
          <div class="header-content">
            <h1 class="history-title">Bet History</h1>
            <p class="history-subtitle">Track your gaming activity and results</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div class="filter-tabs">
          <button 
            class={`filter-tab ${isActive('') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: '', page: 1})}
          >
            All Games
          </button>
          <button 
            class={`filter-tab ${isActive('cases') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'cases', page: 1})}
          >
            Cases
          </button>
          <button 
            class={`filter-tab ${isActive('battles') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'battles', page: 1})}
          >
            Case Battles
          </button>
          <button 
            class={`filter-tab ${isActive('coinflip') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'coinflip', page: 1})}
          >
            Coinflip
          </button>
          <button 
            class={`filter-tab ${isActive('jackpot') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'jackpot', page: 1})}
          >
            Jackpot
          </button>
          <button 
            class={`filter-tab ${isActive('roulette') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'roulette', page: 1})}
          >
            Roulette
          </button>
          <button 
            class={`filter-tab ${isActive('crash') ? 'active' : ''}`}
            onClick={() => setSearchParams({filter: 'crash', page: 1})}
          >
            Crash
          </button>
        </div>

        {/* Content */}
        <div class="history-content">
          <Show when={!historyData.loading && !isLoading() && bets()[page()]} fallback={
            <div class="skeleton-container">
              {/* Desktop Table Header Skeleton */}
              <div class="skeleton-header desktop-only">
                <div class="skeleton-header-cell"></div>
                <div class="skeleton-header-cell"></div>
                <div class="skeleton-header-cell"></div>
                <div class="skeleton-header-cell"></div>
                <div class="skeleton-header-cell"></div>
              </div>

              {/* Skeleton Cards */}
              <div class="skeleton-list">
                {Array.from({length: 8}).map((_, index) => (
                  <div class="skeleton-card">
                    {/* Mobile Skeleton Header */}
                    <div class="skeleton-bet-header mobile-only">
                      <div class="skeleton-game-info">
                        <div class="skeleton-emoji"></div>
                        <div class="skeleton-game-name"></div>
                      </div>
                      <div class="skeleton-date"></div>
                    </div>

                    {/* Desktop Skeleton Row */}
                    <div class="skeleton-row desktop-only">
                      <div class="skeleton-cell game">
                        <div class="skeleton-emoji"></div>
                        <div class="skeleton-game-name"></div>
                      </div>
                      <div class="skeleton-cell verify">
                        <div class="skeleton-verify-btn"></div>
                      </div>
                      <div class="skeleton-cell date">
                        <div class="skeleton-date-text"></div>
                      </div>
                      <div class="skeleton-cell wager">
                        <div class="skeleton-amount"></div>
                      </div>
                      <div class="skeleton-cell profit">
                        <div class="skeleton-amount"></div>
                      </div>
                    </div>

                    {/* Mobile Skeleton Details */}
                    <div class="skeleton-details mobile-only">
                      <div class="skeleton-detail-row">
                        <div class="skeleton-label"></div>
                        <div class="skeleton-amount-small"></div>
                      </div>
                      <div class="skeleton-detail-row">
                        <div class="skeleton-label"></div>
                        <div class="skeleton-amount-small"></div>
                      </div>
                      <div class="skeleton-detail-row">
                        <div class="skeleton-verify-btn-mobile"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skeleton Pagination */}
              <div class="skeleton-pagination">
                <div class="skeleton-btn"></div>
                <div class="skeleton-page-info"></div>
                <div class="skeleton-btn"></div>
              </div>
            </div>
          }>
            <Show when={bets()[page()]?.length > 0} fallback={
              <div class="empty-state">
                <div class="empty-icon">
                  <TbDice size={48}/>
                </div>
                <h3>No bets found</h3>
                <p>You haven't placed any bets yet. Start playing to see your history here!</p>
              </div>
            }>
              {/* Desktop Table Header */}
              <div class="table-header desktop-only">
                <div class="header-cell game">
                  <TbDice size={16}/>
                  <span>Game</span>
                </div>
                <div class="header-cell verify">
                  <TbShield size={16}/>
                  <span>Verify</span>
                </div>
                <div class="header-cell date">
                  <TbCalendar size={16}/>
                  <span>Date</span>
                </div>
                <div class="header-cell amount">
                  <TbCoins size={16}/>
                  <span>Amount</span>
                </div>
                <div class="header-cell multiplier">
                  <TbTrendingUp size={16}/>
                  <span>Multiplier</span>
                </div>
                <div class="header-cell payout">
                  <TbCoins size={16}/>
                  <span>Payout</span>
                </div>
              </div>

              {/* Bet Cards */}
              <div class="bets-list">
                <For each={bets()[page()]}>{(bet, index) => (
                  <div class="bet-card">
                    {/* Mobile Game Header */}
                    <div class="bet-header mobile-only">
                      <div 
                        class={'game-info' + (
                          (bet.game === 'slot' && bet.gameDetails?.gameId) || 
                          ['coinflip', 'mines', 'roulette', 'crash', 'jackpot', 'battle', 'case'].includes(bet.game) 
                          ? ' clickable-game' : ''
                        )}
                        onClick={() => handleBetClick(bet)}
                      >
                        <div class="game-icon-wrapper">
                          <img src={bet?.gameDetails?.image || getGameIcon(bet?.game)} alt="" class="game-icon" />
                        </div>
                        <span class="game-name">{getGameName(bet)}</span>
                      </div>
                      <div class="bet-date">
                        {new Date(bet?.createdAt || 0)?.toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Desktop Row */}
                    <div class="bet-row desktop-only">
                      <div class="bet-cell game">
                        <div 
                          class={'game-info' + (
                            (bet.game === 'slot' && bet.gameDetails?.gameId) || 
                            ['coinflip', 'mines', 'roulette', 'crash', 'jackpot', 'battle', 'case'].includes(bet.game) 
                            ? ' clickable-game' : ''
                          )}
                          onClick={() => handleBetClick(bet)}
                        >
                          <div class="game-icon-wrapper">
                            <img src={bet?.gameDetails?.image || getGameIcon(bet?.game)} alt="" class="game-icon" />
                          </div>
                          <span class="game-name">{getGameName(bet)}</span>
                        </div>
                      </div>

                      <div class="bet-cell verify">
                        {bet?.game !== 'slot' ? (
                          <button class="verify-button">
                            <TbCheck size={14}/>
                            <span>Verify</span>
                            <A href='/docs/provably' class='verify-link'></A>
                          </button>
                        ) : (
                          <span class="no-verify">N/A</span>
                        )}
                      </div>

                      <div class="bet-cell date">
                        <span class="date-text">
                          {new Date(bet?.createdAt || 0)?.toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div class="bet-cell amount">
                        <div class={`amount-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                          <span class="amount-value">
                            ${bet?.amount?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>

                      <div class="bet-cell multiplier">
                        <div class={`multiplier-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <span class="multiplier-value">
                            {bet?.amount > 0 ? `${(bet?.winnings / bet?.amount)?.toFixed(2)}x` : '0.00x'}
                          </span>
                        </div>
                      </div>

                      <div class="bet-cell payout">
                        <div class={`payout-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                          <span class="payout-value">
                            ${bet?.winnings?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Details */}
                    <div class="bet-details mobile-only">
                      <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <div class={`amount-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                          <span class="amount-value">
                            ${bet?.amount?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Multiplier:</span>
                        <div class={`multiplier-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <span class="multiplier-value">
                            {bet?.amount > 0 ? `${(bet?.winnings / bet?.amount)?.toFixed(2)}x` : '0.00x'}
                          </span>
                        </div>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Payout:</span>
                        <div class={`payout-display ${bet?.winnings > bet?.amount ? 'winning' : ''}`}>
                          <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                          <span class="payout-value">
                            ${bet?.winnings?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                      {bet?.game !== 'slot' && (
                        <div class="detail-row">
                          <button class="verify-button mobile">
                            <TbCheck size={14}/>
                            <span>Verify Bet</span>
                            <A href='/docs/provably' class='verify-link'></A>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}</For>
              </div>

              <Pagination 
                isLoading={isLoading()} 
                loadedPages={loadedPages} 
                loadPage={loadPage} 
                page={page()}
                total={total()} 
                setPage={setPage} 
                setParams={setSearchParams}
              />
            </Show>
          </Show>
        </div>
      </div>

      <style>{`
        .history-container {
          padding: 1.5rem;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Header */
        .history-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 1rem 1.25rem;
          background: rgba(139, 120, 221, 0.04);
          border: 1px solid rgba(139, 120, 221, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .header-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.15), rgba(124, 107, 191, 0.1));
          border: 1px solid rgba(139, 120, 221, 0.25);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b78dd;
          flex-shrink: 0;
        }

        .header-content {
          flex: 1;
        }

        .history-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.01em;
        }

        .history-subtitle {
          font-size: 0.85rem;
          color: #8aa3b8;
          margin: 0;
          font-weight: 400;
          line-height: 1.4;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(24, 20, 52, 0.6);
          border: 1px solid rgba(139, 120, 221, 0.12);
          border-radius: 12px;
          backdrop-filter: blur(15px);
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #8aa3b8;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .filter-tab:hover {
          background: rgba(139, 120, 221, 0.1);
          border-color: rgba(139, 120, 221, 0.2);
          color: #ffffff;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #8b78dd, #7c6bbf);
          border-color: #8b78dd;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(139, 120, 221, 0.25);
        }

        /* Content */
        .history-content {
          background: rgba(24, 20, 52, 0.6);
          border: 1px solid rgba(139, 120, 221, 0.12);
          border-radius: 14px;
          overflow: hidden;
          backdrop-filter: blur(15px);
        }

        /* Skeleton Loader Styles */
        .skeleton-container {
          padding: 0;
        }

        .skeleton-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.06), rgba(124, 107, 191, 0.03));
          border-bottom: 1px solid rgba(139, 120, 221, 0.1);
          gap: 1rem;
        }

        .skeleton-header-cell {
          height: 12px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-header-cell:nth-child(1) { flex: 2; }
        .skeleton-header-cell:nth-child(2) { flex: 1.5; }
        .skeleton-header-cell:nth-child(3) { flex: 2; }
        .skeleton-header-cell:nth-child(4) { flex: 1.5; }
        .skeleton-header-cell:nth-child(5) { flex: 1.5; }

        .skeleton-list {
          padding: 0;
        }

        .skeleton-card {
          border-bottom: 1px solid rgba(139, 120, 221, 0.08);
          animation: skeleton-fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .skeleton-card:nth-child(1) { animation-delay: 0.1s; }
        .skeleton-card:nth-child(2) { animation-delay: 0.2s; }
        .skeleton-card:nth-child(3) { animation-delay: 0.3s; }
        .skeleton-card:nth-child(4) { animation-delay: 0.4s; }
        .skeleton-card:nth-child(5) { animation-delay: 0.5s; }
        .skeleton-card:nth-child(6) { animation-delay: 0.6s; }
        .skeleton-card:nth-child(7) { animation-delay: 0.7s; }
        .skeleton-card:nth-child(8) { animation-delay: 0.8s; }

        .skeleton-card:last-child {
          border-bottom: none;
        }

        /* Desktop Skeleton Row */
        .skeleton-row {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          min-height: 60px;
        }

        .skeleton-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .skeleton-cell.game { flex: 2; }
        .skeleton-cell.verify { flex: 1.5; }
        .skeleton-cell.date { flex: 2; }
        .skeleton-cell.wager { flex: 1.5; justify-content: flex-end; }
        .skeleton-cell.profit { flex: 1.5; justify-content: flex-end; }

        .skeleton-emoji {
          width: 20px;
          height: 20px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-game-name {
          width: 80px;
          height: 14px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 7px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-verify-btn {
          width: 70px;
          height: 28px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-date-text {
          width: 120px;
          height: 14px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 7px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-amount {
          width: 90px;
          height: 14px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 7px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        /* Mobile Skeleton Styles */
        .skeleton-bet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1rem 0.5rem;
        }

        .skeleton-game-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .skeleton-date {
          width: 80px;
          height: 12px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-details {
          padding: 0.5rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skeleton-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .skeleton-detail-row:last-child {
          justify-content: flex-start;
        }

        .skeleton-label {
          width: 60px;
          height: 12px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-amount-small {
          width: 80px;
          height: 12px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-verify-btn-mobile {
          width: 90px;
          height: 32px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        /* Skeleton Pagination */
        .skeleton-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.04), rgba(124, 107, 191, 0.02));
          border-top: 1px solid rgba(139, 120, 221, 0.08);
        }

        .skeleton-btn {
          width: 80px;
          height: 36px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-page-info {
          width: 60px;
          height: 16px;
          background: rgba(139, 120, 221, 0.1);
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        /* Skeleton Animations */
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes skeleton-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(139, 120, 221, 0.1);
          border: 1px solid rgba(139, 120, 221, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b78dd;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          font-size: 0.9rem;
          color: #8aa3b8;
          margin: 0;
          max-width: 400px;
          line-height: 1.4;
        }

        /* Table Header */
        .table-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.06), rgba(124, 107, 191, 0.03));
          border-bottom: 1px solid rgba(139, 120, 221, 0.1);
          font-size: 0.8rem;
          font-weight: 600;
          color: #8aa3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .header-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-cell.game { flex: 2; }
        .header-cell.verify { flex: 1.5; }
        .header-cell.date { flex: 2; }
        .header-cell.amount { flex: 1.25; }
        .header-cell.multiplier { flex: 1.25; }
        .header-cell.payout { flex: 1.5; }

        /* Bet Cards */
        .bets-list {
          padding: 0;
        }

        .bet-card {
          border-bottom: 1px solid rgba(139, 120, 221, 0.08);
          transition: all 0.2s ease;
          position: relative;
        }

        .bet-card:last-child {
          border-bottom: none;
        }

        .bet-card:hover {
          background: rgba(139, 120, 221, 0.04);
        }

        .bet-card:hover::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #8b78dd, #7c6bbf);
          opacity: 1;
        }

        .bet-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #8b78dd, #7c6bbf);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        /* Desktop Row */
        .bet-row {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          min-height: 60px;
        }

        .bet-cell {
          display: flex;
          align-items: center;
        }

        .bet-cell.game { flex: 2; }
        .bet-cell.verify { flex: 1.5; }
        .bet-cell.date { flex: 2; }
        .bet-cell.amount { flex: 1.25; }
        .bet-cell.multiplier { flex: 1.25; }
        .bet-cell.payout { flex: 1.5; }

        /* Game Info */
        .game-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .game-icon-wrapper {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.08), rgba(124, 107, 191, 0.08));
          border: 1px solid rgba(139, 120, 221, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .game-icon {
          width: 16px;
          height: 16px;
          opacity: 0.9;
          object-fit: cover;
          border-radius: 2px;
        }

        .game-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #8b78dd;
          text-transform: capitalize;
        }

        /* Verify Button */
        .verify-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.75rem;
          background: linear-gradient(135deg, #8b78dd, #7c6bbf);
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          position: relative;
        }

        .verify-button:hover {
          background: linear-gradient(135deg, #7c6bbf, #6b5ba6);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(139, 120, 221, 0.3);
        }

        .verify-button.mobile {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        .verify-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .no-verify {
          font-size: 0.8rem;
          color: #8aa3b8;
          font-style: italic;
        }

        /* Date */
        .date-text {
          font-size: 0.85rem;
          color: #8aa3b8;
          font-weight: 500;
        }

        /* Amount Displays */
        .amount-display, .multiplier-display, .payout-display {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .amount-value, .multiplier-value, .payout-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .multiplier-value {
          color: #8b78dd;
          font-weight: 700;
          min-width: 45px;
        }

        .payout-value {
          color: #ffffff;
        }

        /* Winning State */
        .amount-display.winning .amount-value,
        .multiplier-display.winning .multiplier-value,
        .payout-display.winning .payout-value {
          color: #4ade80;
        }

        /* Clickable Games */
        .clickable-game {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          padding: 0.25rem;
          margin: -0.25rem;
        }

        .clickable-game:hover {
          background: rgba(139, 120, 221, 0.08);
          border-color: rgba(139, 120, 221, 0.2);
          transform: translateY(-1px);
        }

        .clickable-game:hover .game-name {
          color: #8b78dd;
        }

        .clickable-game:hover .game-icon {
          filter: brightness(1.1);
        }

        /* Mobile Layout */
        .mobile-only {
          display: none !important;
        }

        .desktop-only {
          display: flex !important;
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: block !important;
          }

          .desktop-only {
            display: none !important;
          }

          .history-container {
            padding: 1rem;
          }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.625rem;
            padding: 1rem;
          }

          .history-title {
            font-size: 1.125rem;
          }

          .history-subtitle {
            font-size: 0.8rem;
          }

          .filter-tabs {
            padding: 0.75rem;
            gap: 0.375rem;
          }

          .filter-tab {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }

          /* Mobile Bet Card Layout */
          .bet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1rem 0.5rem;
          }

          .bet-header .game-name {
            font-size: 0.9rem;
          }

          .bet-date {
            font-size: 0.8rem;
            color: #8aa3b8;
            font-weight: 500;
          }

          .bet-details {
            padding: 0.5rem 1rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .detail-label {
            font-size: 0.8rem;
            color: #8aa3b8;
            font-weight: 500;
          }

          .detail-row .amount-display,
          .detail-row .multiplier-display,
          .detail-row .payout-display {
            gap: 0.25rem;
          }

          .detail-row .amount-value,
          .detail-row .multiplier-value,
          .detail-row .payout-value {
            font-size: 0.8rem;
          }

          .detail-row .multiplier-value {
            font-weight: 700;
            color: #8b78dd;
          }
        }

        @media (max-width: 480px) {
          .history-container {
            padding: 0.75rem;
          }

          .history-header {
            padding: 0.875rem;
            margin-bottom: 1.25rem;
          }

          .history-title {
            font-size: 1rem;
          }

          .filter-tabs {
            gap: 0.25rem;
          }

          .filter-tab {
            font-size: 0.7rem;
            padding: 0.375rem 0.625rem;
          }

          .bet-header {
            padding: 0.875rem 0.875rem 0.5rem;
          }

          .bet-details {
            padding: 0.5rem 0.875rem 0.875rem;
          }
        }
      `}</style>
    </>
  );
}

export default History;
