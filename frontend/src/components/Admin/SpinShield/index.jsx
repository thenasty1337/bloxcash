import { createSignal, createEffect, onMount, Show, For } from "solid-js";
import { authedAPI, createNotification, API_BASE_URL } from "../../../util/api";
import { spinshieldStyles } from "./styles";
import Notification from "./Notification";
import GameEditModal from "./GameEditModal";
import SettingsTab from "./SettingsTab";
import GamesTab from "./GamesTab";
import SessionsTab from "./SessionsTab";
import TransactionsTab from "./TransactionsTab";
import FreespinsTab from "./FreespinsTab";
import "./tabStyles.css";

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
  const [editGameLoading, setEditGameLoading] = createSignal(false);
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
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setGamesPagination(prev => ({ ...prev, page: newPage }));
    loadGames(false); // false means don't reset to page 0
  };
  
  // Open edit modal for a specific game
  const openEditModal = async (gameId) => {
    try {
      // Make sure loading state is reset at the beginning
      setEditGameLoading(false);
      // Temporarily set loading to true while fetching data
      setEditGameLoading(true);
      
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
        
        // Set the form data with properly processed values BEFORE showing the modal
        setGameForm(processedData);
        
        // IMPORTANT: Reset loading state BEFORE showing the modal
        setEditGameLoading(false);
        
        // Only show the modal after data is loaded and processed and loading state is reset
        setShowEditModal(true);
      } else {
        displayMessage('error', 'Failed to load game details - invalid response format');
      }
    } catch (error) {
      console.error('Error loading game details:', error);
      displayMessage('error', `Failed to load game details: ${error.message}`);
    } finally {
      // Make absolutely sure loading state is false
      setEditGameLoading(false);
    }
  };
  
  // Close edit modal
  const closeEditModal = () => {
    // Always reset loading state when closing modal
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
    
    // First ensure we're not already in a loading state
    if (editGameLoading()) {
      return;
    }
    
    if (!editingGame()) {
      console.error('No game being edited');
      return;
    }
    
    try {
      setEditGameLoading(true);
      const gameData = gameForm();
      const response = await fetch(`${API_BASE_URL}/admin/spinshield/games/${editingGame().id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating game: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        displayMessage('success', 'Game updated successfully');
        // Refresh games list to show changes
        loadGames(false);
        // Close the modal
        closeEditModal();
      } else {
        displayMessage('error', data.error || 'Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      displayMessage('error', `Failed to update game: ${error.message}`);
    } finally {
      setEditGameLoading(false);
    }
  };

  // Load initial data when component mounts
  onMount(() => {
    loadSettings();
    loadGames();
    
    // Add tab-specific data loading based on active tab
    createEffect(() => {
      const tab = activeTab();
      if (tab === "sessions") {
        loadSessions();
      } else if (tab === "transactions") {
        loadTransactions();
      } else if (tab === "freespins") {
        loadFreespins();
      }
    });
  });

  return (
    <div class="spin-shield-container">
      <style>{spinshieldStyles}</style>

      {/* Notification message */}
      <Show when={showNotification()}>
        <Notification type={message().type} message={message().text} />
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

      {/* Tab Navigation */}
      <nav class="tab-container">
        <button
          onClick={() => setActiveTab("games")}
          class={`tab-button ${activeTab() === "games" ? "active" : ""}`}
        >
          Games
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          class={`tab-button ${activeTab() === "sessions" ? "active" : ""}`}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          class={`tab-button ${activeTab() === "transactions" ? "active" : ""}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("freespins")}
          class={`tab-button ${activeTab() === "freespins" ? "active" : ""}`}
        >
          Free Spins
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          class={`tab-button ${activeTab() === "settings" ? "active" : ""}`}
        >
          Settings
        </button>
      </nav>

      {/* Settings Tab */}
      <Show when={activeTab() === "settings"}>
        <SettingsTab 
          formData={formData}
          settings={settings}
          loading={loading}
          handleInputChange={handleInputChange}
          saveSettings={saveSettings}
        />
      </Show>

      {/* Games Tab */}
      <Show when={activeTab() === "games"}>
        <GamesTab 
          games={games}
          gamesLoading={gamesLoading}
          totalGames={totalGames}
          loading={loading}
          syncGames={syncGames}
          gamesPagination={gamesPagination}
          gamesFilters={gamesFilters}
          gamesSort={gamesSort}
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
          handleSortChange={handleSortChange}
          handlePageChange={handlePageChange}
          setGamesSort={setGamesSort}
          openEditModal={openEditModal}
        />
      </Show>

      {/* Sessions Tab */}
      <Show when={activeTab() === "sessions"}>
        <SessionsTab sessions={sessions} loading={loading} />
      </Show>

      {/* Transactions Tab */}
      <Show when={activeTab() === "transactions"}>
        <TransactionsTab transactions={transactions} loading={loading} />
      </Show>

      {/* Freespins Tab */}
      <Show when={activeTab() === "freespins"}>
        <FreespinsTab freespins={freespins} loading={loading} />
      </Show>
      
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
    </div>
  );
};

export default SpinShield;
