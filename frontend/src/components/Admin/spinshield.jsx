import { createSignal, createEffect, onMount, Show, For } from "solid-js";
import { authedAPI, createNotification, API_BASE_URL } from "../../util/api";

// CSS styles for the component
const styles = `
  .spin-shield-container {
    background: var(--gradient-bg);
    border-radius: 10px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
    padding: 20px;
    margin: 20px 0;
    font-family: "Geogrotesque Wide", sans-serif;
  }

  .shield-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .shield-title {
    color: var(--gold);
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }

  .status-indicator {
    margin-left: auto;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .status-dot {
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }

  .status-text {
    color: #ADA3EF;
    font-size: 14px;
  }

  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    animation: fadeInOut 5s forwards;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    font-family: "Geogrotesque Wide", sans-serif;
  }

  .success {
    background: #59E878;
  }

  .error {
    background: #FF5252;
  }

  .tab-container {
    display: flex;
    border-bottom: 1px solid #4A4581;
    margin-bottom: 20px;
    gap: 5px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    color: #ADA3EF;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .form-input {
    width: 100%;
    background: #312A5E;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 12px;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
    margin-bottom: 5px;
  }

  .form-input:focus {
    outline: 1px solid var(--gold);
  }

  .form-input-hint {
    font-size: 12px;
    color: #ADA3EF;
    opacity: 0.7;
  }

  .form-checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 15px;
    margin-bottom: 25px;
  }

  .form-submit {
    margin-top: 10px;
  }

  .table-container {
    background: #312A5E;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }

  .games-table {
    width: 100%;
    border-collapse: collapse;
  }

  .games-table th {
    padding: 12px 15px;
    text-align: left;
    background: #1E1A3A;
    color: var(--gold);
    font-weight: 600;
    font-size: 14px;
  }

  .games-table td {
    padding: 12px 15px;
    color: #ADA3EF;
    border-bottom: 1px solid #423c7a;
  }

  .games-table tr:last-child td {
    border-bottom: none;
  }

  .empty-table-message {
    padding: 20px;
    text-align: center;
    color: #ADA3EF;
  }

  .placeholder-content {
    background: #312A5E;
    border-radius: 5px;
    padding: 20px;
    color: #ADA3EF;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  /* Games Styling */
  .games-container-in {
    background: #312A5E;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  .games-header {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1E1A3A;
    border-bottom: 1px solid #4A4581;
  }
  
  .games-title {
    color: var(--gold);
    font-size: 18px;
    margin: 0;
  }
  
  .filters-container {
    padding: 15px;
    background: #2a2550;
    border-bottom: 1px solid #4A4581;
  }
  
  .search-container {
    display: flex;
    margin-bottom: 15px;
  }
  
  .search-input {
    flex: 1;
    background: #312A5E;
    color: white;
    border: none;
    border-radius: 5px 0 0 5px;
    padding: 10px 12px;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  .search-button {
    background: var(--gold);
    color: #1E193A;
    border: none;
    border-radius: 0 5px 5px 0;
    padding: 8px 15px;
    cursor: pointer;
  }
  
  .filter-selects {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .filter-group {
    flex: 1;
  }
  
  .filter-group.small {
    flex: 0.5;
  }
  
  .filter-label {
    display: block;
    color: #ADA3EF;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .filter-select {
    width: 100%;
    background: #312A5E;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 10px;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  .feature-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .filter-checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .filter-checkbox-wrapper label {
    color: #ADA3EF;
    font-size: 14px;
  }
  
  .games-grid-container {
    padding: 20px;
    min-height: 300px;
  }
  
  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .game-card {
    background: #1E1A3A;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .game-card:hover {
    transform: translateY(-5px);
  }
  
  .game-image-container {
    height: 150px;
    background: #0e0b21;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .game-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #312A5E, #1E193A);
    color: var(--gold);
    font-size: 36px;
    font-weight: bold;
  }
  
  .game-details {
    padding: 12px;
  }
  
  .game-name {
    color: #ffffff;
    font-size: 16px;
    margin: 0 0 5px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .game-provider {
    color: #ADA3EF;
    font-size: 12px;
    margin: 0 0 10px 0;
  }
  
  .game-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 8px;
  }
  
  .game-category {
    background: #312A5E;
    color: #ADA3EF;
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 3px;
  }
  
  .game-badge {
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 3px;
    font-weight: bold;
  }
  
  .game-badge.new {
    background: #ff9800;
    color: #000;
  }
  
  .game-badge.freerounds {
    background: #4caf50;
    color: #000;
  }
  
  .game-badge.featurebuy {
    background: #2196f3;
    color: #000;
  }
  
  .game-badge.jackpot {
    background: #e91e63;
    color: #fff;
  }
  
  .game-rtp {
    margin-top: 5px;
    font-size: 12px;
    color: #ADA3EF;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    gap: 10px;
  }
  
  .pagination-button {
    background: #312A5E;
    color: #ADA3EF;
    border: none;
    border-radius: 5px;
    padding: 8px 12px;
    cursor: pointer;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-info {
    color: #ADA3EF;
    font-size: 14px;
  }
  
  .games-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
    color: #ADA3EF;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(173, 163, 239, 0.2);
    border-radius: 50%;
    border-top-color: var(--gold);
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .empty-games-message {
    text-align: center;
    color: #ADA3EF;
    padding: 40px 0;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-container {
    background: var(--gradient-bg);
    border-radius: 10px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: "Geogrotesque Wide", sans-serif;
  }
  
  .modal-header {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #4A4581;
    background: #1E1A3A;
  }
  
  .modal-title {
    color: var(--gold);
    font-size: 20px;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    color: #ADA3EF;
    font-size: 24px;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
  }
  
  .form-column {
    flex: 1;
  }
  
  .edit-game-form .form-group {
    margin-bottom: 15px;
  }
  
  .edit-game-form .form-label {
    display: block;
    color: #ADA3EF;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  .form-checkbox-group {
    margin-top: 20px;
  }
  
  .checkbox-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .checkbox-row label {
    margin-left: 8px;
    color: #ADA3EF;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #4A4581;
  }
  
  .bevel-button {
    padding: 8px 16px;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: "Geogrotesque Wide", sans-serif;
  }
  
  .bevel-button.cancel {
    background: #312A5E;
    color: #ADA3EF;
  }
  
  /* Game card edit button */
  .game-card {
    position: relative;
  }
  
  .game-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: none;
  }
  
  .game-card:hover .game-actions {
    display: block;
  }
  
  .edit-game-button {
    background: rgba(0, 0, 0, 0.6);
    color: var(--gold);
    border: 1px solid var(--gold);
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .edit-game-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`;

