import {A, useSearchParams} from "@solidjs/router";
import {createResource, createSignal, For, Show} from "solid-js";
import {authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import NumberPrefix from "../Transactions/prefix";
import Pagination from "../Pagination/pagination";
import { TbHistory, TbDice, TbShield, TbCalendar, TbCoins, TbTrendingUp, TbCheck } from 'solid-icons/tb';

function History(props) {

  let loadedPages = new Set()
  const [total, setTotal] = createSignal(1)
  const [page, setPage] = createSignal(1)

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
    switch(game?.toLowerCase()) {
      case 'case':
      case 'cases':
        return '📦';
      case 'battle':
      case 'battles':
        return '⚔️';
      case 'coinflip':
        return '🪙';
      case 'jackpot':
        return '🎯';
      case 'roulette':
        return '🎰';
      case 'crash':
        return '🚀';
      default:
        return '🎮';
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
                <div class="header-cell wager">
                  <TbCoins size={16}/>
                  <span>Wager</span>
                </div>
                <div class="header-cell profit">
                  <TbTrendingUp size={16}/>
                  <span>Profit</span>
                </div>
              </div>

              {/* Bet Cards */}
              <div class="bets-list">
                <For each={bets()[page()]}>{(bet, index) => (
                  <div class="bet-card">
                    {/* Mobile Game Header */}
                    <div class="bet-header mobile-only">
                      <div class="game-info">
                        <span class="game-emoji">{getGameIcon(bet?.game)}</span>
                        <span class="game-name">{bet?.game}</span>
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
                        <div class="game-info">
                          <span class="game-emoji">{getGameIcon(bet?.game)}</span>
                          <span class="game-name">{bet?.game}</span>
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

                      <div class="bet-cell wager">
                        <div class="amount-display">
                          <img src='/assets/icons/coin.svg' height='16' width='16'/>
                          <span class="amount-value">
                            {bet?.amount?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>

                      <div class="bet-cell profit">
                        <div class={`profit-display ${(bet?.winnings - bet?.amount || 0) >= 0 ? 'positive' : 'negative'}`}>
                          <NumberPrefix amount={(bet?.winnings - bet?.amount || 0)}/>
                          <img src='/assets/icons/coin.svg' height='16' width='16'/>
                          <span class="profit-value">
                            {Math.abs(bet?.winnings - bet?.amount || 0)?.toLocaleString(undefined, {
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
                        <span class="detail-label">Wager:</span>
                        <div class="amount-display">
                          <img src='/assets/icons/coin.svg' height='14' width='14'/>
                          <span class="amount-value">
                            {bet?.amount?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Profit:</span>
                        <div class={`profit-display ${(bet?.winnings - bet?.amount || 0) >= 0 ? 'positive' : 'negative'}`}>
                          <NumberPrefix amount={(bet?.winnings - bet?.amount || 0)}/>
                          <img src='/assets/icons/coin.svg' height='14' width='14'/>
                          <span class="profit-value">
                            {Math.abs(bet?.winnings - bet?.amount || 0)?.toLocaleString(undefined, {
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
          background: rgba(78, 205, 196, 0.04);
          border: 1px solid rgba(78, 205, 196, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .header-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(68, 160, 141, 0.1));
          border: 1px solid rgba(78, 205, 196, 0.25);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ecdc4;
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
          background: rgba(26, 35, 50, 0.6);
          border: 1px solid rgba(78, 205, 196, 0.12);
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
          background: rgba(78, 205, 196, 0.1);
          border-color: rgba(78, 205, 196, 0.2);
          color: #ffffff;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          border-color: #4ecdc4;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(78, 205, 196, 0.25);
        }

        /* Content */
        .history-content {
          background: rgba(26, 35, 50, 0.6);
          border: 1px solid rgba(78, 205, 196, 0.12);
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
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.06), rgba(68, 160, 141, 0.03));
          border-bottom: 1px solid rgba(78, 205, 196, 0.1);
          gap: 1rem;
        }

        .skeleton-header-cell {
          height: 12px;
          background: rgba(78, 205, 196, 0.1);
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
          border-bottom: 1px solid rgba(78, 205, 196, 0.08);
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
          background: rgba(78, 205, 196, 0.1);
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-game-name {
          width: 80px;
          height: 14px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 7px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-verify-btn {
          width: 70px;
          height: 28px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-date-text {
          width: 120px;
          height: 14px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 7px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-amount {
          width: 90px;
          height: 14px;
          background: rgba(78, 205, 196, 0.1);
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
          background: rgba(78, 205, 196, 0.1);
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
          background: rgba(78, 205, 196, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-amount-small {
          width: 80px;
          height: 12px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 6px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-verify-btn-mobile {
          width: 90px;
          height: 32px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        /* Skeleton Pagination */
        .skeleton-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.04), rgba(68, 160, 141, 0.02));
          border-top: 1px solid rgba(78, 205, 196, 0.08);
        }

        .skeleton-btn {
          width: 80px;
          height: 36px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-page-info {
          width: 60px;
          height: 16px;
          background: rgba(78, 205, 196, 0.1);
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
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ecdc4;
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
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.06), rgba(68, 160, 141, 0.03));
          border-bottom: 1px solid rgba(78, 205, 196, 0.1);
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
        .header-cell.wager { flex: 1.5; justify-content: flex-end; }
        .header-cell.profit { flex: 1.5; justify-content: flex-end; }

        /* Bet Cards */
        .bets-list {
          padding: 0;
        }

        .bet-card {
          border-bottom: 1px solid rgba(78, 205, 196, 0.08);
          transition: all 0.2s ease;
          position: relative;
        }

        .bet-card:last-child {
          border-bottom: none;
        }

        .bet-card:hover {
          background: rgba(78, 205, 196, 0.04);
        }

        .bet-card:hover::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #4ecdc4, #44a08d);
          opacity: 1;
        }

        .bet-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #4ecdc4, #44a08d);
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
        .bet-cell.wager { flex: 1.5; justify-content: flex-end; }
        .bet-cell.profit { flex: 1.5; justify-content: flex-end; }

        /* Game Info */
        .game-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .game-emoji {
          font-size: 1.1rem;
        }

        .game-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          text-transform: capitalize;
        }

        /* Verify Button */
        .verify-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.75rem;
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
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
          background: linear-gradient(135deg, #44a08d, #3d9980);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(78, 205, 196, 0.3);
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
        .amount-display, .profit-display {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .amount-value, .profit-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .profit-display.positive .profit-value {
          color: #4ecdc4;
        }

        .profit-display.negative .profit-value {
          color: #ff6b6b;
        }

        /* Mobile Layout */
        .mobile-only {
          display: none;
        }

        .desktop-only {
          display: flex;
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }

          .desktop-only {
            display: none;
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
          .detail-row .profit-display {
            gap: 0.25rem;
          }

          .detail-row .amount-value,
          .detail-row .profit-value {
            font-size: 0.8rem;
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
