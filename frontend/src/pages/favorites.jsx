import {createResource, createSignal, For, Show, createEffect} from "solid-js";
import {A} from "@solidjs/router";
import {favorites} from "../util/api";
import {useUser} from "../contexts/usercontextprovider";
import Loader from "../components/Loader/loader";
import BlurImage from "../components/UI/BlurImage";
import FavoriteButton from "../components/UI/FavoriteButton";
import {Title} from "@solidjs/meta";
import { AiOutlineHeart, AiOutlineSearch, AiOutlineFilter, AiOutlineFire, AiOutlineTrophy, AiOutlinePlayCircle, AiOutlineAppstore } from 'solid-icons/ai';
import { BsDiamond, BsLightning } from 'solid-icons/bs';

function Favorites() {
  const [user] = useUser();
  const [favoritesData, setFavoritesData] = createSignal([]);
  const [filteredData, setFilteredData] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [offset, setOffset] = createSignal(0);
  const [total, setTotal] = createSignal(0);
  const [hasMore, setHasMore] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [filterProvider, setFilterProvider] = createSignal('all');
  const [sortBy, setSortBy] = createSignal('recent'); // recent, name, provider

  const [favoritesResource] = createResource(() => user() ? true : false, fetchFavorites);

  async function fetchFavorites() {
    if (!user()) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await favorites.get(50, offset());
      
      if (response && response.data) {
        setFavoritesData(response.data);
        setTotal(response.total);
        setHasMore(response.data.length === 50 && response.data.length < response.total);
      } else {
        setFavoritesData([]);
        setTotal(0);
        setHasMore(false);
      }
      
      setLoading(false);
      return response;
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
      setLoading(false);
      return [];
    }
  }

  async function loadMore() {
    if (!hasMore() || loading()) return;

    try {
      setLoading(true);
      const newOffset = offset() + 50;
      const response = await favorites.get(50, newOffset);
      
      if (response && response.data) {
        setFavoritesData([...favoritesData(), ...response.data]);
        setOffset(newOffset);
        setHasMore(response.data.length === 50);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading more favorites:', err);
      setLoading(false);
    }
  }

  const handleFavoriteToggle = (removed) => {
    if (removed) {
      // Refresh the favorites list when a favorite is removed
      setOffset(0);
      fetchFavorites();
    }
  };

  // Filter and sort logic
  createEffect(() => {
    const data = favoritesData();
    const query = searchQuery().toLowerCase();
    const provider = filterProvider();
    const sort = sortBy();

    let filtered = data.filter(slot => {
      const matchesSearch = slot.name.toLowerCase().includes(query) || 
                           (slot.providerName || slot.provider).toLowerCase().includes(query);
      const matchesProvider = provider === 'all' || slot.provider === provider;
      return matchesSearch && matchesProvider;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'provider':
          return (a.providerName || a.provider).localeCompare(b.providerName || b.provider);
        case 'recent':
        default:
          return new Date(b.favoritedAt) - new Date(a.favoritedAt);
      }
    });

    setFilteredData(filtered);
  });

  // Get unique providers for filter dropdown
  const getProviders = () => {
    const providers = [...new Set(favoritesData().map(slot => slot.provider))];
    return providers.sort();
  };

  return (
    <>
      <Title>BloxClash | My Favorites</Title>
      
      <div class='favorites-container'>
        <div class='favorites-header'>
          <div class='header-main'>
            <div class='header-content'>
              <div class='header-icon'>
                <AiOutlineHeart size={28} />
              </div>
              <div class='header-text'>
                <h1>My Favorites</h1>
                <p>Your personally curated collection</p>
              </div>
            </div>
            <div class='header-stats'>
              <div class='stat-item'>
                <AiOutlineAppstore size={18} />
                <div class='stat-info'>
                  <span class='stat-number'>{total()}</span>
                  <span class='stat-label'>Games</span>
                </div>
              </div>
              <div class='stat-item'>
                <BsDiamond size={18} />
                <div class='stat-info'>
                  <span class='stat-number'>{getProviders().length}</span>
                  <span class='stat-label'>Providers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Show when={!user()}>
          <div class='auth-required'>
            <div class='auth-card'>
              <div class='auth-icon'>
                <AiOutlineHeart size={48} />
              </div>
              <h2>Sign in to view favorites</h2>
              <p>Create an account or sign in to start building your personal collection of favorite games.</p>
              <A href="/login" class="auth-button">Sign In</A>
            </div>
          </div>
        </Show>

        <Show when={user()}>
          <Show when={favoritesData().length > 0}>
            <div class='controls-section'>
              <div class='controls-row'>
                <div class='search-container'>
                  <div class='search-icon'>
                    <AiOutlineSearch size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search games..."
                    value={searchQuery()}
                    onInput={(e) => setSearchQuery(e.target.value)}
                    class='search-input'
                  />
                </div>
                
                <div class='filters-row'>
                  <select 
                    value={filterProvider()} 
                    onChange={(e) => setFilterProvider(e.target.value)}
                    class='filter-select'
                  >
                    <option value="all">All Providers</option>
                    <For each={getProviders()}>
                      {(provider) => <option value={provider}>{provider}</option>}
                    </For>
                  </select>
                  
                  <select 
                    value={sortBy()} 
                    onChange={(e) => setSortBy(e.target.value)}
                    class='filter-select'
                  >
                    <option value="recent">Recently Added</option>
                    <option value="name">A-Z</option>
                    <option value="provider">Provider</option>
                  </select>
                </div>
              </div>
            </div>

            <div class='results-bar'>
              <span class='results-text'>
                {filteredData().length} of {total()} games
              </span>
              <Show when={searchQuery() || filterProvider() !== 'all'}>
                <button 
                  class='clear-filters-btn'
                  onClick={() => {
                    setSearchQuery('');
                    setFilterProvider('all');
                  }}
                >
                  Clear filters
                </button>
              </Show>
            </div>
          </Show>

          <Show when={loading() && favoritesData().length === 0} fallback={
            <Show when={error()} fallback={
              <Show when={favoritesData().length > 0} fallback={
                <div class='empty-state'>
                  <div class='empty-content'>
                    <div class='empty-icon'>
                      <AiOutlineHeart size={64} />
                    </div>
                    <h2>No favorites yet</h2>
                    <p>Discover amazing games and add them to your favorites collection</p>
                    <A href="/slots" class="browse-button">
                      <AiOutlineAppstore size={16} />
                      Browse Games
                    </A>
                  </div>
                </div>
              }>
                <div class='games-grid'>
                  <For each={filteredData()}>
                    {(slot) => (
                      <div class='game-card'>
                        <div class='game-image'>
                          <BlurImage 
                            src={slot.img}
                            blurhash={slot.blurhash}
                            style={{ 'border-radius': '12px' }}
                          />
                          <div class='game-overlay'>
                            <button class='play-btn-overlay'>
                              <AiOutlinePlayCircle size={40} />
                            </button>
                          </div>
                          <div class='game-badges'>
                            {slot.isNew && 
                              <span class="badge badge-new">
                                <BsLightning size={10} />
                                New
                              </span>
                            }
                            {slot.hasJackpot && 
                              <span class="badge badge-jackpot">
                                <AiOutlineTrophy size={10} />
                                Jackpot
                              </span>
                            }
                          </div>
                          <div class='favorite-btn'>
                            <FavoriteButton 
                              slug={slot.slug}
                              isAuthenticated={true}
                              isFavorited={true}
                              size={18}
                              onToggle={(isFavorited) => handleFavoriteToggle(!isFavorited)}
                            />
                          </div>
                          <A href={`/slots/${slot.slug}`} class='game-link'/>
                        </div>
                        
                        <div class='game-info'>
                          <h3 class='game-title'>{slot.name}</h3>
                          
                          <div class='game-provider'>
                            <img 
                              src={`/assets/gameProvider/${slot.provider.toLowerCase()}.webp`} 
                              alt={slot.provider}
                              class='provider-icon'
                              onError={(e) => e.target.style.display = 'none'}
                            />
                            <span class='provider-name'>{slot.providerName || slot.provider}</span>
                          </div>
                          
                          <div class='game-date'>
                            Added {new Date(slot.favoritedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          
                          <div class='game-actions'>
                            <A href={`/slots/${slot.slug}`} class='play-btn'>
                              <AiOutlinePlayCircle size={16} />
                              Play
                            </A>
                            <A href={`/slots/${slot.slug}?demo=true`} class='demo-btn'>
                              Demo
                            </A>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>

                <Show when={hasMore()}>
                  <div class='load-more-section'>
                    <button 
                      class='load-more-btn' 
                      onClick={loadMore}
                      disabled={loading()}
                    >
                      {loading() ? 'Loading...' : 'Load More Games'}
                    </button>
                  </div>
                </Show>
              </Show>
            }>
              <div class='error-state'>
                <h2>Something went wrong</h2>
                <p>{error()}</p>
                <button class='retry-btn' onClick={fetchFavorites}>
                  Try Again
                </button>
              </div>
            </Show>
          }>
            <div class='loading-state'>
              <Loader />
            </div>
          </Show>
        </Show>
      </div>

      <style jsx>{`
        .favorites-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
        }

        /* Header Section */
        .favorites-header {
          margin-bottom: 32px;
        }

        .header-main {
          background: linear-gradient(135deg, rgba(16, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
        }

        .header-text h1 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .header-text p {
          margin: 0;
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 500;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(8px);
        }

        .stat-item svg {
          color: #60a5fa;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Controls Section */
        .controls-section {
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .controls-row {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 16px;
          background: rgba(16, 23, 42, 0.4);
          border: 1px solid rgba(71, 85, 105, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          overflow: visible;
          position: relative;
        }

        .search-container {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 10;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-input {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 44px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .filters-row {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          position: relative;
          z-index: 5;
        }

        .filter-select {
          position: relative;
          height: 44px;
          padding: 0 32px 0 12px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          white-space: nowrap;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          z-index: 10;
        }

        .filter-select:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(30, 41, 59, 0.8);
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
        }

        .filter-select option {
          background: #1e293b;
          color: white;
        }

        /* Results Bar */
        .results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 0 4px;
        }

        .results-text {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .clear-filters-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        /* Games Grid */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .game-card {
          background: linear-gradient(145deg, rgba(16, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          border: 1px solid rgba(71, 85, 105, 0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        .game-card:hover {
          transform: translateY(-4px);
          border-color: rgba(96, 165, 250, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(96, 165, 250, 0.1);
        }

        .game-image {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .game-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg, 
            rgba(0, 0, 0, 0.4) 0%, 
            rgba(0, 0, 0, 0.6) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .game-card:hover .game-overlay {
          opacity: 1;
        }

        .play-btn-overlay {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }

        .play-btn-overlay:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }

        .game-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 3;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          backdrop-filter: blur(8px);
        }

        .badge-new {
          background: rgba(34, 197, 94, 0.9);
          color: white;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .badge-jackpot {
          background: rgba(251, 191, 36, 0.9);
          color: white;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 4;
        }

        .game-link {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .game-info {
          padding: 20px;
        }

        .game-title {
          margin: 0 0 12px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .game-provider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          padding: 6px 10px;
          background: rgba(51, 65, 85, 0.4);
          border-radius: 6px;
          width: fit-content;
        }

        .provider-icon {
          width: 16px;
          height: 16px;
          object-fit: contain;
          border-radius: 3px;
        }

        .provider-name {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .game-date {
          color: #64748b;
          font-size: 0.8rem;
          margin-bottom: 16px;
        }

        .game-actions {
          display: flex;
          gap: 8px;
        }

        .play-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .play-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .demo-btn {
          height: 40px;
          padding: 0 16px;
          background: transparent;
          border: 1px solid rgba(71, 85, 105, 0.4);
          color: #94a3b8;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .demo-btn:hover {
          background: rgba(71, 85, 105, 0.2);
          border-color: #94a3b8;
          color: white;
        }

        /* Empty and Error States */
        .auth-required, .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 40px 20px;
        }

        .auth-card, .empty-content {
          text-align: center;
          max-width: 400px;
          padding: 40px 32px;
          background: rgba(16, 23, 42, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          backdrop-filter: blur(12px);
        }

        .auth-icon, .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(71, 85, 105, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #64748b;
        }

        .auth-card h2, .empty-content h2 {
          margin: 0 0 16px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }

        .auth-card p, .empty-content p {
          margin: 0 0 24px 0;
          color: #94a3b8;
          line-height: 1.6;
        }

        .auth-button, .browse-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .auth-button:hover, .browse-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .load-more-section {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .load-more-btn {
          padding: 12px 32px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.8);
          border-color: #60a5fa;
          color: white;
        }

        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 40px 20px;
        }

        .error-state h2 {
          color: #ef4444;
          margin-bottom: 16px;
        }

        .error-state p {
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .retry-btn {
          padding: 12px 24px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 8px;
          color: #ef4444;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .favorites-container {
            padding: 20px;
          }

          .games-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .favorites-container {
            padding: 16px;
          }

          .header-main {
            flex-direction: column;
            gap: 20px;
            padding: 24px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .header-icon {
            width: 56px;
            height: 56px;
          }

          .header-text h1 {
            font-size: 1.75rem;
          }

          .header-stats {
            width: 100%;
            justify-content: center;
          }

          .controls-row {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .search-container {
            max-width: none;
          }

          .filters-row {
            justify-content: space-between;
          }

          .filter-select {
            flex: 1;
            min-width: 100px;
          }

          .results-bar {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .games-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }

          .game-info {
            padding: 16px;
          }

          .game-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .favorites-container {
            padding: 12px;
          }

          .header-main {
            padding: 20px;
          }

          .header-text h1 {
            font-size: 1.5rem;
          }

          .header-stats {
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .stat-item {
            padding: 12px 16px;
          }

          .controls-section {
            padding: 16px;
          }

          .games-grid {
            grid-template-columns: 1fr;
          }

          .play-btn-overlay {
            width: 60px;
            height: 60px;
          }

          .auth-card, .empty-content {
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
}

export default Favorites; 