// Notification component
const Notification = (props) => {
  return (
    <div class={`notification ${props.type === 'success' ? 'success' : 'error'}`}>
      <div>{props.type === 'success' ? '✓' : '✕'}</div>
      <div>{props.message}</div>
    </div>
  );
};

// Modal component for editing games
const GameEditModal = (props) => {
  const { show, onClose, game, loading, onChange, onSubmit } = props;
  
  if (!show) return null;
  
  console.log('GameEditModal rendering with game data:', game, 'loading state:', loading); // Debug game data and loading state in modal
  
  return (
    <div class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Edit Game: {game.game_name}</h2>
          <button class="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div class="modal-body">
          <form onSubmit={onSubmit} class="edit-game-form">
            <div class="form-row">
              <div class="form-column">
                <div class="form-group">
                  <label class="form-label">Game Name</label>
                  <input 
                    type="text" 
                    name="game_name" 
                    value={game.game_name} 
                    onInput={onChange}
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Provider</label>
                  <input 
                    type="text" 
                    name="provider" 
                    value={game.provider} 
                    onInput={onChange}
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Provider Name</label>
                  <input 
                    type="text" 
                    name="provider_name" 
                    value={game.provider_name || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Type</label>
                  <input 
                    type="text" 
                    name="type" 
                    value={game.type} 
                    onInput={onChange}
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <input 
                    type="text" 
                    name="category" 
                    value={game.category} 
                    onInput={onChange}
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Subcategory</label>
                  <input 
                    type="text" 
                    name="subcategory" 
                    value={game.subcategory || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">RTP (%)</label>
                  <input 
                    type="text" 
                    name="rtp" 
                    value={game.rtp} 
                    onInput={onChange}
                    class="form-input"
                    placeholder="Example: 96.5"
                  />
                </div>
              </div>
              
              <div class="form-column">
                <div class="form-group">
                  <label class="form-label">Image URL</label>
                  <input 
                    type="text" 
                    name="image_url" 
                    value={game.image_url || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Square Image URL</label>
                  <input 
                    type="text" 
                    name="image_square" 
                    value={game.image_square || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Portrait Image URL</label>
                  <input 
                    type="text" 
                    name="image_portrait" 
                    value={game.image_portrait || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Long Image URL</label>
                  <input 
                    type="text" 
                    name="image_long" 
                    value={game.image_long || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Source</label>
                  <input 
                    type="text" 
                    name="source" 
                    value={game.source || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">System</label>
                  <input 
                    type="text" 
                    name="system" 
                    value={game.system || ''} 
                    onInput={onChange}
                    class="form-input"
                  />
                </div>
                
                <div class="form-checkbox-group">
                  <div class="checkbox-row">
                    <input 
                      id="is_new" 
                      name="is_new" 
                      type="checkbox" 
                      checked={game.is_new === 1 || game.is_new === true} 
                      onChange={onChange} 
                    />
                    <label for="is_new">New Game</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="is_mobile" 
                      name="is_mobile" 
                      type="checkbox" 
                      checked={game.is_mobile === 1 || game.is_mobile === true} 
                      onChange={onChange} 
                    />
                    <label for="is_mobile">Mobile Supported</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="freerounds_supported" 
                      name="freerounds_supported" 
                      type="checkbox" 
                      checked={game.freerounds_supported === 1 || game.freerounds_supported === true} 
                      onChange={onChange} 
                    />
                    <label for="freerounds_supported">Free Rounds Supported</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="featurebuy_supported" 
                      name="featurebuy_supported" 
                      type="checkbox" 
                      checked={game.featurebuy_supported === 1 || game.featurebuy_supported === true} 
                      onChange={onChange} 
                    />
                    <label for="featurebuy_supported">Feature Buy Supported</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="has_jackpot" 
                      name="has_jackpot" 
                      type="checkbox" 
                      checked={game.has_jackpot === 1 || game.has_jackpot === true} 
                      onChange={onChange} 
                    />
                    <label for="has_jackpot">Has Jackpot</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="play_for_fun_supported" 
                      name="play_for_fun_supported" 
                      type="checkbox" 
                      checked={game.play_for_fun_supported === 1 || game.play_for_fun_supported === true} 
                      onChange={onChange} 
                    />
                    <label for="play_for_fun_supported">Play For Fun Supported</label>
                  </div>
                  
                  <div class="checkbox-row">
                    <input 
                      id="active" 
                      name="active" 
                      type="checkbox" 
                      checked={game.active === 1 || game.active === true} 
                      onChange={onChange} 
                    />
                    <label for="active">Active</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="bevel-button cancel" onClick={(e) => {
                e.preventDefault();
                console.log('Cancel button clicked');
                // Force close even if loading to prevent getting stuck
                onClose();
              }}>Cancel</button>
              <button type="submit" class="bevel-gold" 
                onClick={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  if (!onSubmit) return;
                  console.log('Save button clicked');
                  onSubmit(e); // Manually call onSubmit function
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SpinShield = () => {
  const [activeTab, setActiveTab] = createSignal("games");
  const [settings, setSettings] = createSignal({});
  const [games, setGames] = createSignal([]);
  const [gamesLoading, setGamesLoading] = createSignal(false);
  const [gamesPagination, setGamesPagination] = createSignal({ total: 0, page: 0, limit: 15, pages: 0 });
  const [gamesFilters, setGamesFilters] = createSignal({ providers: [], categories: [] });
  const [activeFilters, setActiveFilters] = createSignal({ search: '', provider: '', category: '', features: [] });
  const [gamesSort, setGamesSort] = createSignal({ field: 'game_name', order: 'asc' });
  const [sessions, setSessions] = createSignal([]);
  const [transactions, setTransactions] = createSignal([]);
  const [freespins, setFreespins] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal({ type: "", text: "" });
  const [showNotification, setShowNotification] = createSignal(false); 
  const [totalGames, setTotalGames] = createSignal(0);
  
  // Game edit modal state
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [editingGame, setEditingGame] = createSignal(null);
  const [editGameLoading, setEditGameLoading] = createSignal(false); // Initialize to false
  const defaultGameForm = {
    game_name: '',
    provider: '',
    provider_name: '',
    type: '',
    category: '',
    subcategory: '',
    is_new: false,
    is_mobile: true,
    freerounds_supported: false,
    featurebuy_supported: false,
    has_jackpot: false,
    play_for_fun_supported: true,
    image_url: '',
    image_square: '',
    image_portrait: '',
    image_long: '',
    source: '',
    system: '',
    rtp: 0,
    active: true
  };
  const [gameForm, setGameForm] = createSignal({...defaultGameForm});
  const [formData, setFormData] = createSignal({
    api_login: "",
    api_password: "",
    endpoint: "",
    callback_url: "",
    salt_key: "",
    active: false,
  });

  // Helper function to display notification
  const displayMessage = (type, text) => {
    setMessage({ type, text });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/settings', 'GET', null);
      if (response && response.settings) {
        setSettings(response.settings);
        setFormData({
          api_login: response.settings.api_login || "",
          endpoint: response.settings.endpoint || "",
          callback_url: response.settings.callback_url || "",
          salt_key: response.settings.salt_key || "",
          active: response.settings.active || false,
          api_password: "", // Password is not returned from the API for security
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      displayMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Load games with filtering, sorting, and pagination
  const loadGames = async (resetPage = false) => {
    try {
      setGamesLoading(true);
      
      const filters = activeFilters();
      const sort = gamesSort();
      const pagination = gamesPagination();
      const page = resetPage ? 0 : pagination.page;
      
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        sort: sort.field,
        order: sort.order,
        search: filters.search || '',
        provider: filters.provider || '',
        category: filters.category || '',
        features: filters.features.join(',') || ''
      });
      
      const response = await authedAPI(`/admin/spinshield/games?${params}`, 'GET', null);
      
      if (response.games) {
        setTotalGames(response.pagination.total);
        setGames(response.games);
        setGamesPagination(response.pagination);
        setGamesFilters(response.filters);
      }
    } catch (error) {
      console.error('Error loading SpinShield games:', error);
      displayMessage('error', 'Failed to load games');
    } finally {
      setGamesLoading(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/sessions', 'GET', null);
      setSessions(response && response.sessions ? response.sessions : []);
    } catch (error) {
      console.error("Error loading sessions:", error);
      displayMessage("error", "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/transactions', 'GET', null);
      if (response.transactions) {
        setTransactions(response.transactions);
      }
    } catch (error) {
      console.error('Error loading SpinShield transactions:', error);
      displayMessage('error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Load freespins
  const loadFreespins = async () => {
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/freespins', 'GET', null);
      if (response.freespins) {
        setFreespins(response.freespins);
      }
    } catch (error) {
      console.error('Error loading SpinShield freespins:', error);
      displayMessage('error', 'Failed to load freespins');
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/settings', 'POST', formData());
      
      if (response.success) {
        displayMessage('success', response.message);
        loadSettings();
      } else {
        displayMessage('error', response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving SpinShield settings:', error);
      displayMessage('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Sync games
  const syncGames = async () => {
    try {
      setLoading(true);
      const response = await authedAPI('/admin/spinshield/sync-games', 'POST', {});
      
      if (response.success) {
        displayMessage('success', response.message);
        // After sync, refresh the games list
        loadGames(true);
      } else {
        displayMessage('error', response.error || 'Failed to sync games');
      }
    } catch (error) {
      console.error('Error syncing SpinShield games:', error);
      displayMessage('error', 'Failed to sync games');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };
  
  // Create a debounce function to prevent too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  // Debounced version of loadGames to prevent too many API calls
  const debouncedLoadGames = debounce((resetPage) => {
    loadGames(resetPage);
  }, 300); // 300ms delay
  
  // Handle game filters
  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => {
      let newFilters = { ...prev };
      
      if (type === 'feature') {
        // Toggle feature in the array
        if (prev.features.includes(value)) {
          newFilters.features = prev.features.filter(f => f !== value);
        } else {
          newFilters.features = [...prev.features, value];
        }
      } else {
        // For other filter types, just update the value
        newFilters[type] = value;
      }
      
      return newFilters;
    });
    
    // Only search text filters should be debounced
    if (type === 'search') {
      debouncedLoadGames(true);
    } else {
      // For other filters, immediate response is better
      loadGames(true);
    }
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    setGamesSort(prev => {
      if (prev.field === field) {
        // Toggle sort order if clicking on the same field
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      } else {
        // Default to ascending order for a new field
        return { field, order: 'asc' };
      }
    });
    
    loadGames(false);
  };
  
  // Open edit modal for a specific game
  const openEditModal = async (gameId) => {
    try {
      // Make sure loading state is reset at the beginning
      setEditGameLoading(false);
      // Temporarily set loading to true while fetching data
      setEditGameLoading(true);
      console.log('Opening edit modal, fetching game data...'); 
      
      // First get the data, then show the modal when we have it
      // Fetch the game details from the backend using fetch directly to ensure proper handling
      const response = await fetch(`${API_BASE_URL}/admin/spinshield/games/${gameId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching game details: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug response
      
      if (data && data.game) {
        // Store the original response game data
        setEditingGame(data.game);
        
        // Create a processed copy with proper boolean and default values
        const processedData = {
          ...data.game,
          // Explicit conversion of numeric booleans to JavaScript booleans
          is_new: data.game.is_new === 1 || data.game.is_new === true,
          is_mobile: data.game.is_mobile === 1 || data.game.is_mobile === true,
          freerounds_supported: data.game.freerounds_supported === 1 || data.game.freerounds_supported === true,
          featurebuy_supported: data.game.featurebuy_supported === 1 || data.game.featurebuy_supported === true,
          has_jackpot: data.game.has_jackpot === 1 || data.game.has_jackpot === true,
          play_for_fun_supported: data.game.play_for_fun_supported === 1 || data.game.play_for_fun_supported === true,
          active: data.game.active === 1 || data.game.active === true,
          // Convert numeric RTP to string for form input
          rtp: data.game.rtp !== null ? data.game.rtp.toString() : '0',
          // Ensure other fields have default values if null/undefined
          provider_name: data.game.provider_name || '',
          subcategory: data.game.subcategory || '',
          image_url: data.game.image_url || '',
          image_square: data.game.image_square || '',
          image_portrait: data.game.image_portrait || '',
          image_long: data.game.image_long || '',
          source: data.game.source || '',
          system: data.game.system || ''
        };
        
        console.log('Processed form data:', processedData); // Debug processed data
        
        // Set the form data with properly processed values BEFORE showing the modal
        setGameForm(processedData);
        
        // IMPORTANT: Reset loading state BEFORE showing the modal
        console.log('Resetting loading state before showing modal');
        setEditGameLoading(false);
        
        // Only show the modal after data is loaded and processed and loading state is reset
        setShowEditModal(true);
      } else {
        displayMessage('error', 'Failed to load game details - invalid response format');
        console.error('Invalid API response format:', data);
      }
    } catch (error) {
      console.error('Error loading game details:', error);
      displayMessage('error', `Failed to load game details: ${error.message}`);
    } finally {
      // Make absolutely sure loading state is false
      console.log('Final loading state reset in openEditModal');
      setEditGameLoading(false);
    }
  };
  
  // Close edit modal
  const closeEditModal = () => {
    // Always reset loading state when closing modal
    console.log('Closing modal, resetting loading state');
    setEditGameLoading(false);
    setShowEditModal(false);
    setEditingGame(null);
    setGameForm({...defaultGameForm});
  };
  
  // Handle game form input changes
  const handleGameFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    let newValue;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'rtp') {
      // Validate RTP as decimal number
      newValue = value === '' ? '' : value.replace(/[^0-9.]/g, '');
    } else {
      newValue = value;
    }
    
    setGameForm(prev => ({ ...prev, [name]: newValue }));
  };
  
  // Save game edits
  const saveGameEdit = async (e) => {
    e.preventDefault();
    console.log('Save game edit function called');
    
    // First ensure we're not already in a loading state
    if (editGameLoading()) {
      console.log('Already in loading state, ignoring save request');
      return;
    }
    
    if (!editingGame()) {
      console.error('No game being edited');
      return;
    }
    
    // Set loading state to true
    console.log('Setting loading state to true');
    setEditGameLoading(true);
    
    try {    
      // Prepare data for API
      const gameData = {...gameForm()};
      console.log('Submitting game data:', gameData);
      
      // Convert RTP from string to number
      if (gameData.rtp === '' || isNaN(parseFloat(gameData.rtp))) {
        gameData.rtp = 0;
      } else {
        gameData.rtp = parseFloat(gameData.rtp);
      }
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Make API request
        console.log(`Making PUT request to ${API_BASE_URL}/admin/spinshield/games/${editingGame().id}`);
        const response = await fetch(`${API_BASE_URL}/admin/spinshield/games/${editingGame().id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(gameData),
          signal: controller.signal
        });
        
        // Clear timeout since request completed
        clearTimeout(timeoutId);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success) {
          // Success case
          displayMessage('success', data.message || 'Game updated successfully');
          loadGames(false); // Refresh games list
          closeEditModal();
        } else {
          // API returned success: false
          displayMessage('error', data.error || 'Failed to update game');
          // Reset loading state here to ensure it happens even when API returns error
          console.log('Setting loading state to false due to API error');
          setEditGameLoading(false);
        }
      } catch (fetchError) {
        // Handle fetch errors
        if (fetchError.name === 'AbortError') {
          console.error('Request timed out');
          displayMessage('error', 'Request timed out. Please try again.');
        } else {
          console.error('Fetch error:', fetchError);
          displayMessage('error', `Network error: ${fetchError.message}`);
        }
        // Reset loading state here to ensure it happens even when fetch fails
        console.log('Setting loading state to false due to fetch error');
        setEditGameLoading(false);
      }
    } catch (error) {
      // Handle any other errors in the outer try/catch
      console.error('Error in save operation:', error);
      displayMessage('error', `Error: ${error.message}`);
      // Reset loading state here to ensure it happens even when there's a general error
      console.log('Setting loading state to false due to general error');
      setEditGameLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setGamesPagination(prev => ({ ...prev, page: newPage }));
    loadGames(false);
  };

  onMount(() => {
    loadSettings();
    // No need to load other tabs on mount, createEffect handles it
  });

  // Keep track of previous tab to avoid unnecessary reloads
  const [previousTab, setPreviousTab] = createSignal("settings");
  
  createEffect(() => {
    const currentTab = activeTab();
    
    // Only load data if the tab has changed
    if (currentTab !== previousTab()) {
      if (currentTab === "games" && games().length === 0) loadGames();
      else if (currentTab === "sessions" && sessions().length === 0) loadSessions();
      else if (currentTab === "transactions" && transactions().length === 0) loadTransactions();
      else if (currentTab === "freespins" && freespins().length === 0) loadFreespins();
      
      setPreviousTab(currentTab);
    }
  });

  return (
    <div class="spin-shield-container">
      <style>{styles}</style>
      {/* Game Edit Modal */}
      <Show when={showEditModal()}>  
        <GameEditModal
          show={showEditModal()}
          onClose={closeEditModal}
          game={gameForm()}
          loading={editGameLoading()}
          onChange={handleGameFormChange}
          onSubmit={saveGameEdit}
        />
      </Show>

      <div class="shield-header">
        <h1 class="shield-title">Slots</h1>
        <div class="status-indicator">
          <div
            class="status-dot"
            style={`background-color: ${formData().active ? "#59E878" : "#FF5252"}`}
          ></div>
          <div class="status-text">
            {formData().active ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* Notification message */}
      <Show when={showNotification()}>
        <Notification type={message().type} message={message().text} />
      </Show>

      {/* Tab Navigation */}
      <nav class="tab-container">
       
        <button
          onClick={() => setActiveTab("games")}
          class={activeTab() === "games" ? "bevel-gold" : "bevel"}
          style="padding: 10px 15px; font-size: 14px; font-weight: 700; border-radius: 5px 5px 0 0; margin-bottom: -1px;"
        >
          Games
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          class={activeTab() === "sessions" ? "bevel-gold" : "bevel"}
          style="padding: 10px 15px; font-size: 14px; font-weight: 700; border-radius: 5px 5px 0 0; margin-bottom: -1px;"
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          class={activeTab() === "transactions" ? "bevel-gold" : "bevel"}
          style="padding: 10px 15px; font-size: 14px; font-weight: 700; border-radius: 5px 5px 0 0; margin-bottom: -1px;"
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("freespins")}
          class={activeTab() === "freespins" ? "bevel-gold" : "bevel"}
          style="padding: 10px 15px; font-size: 14px; font-weight: 700; border-radius: 5px 5px 0 0; margin-bottom: -1px;"
        >
          Free Spins
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          class={activeTab() === "settings" ? "bevel-gold" : "bevel"}
          style="padding: 10px 15px; font-size: 14px; font-weight: 700; border-radius: 5px 5px 0 0; margin-bottom: -1px;"
        >
          Settings
        </button>
      </nav>

      {/* Settings Tab */}
      <Show when={activeTab() === "settings"}>
        <div class="placeholder-content"> {/* Reusing placeholder-content for the general card style */}
          <form onSubmit={saveSettings}>
            <div class="form-group">
              <label class="form-label">API Login</label>
              <input
                type="text"
                name="api_login"
                value={formData().api_login}
                onInput={handleInputChange}
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">API Password</label>
              <input
                type="password"
                name="api_password"
                value={formData().api_password}
                onInput={handleInputChange}
                class="form-input"
                placeholder={settings().id ? "Leave blank to keep current password" : ""}
                required={!settings().id}
              />
              <p class="form-input-hint">Only fill this if you want to change the password.</p>
            </div>
            <div class="form-group">
              <label class="form-label">API Endpoint</label>
              <input
                type="text"
                name="endpoint"
                value={formData().endpoint}
                onInput={handleInputChange}
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Callback URL</label>
              <input
                type="text"
                name="callback_url"
                value={formData().callback_url}
                onInput={handleInputChange}
                class="form-input"
                placeholder="https://yourdomain.com/api/spinshield/callback"
                required
              />
              <p class="form-input-hint">This URL is used by SpinShield to send game events to your platform.</p>
            </div>
            <div class="form-group">
              <label class="form-label">Salt Key</label>
              <input
                type="text"
                name="salt_key"
                value={formData().salt_key}
                onInput={handleInputChange}
                class="form-input"
                required
              />
              <p class="form-input-hint">A unique key used for secure communication.</p>
            </div>
            <div class="form-checkbox-wrapper">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData().active}
                onInput={handleInputChange}
              />
              <label for="active" class="form-label" style="margin-bottom: 0;">
                Enable SpinShield Integration
              </label>
            </div>
            <div class="form-submit">
              <button
                type="submit"
                class="bevel-gold"
                disabled={loading()}
              >
                {loading() ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </Show>

      {/* Games Tab */}
      <Show when={activeTab() === "games"}>
        <div class="games-container-in">
          <div class="games-header">
            <h2 class="games-title">Game Library - {totalGames()} games</h2>
            <button
              onClick={syncGames}
              class="bevel-gold"
              disabled={loading()}
            >
              {loading() ? "Syncing..." : "Sync Games"}
            </button>
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
                onClick={() => loadGames(true)}
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
              <div class="filter-checkbox-wrapper">
                <input 
                  id="filter-mobile" 
                  type="checkbox" 
                  checked={activeFilters().features.includes('mobile')}
                  onChange={() => handleFilterChange('feature', 'mobile')}
                />
                <label for="filter-mobile">Mobile</label>
              </div>
              
              <div class="filter-checkbox-wrapper">
                <input 
                  id="filter-freerounds" 
                  type="checkbox" 
                  checked={activeFilters().features.includes('freerounds')}
                  onChange={() => handleFilterChange('feature', 'freerounds')}
                />
                <label for="filter-freerounds">Free Rounds</label>
              </div>
              
              <div class="filter-checkbox-wrapper">
                <input 
                  id="filter-featurebuy" 
                  type="checkbox" 
                  checked={activeFilters().features.includes('featurebuy')}
                  onChange={() => handleFilterChange('feature', 'featurebuy')}
                />
                <label for="filter-featurebuy">Feature Buy</label>
              </div>
              
              <div class="filter-checkbox-wrapper">
                <input 
                  id="filter-jackpot" 
                  type="checkbox" 
                  checked={activeFilters().features.includes('jackpot')}
                  onChange={() => handleFilterChange('feature', 'jackpot')}
                />
                <label for="filter-jackpot">Jackpot</label>
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
                      <div class="game-actions">
                        <button 
                          class="edit-game-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(game.id);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <div class="game-image-container">
                        <Show when={game.image_url || game.image_square || game.image_portrait} fallback={
                          <div class="game-image-placeholder">
                            <span>{game.game_name.charAt(0)}</span>
                          </div>
                        }>
                          <img 
                            src={game.image_square || game.image_portrait || game.image_url} 
                            alt={game.game_name} 
                            class="game-image" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div class="game-image-placeholder" style="display: none;">
                            <span>{game.game_name.charAt(0)}</span>
                          </div>
                        </Show>
                      </div>
                      <div class="game-details">
                        <h3 class="game-name">{game.game_name}</h3>
                        <p class="game-provider">{game.provider}</p>
                        <div class="game-badges">
                          <span class="game-category">{game.category}</span>
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
        </div>
      </Show>

      {/* Basic placeholder for other tabs */}
      <Show when={activeTab() === "sessions"}>
        <div class="placeholder-content">
          <h2 style="color: var(--gold); font-size: 18px; margin-bottom: 15px;">Game Sessions</h2>
          <p>Detailed implementation of sessions table will go here</p>
        </div>
      </Show>

      <Show when={activeTab() === "transactions"}>
        <div class="placeholder-content">
          <h2 style="color: var(--gold); font-size: 18px; margin-bottom: 15px;">Transactions</h2>
          <p>Detailed implementation of transactions table will go here</p>
        </div>
      </Show>

      <Show when={activeTab() === "freespins"}>
        <div class="placeholder-content">
          <h2 style="color: var(--gold); font-size: 18px; margin-bottom: 15px;">Free Spins</h2>
          <p>Detailed implementation of free spins management will go here</p>
        </div>
      </Show>
      
      {/* Game Edit Modal */}
      <GameEditModal 
        show={showEditModal()} 
        onClose={closeEditModal} 
        game={gameForm()} 
        loading={editGameLoading()} 
        onChange={handleGameFormChange} 
        onSubmit={saveGameEdit} 
      />
    </div>
  );
};

export default SpinShield;