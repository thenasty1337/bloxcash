import { createSignal, Show, For } from "solid-js";

const GamesTab = (props) => {
  const {
    games,
    gamesLoading,
    totalGames,
    loading,
    syncGames,
    syncPopularity,
    gamesPagination,
    gamesFilters,
    gamesSort,
    activeFilters,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    setGamesSort,
    openEditModal
  } = props;

  return (
    <div class="games-container-in">
      <div class="games-header">
        <h2 class="games-title">Game Library - {totalGames()} games</h2>
        <div class="games-action-buttons">
          <button
            onClick={syncPopularity}
            class="bevel-purple"
            disabled={loading()}
            style="margin-right: 10px;"
          >
            {loading() ? "Syncing..." : "Sync Popularity"}
          </button>
          <button
            onClick={syncGames}
            class="bevel-gold"
            disabled={loading()}
          >
            {loading() ? "Syncing..." : "Sync Games"}
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div class="filters-container">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search games..." 
            class="search-input" 
            value={activeFilters().search}
            onInput={(e) => handleFilterChange('search', e.target.value)}
          />
          <button 
            class="search-button" 
            onClick={() => handleFilterChange('search', activeFilters().search)}
            disabled={gamesLoading()}
          >
            🔍
          </button>
        </div>
        
        <div class="filter-selects">
          {/* Provider Filter */}
          <div class="filter-group">
            <label class="filter-label">Provider</label>
            <select 
              class="filter-select" 
              value={activeFilters().provider} 
              onChange={(e) => handleFilterChange('provider', e.target.value)}
            >
              <option value="">All Providers</option>
              <For each={gamesFilters().providers}>
                {(provider) => (
                  <option value={provider}>{provider}</option>
                )}
              </For>
            </select>
          </div>
          
          {/* Category Filter */}
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select 
              class="filter-select" 
              value={activeFilters().category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <For each={gamesFilters().categories}>
                {(category) => (
                  <option value={category}>{category}</option>
                )}
              </For>
            </select>
          </div>
          
          {/* Sort Options */}
          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select 
              class="filter-select" 
              value={gamesSort().field} 
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="game_name">Game Name</option>
              <option value="provider">Provider</option>
              <option value="category">Category</option>
              <option value="type">Type</option>
              <option value="rtp">RTP</option>
              <option value="created_at">Date Added</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div class="filter-group small">
            <label class="filter-label">Order</label>
            <select 
              class="filter-select" 
              value={gamesSort().order} 
              onChange={(e) => setGamesSort(prev => ({ ...prev, order: e.target.value }))}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        
        {/* Feature Checkboxes */}
        <div class="feature-filters">
          <div class="feature-checkbox">
            <input 
              id="filter-mobile" 
              type="checkbox" 
              checked={activeFilters().features.includes('mobile')}
              onChange={() => handleFilterChange('feature', 'mobile')}
            />
            <label for="filter-mobile" class="feature-label">Mobile</label>
          </div>
          
          <div class="feature-checkbox">
            <input 
              id="filter-freerounds" 
              type="checkbox" 
              checked={activeFilters().features.includes('freerounds')}
              onChange={() => handleFilterChange('feature', 'freerounds')}
            />
            <label for="filter-freerounds" class="feature-label">Free Rounds</label>
          </div>
          
          <div class="feature-checkbox">
            <input 
              id="filter-featurebuy" 
              type="checkbox" 
              checked={activeFilters().features.includes('featurebuy')}
              onChange={() => handleFilterChange('feature', 'featurebuy')}
            />
            <label for="filter-featurebuy" class="feature-label">Feature Buy</label>
          </div>
          
          <div class="feature-checkbox">
            <input 
              id="filter-jackpot" 
              type="checkbox" 
              checked={activeFilters().features.includes('jackpot')}
              onChange={() => handleFilterChange('feature', 'jackpot')}
            />
            <label for="filter-jackpot" class="feature-label">Jackpot</label>
          </div>
        </div>
      </div>
      
      {/* Games Grid View */}
      <div class="games-grid-container">
        <Show when={!gamesLoading() && games().length > 0}>
          <div class="games-grid">
            <For each={games()}>
              {(game) => (
                <div class="game-card">
                  <div class="game-actions" style="display: block; position: absolute; top: 10px; right: 10px; z-index: 5;">
                    <button 
                      class="edit-game-button" 
                      style="background: rgba(0, 0, 0, 0.7); color: var(--gold); border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(game.id);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div class="game-image">
                    <Show when={game.image_url || game.image_square || game.image_portrait} fallback={
                      <div class="game-icon">
                        <span>{game.game_name.charAt(0)}</span>
                      </div>
                    }>
                      <img 
                        src={game.image_square || game.image_portrait || game.image_url} 
                        alt={game.game_name} 
                        class="game-image" 
                        onError={(e) => {
                          e.target.classList.add('hidden');
                          e.target.nextElementSibling.classList.remove('hidden');
                        }}
                      />
                      <div class="game-icon hidden">
                        <span>{game.game_name.charAt(0)}</span>
                      </div>
                    </Show>
                  </div>
                  <div class="game-details">
                    <h3 class="game-name">{game.game_name}</h3>
                    <p class="game-provider">{game.provider}</p>
                    <div class="game-badges">
                      {game.is_mobile && <span class="game-badge mobile">MOBILE</span>}
                      {game.is_new && <span class="game-badge new">NEW</span>}
                      {game.freerounds_supported && <span class="game-badge freerounds">FREE ROUNDS</span>}
                      {game.featurebuy_supported && <span class="game-badge featurebuy">FEATURE BUY</span>}
                      {game.has_jackpot && <span class="game-badge jackpot">JACKPOT</span>}
                    </div>
                    {game.rtp > 0 && (
                      <div class="game-rtp">
                        <span>RTP:</span> {game.rtp}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </For>
          </div>
          
          {/* Pagination Controls */}
          <div class="pagination-controls">
            <button 
              class="pagination-button" 
              disabled={gamesPagination().page === 0 || gamesLoading()}
              onClick={() => handlePageChange(0)}
            >
              &lt;&lt;
            </button>
            <button 
              class="pagination-button" 
              disabled={gamesPagination().page === 0 || gamesLoading()}
              onClick={() => handlePageChange(gamesPagination().page - 1)}
            >
              &lt;
            </button>
            
            <span class="pagination-info">
              Page {gamesPagination().page + 1} of {gamesPagination().pages || 1}
            </span>
            
            <button 
              class="pagination-button" 
              disabled={gamesPagination().page >= gamesPagination().pages - 1 || gamesLoading()}
              onClick={() => handlePageChange(gamesPagination().page + 1)}
            >
              &gt;
            </button>
            <button 
              class="pagination-button" 
              disabled={gamesPagination().page >= gamesPagination().pages - 1 || gamesLoading()}
              onClick={() => handlePageChange(gamesPagination().pages - 1)}
            >
              &gt;&gt;
            </button>
          </div>
        </Show>
        
        {/* Loading or Empty State */}
        <Show when={gamesLoading()}>
          <div class="games-loading">
            <div class="spinner"></div>
            <p>Loading games...</p>
          </div>
        </Show>
        
        <Show when={!gamesLoading() && games().length === 0}>
          <div class="empty-games-message">
            <p>No games found. Try adjusting your filters or click 'Sync Games' to import games from SpinShield.</p>
          </div>
        </Show>
      </div>
      
      <style jsx>{`
        .hidden {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default GamesTab;
