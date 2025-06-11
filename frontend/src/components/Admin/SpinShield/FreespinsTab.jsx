import { createSignal, createEffect, Show, For } from "solid-js";
import { format, addDays, isAfter } from "date-fns";
import { authedAPI } from "../../../util/api";

const FreespinsTab = (props) => {
  const { freespins, loading } = props;
  
  // State for the free spins list and filtering
  const [searchTerm, setSearchTerm] = createSignal("");
  const [activeFilter, setActiveFilter] = createSignal("all"); // all, active, expired
  const [sortField, setSortField] = createSignal("created_at");
  const [sortOrder, setSortOrder] = createSignal("desc");
  const [currentPage, setCurrentPage] = createSignal(1);
  const [itemsPerPage] = createSignal(10);
  
  // State for the add free spins form
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [formLoading, setFormLoading] = createSignal(false);
  const [userSearchTerm, setUserSearchTerm] = createSignal("");
  const [userSearchResults, setUserSearchResults] = createSignal([]);
  const [gameSearchTerm, setGameSearchTerm] = createSignal("");
  const [gameSearchResults, setGameSearchResults] = createSignal([]);
  const [addFormData, setAddFormData] = createSignal({
    userId: "",
    userName: "",
    gameId: "",
    gameName: "",
    freespinsCount: 10,
    betLevel: 1,
    validDays: 7
  });
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate if free spins are active
  const isActive = (freespin) => {
    const now = new Date();
    const validUntil = new Date(freespin.valid_until);
    return freespin.active && isAfter(validUntil, now);
  };
  
  // Calculate remaining time
  const getRemainingTime = (validUntil) => {
    if (!validUntil) return "Expired";
    
    const now = new Date();
    const expiryDate = new Date(validUntil);
    
    if (isAfter(now, expiryDate)) return "Expired";
    
    const diffMs = expiryDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
  };
  
  // Get filtered and sorted free spins
  const filteredFreespins = () => {
    const search = searchTerm().toLowerCase();
    const active = activeFilter();
    const now = new Date();
    
    return freespins().filter(fs => {
      // Search filter
      const matchesSearch = 
        `${fs.user_id}`.toLowerCase().includes(search) ||
        fs.game_id?.toLowerCase().includes(search);
      
      // Active filter
      let matchesActive = true;
      
      if (active === "active") {
        matchesActive = fs.active && isAfter(new Date(fs.valid_until), now);
      } else if (active === "expired") {
        matchesActive = !fs.active || !isAfter(new Date(fs.valid_until), now);
      }
      
      return matchesSearch && matchesActive;
    }).sort((a, b) => {
      const field = sortField();
      const order = sortOrder() === "asc" ? 1 : -1;
      
      if (a[field] === null) return 1 * order;
      if (b[field] === null) return -1 * order;
      
      if (field === "created_at" || field === "valid_until" || field === "updated_at") {
        return (new Date(a[field]) - new Date(b[field])) * order;
      }
      
      if (field === "freespins_count" || field === "freespins_performed" || field === "bet_level") {
        return (Number(a[field]) - Number(b[field])) * order;
      }
      
      if (typeof a[field] === "string") {
        return a[field].localeCompare(b[field]) * order;
      }
      
      return (a[field] - b[field]) * order;
    });
  };
  
  // Get paginated free spins
  const paginatedFreespins = () => {
    const filtered = filteredFreespins();
    const startIndex = (currentPage() - 1) * itemsPerPage();
    return filtered.slice(startIndex, startIndex + itemsPerPage());
  };
  
  // Calculate total pages
  const totalPages = () => {
    return Math.ceil(filteredFreespins().length / itemsPerPage()) || 1;
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle active filter
  const handleActiveFilter = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField() === field) {
      setSortOrder(sortOrder() === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  // Toggle add form
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm());
    // Reset form data if closing
    if (showAddForm()) {
      setAddFormData({
        userId: "",
        userName: "",
        gameId: "",
        gameName: "",
        freespinsCount: 10,
        betLevel: 1,
        validDays: 7
      });
      setUserSearchResults([]);
      setGameSearchResults([]);
    }
  };
  
  // Search users
  const searchUsers = async (term) => {
    if (!term || term.length < 2) {
      setUserSearchResults([]);
      return;
    }
    
    try {
      const response = await authedAPI(`/admin/users/search?term=${term}`, 'GET');
      if (response && response.users) {
        setUserSearchResults(response.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUserSearchResults([]);
    }
  };
  
  // Handle user search
  const handleUserSearch = (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);
    
    // Debounce the search
    clearTimeout(window.userSearchTimeout);
    window.userSearchTimeout = setTimeout(() => {
      searchUsers(term);
    }, 300);
  };
  
  // Select a user
  const selectUser = (user) => {
    setAddFormData(prev => ({
      ...prev,
      userId: user.id,
      userName: user.username
    }));
    setUserSearchTerm(user.username);
    setUserSearchResults([]);
  };
  
  // Search games
  const searchGames = async (term) => {
    if (!term || term.length < 2) {
      setGameSearchResults([]);
      return;
    }
    
    try {
      const response = await authedAPI(`/admin/spinshield/games?search=${term}&limit=10`, 'GET');
      if (response && response.games) {
        setGameSearchResults(response.games);
      }
    } catch (error) {
      console.error("Error searching games:", error);
      setGameSearchResults([]);
    }
  };
  
  // Handle game search
  const handleGameSearch = (e) => {
    const term = e.target.value;
    setGameSearchTerm(term);
    
    // Debounce the search
    clearTimeout(window.gameSearchTimeout);
    window.gameSearchTimeout = setTimeout(() => {
      searchGames(term);
    }, 300);
  };
  
  // Select a game
  const selectGame = (game) => {
    setAddFormData(prev => ({
      ...prev,
      gameId: game.game_id,
      gameName: game.game_name
    }));
    setGameSearchTerm(game.game_name);
    setGameSearchResults([]);
  };
  
  // Update form field
  const updateFormField = (field, value) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Submit add free spins form
  const submitAddFreespins = async (e) => {
    e.preventDefault();
    
    const formData = addFormData();
    
    // Validate form
    if (!formData.userId || !formData.gameId || !formData.freespinsCount || !formData.betLevel) {
      alert("Please fill all required fields");
      return;
    }
    
    setFormLoading(true);
    
    try {
      const payload = {
        userId: formData.userId,
        gameId: formData.gameId,
        freespinsCount: Number(formData.freespinsCount),
        betLevel: Number(formData.betLevel),
        validDays: Number(formData.validDays)
      };
      
      const response = await authedAPI('/admin/spinshield/add-freespins', 'POST', payload);
      
      if (response && response.success) {
        alert("Free spins added successfully!");
        // Reload free spins
        if (props.loadFreespins) {
          props.loadFreespins();
        }
        // Close form
        toggleAddForm();
      } else {
        alert(`Failed to add free spins: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding free spins:", error);
      alert(`Error adding free spins: ${error.message || 'Unknown error'}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  // Deactivate free spins
  const deactivateFreespins = async (id) => {
    if (!confirm("Are you sure you want to deactivate these free spins?")) {
      return;
    }
    
    try {
      const response = await authedAPI(`/admin/spinshield/freespins/${id}/deactivate`, 'POST');
      
      if (response && response.success) {
        alert("Free spins deactivated successfully!");
        // Reload free spins
        if (props.loadFreespins) {
          props.loadFreespins();
        }
      } else {
        alert(`Failed to deactivate free spins: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deactivating free spins:", error);
      alert(`Error deactivating free spins: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div class="games-container-in">
      <div class="games-header">
        <h2 class="games-title">Free Spins</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm())}
          class="bevel-button"
          style="font-size: 14px; padding: 8px 15px;"
        >
          {showAddForm() ? "Cancel" : "Add Free Spins"}
        </button>
      </div>

      {/* Add Free Spins Form */}
      <Show when={showAddForm()}>
        <div class="filters-container" style="padding-bottom: 20px;">
          <form onSubmit={(e) => {
            e.preventDefault();
            submitAddFreespins(e);
          }}>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="filter-group">
                <label class="filter-label">User</label>
                <div style="position: relative;">
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Search by username or ID..."
                    value={userSearchTerm()}
                    onInput={handleUserSearch}
                  />
                  <Show when={userSearchResults().length > 0}>
                    <div style="position: absolute; z-index: 10; background: #1E1A3A; width: 100%; max-height: 200px; overflow-y: auto; border: 1px solid #4A4581; border-top: none; border-radius: 0 0 5px 5px;">
                      <For each={userSearchResults()}>
                        {(user) => (
                          <div
                            onClick={() => selectUser(user)}
                            class="dropdown-item"
                          >
                            {user.username} (ID: {user.id})
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Game</label>
                <div style="position: relative;">
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Search by game name..."
                    value={gameSearchTerm()}
                    onInput={handleGameSearch}
                  />
                  <Show when={gameSearchResults().length > 0}>
                    <div style="position: absolute; z-index: 10; background: #1E1A3A; width: 100%; max-height: 200px; overflow-y: auto; border: 1px solid #4A4581; border-top: none; border-radius: 0 0 5px 5px;">
                      <For each={gameSearchResults()}>
                        {(game) => (
                          <div
                            onClick={() => selectGame(game)}
                            class="dropdown-item"
                          >
                            {game.game_name} ({game.provider})
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Number of Free Spins</label>
                <input
                  type="number"
                  class="filter-select"
                  min="1"
                  max="100"
                  value={addFormData().freespinsCount}
                  onInput={(e) => updateFormField("freespinsCount", parseInt(e.target.value))}
                />
              </div>

              <div class="filter-group">
                <label class="filter-label">Bet Level (in cents)</label>
                <input
                  type="number"
                  class="filter-select"
                  min="1"
                  step="1"
                  value={addFormData().betLevel}
                  onInput={(e) => updateFormField("betLevel", parseInt(e.target.value))}
                />
              </div>

              <div class="filter-group">
                <label class="filter-label">Valid for (days)</label>
                <input
                  type="number"
                  class="filter-select"
                  min="1"
                  max="30"
                  value={addFormData().validDays}
                  onInput={(e) => updateFormField("validDays", parseInt(e.target.value))}
                />
              </div>

              <div class="filter-group" style="display: flex; align-items: flex-end;">
                <button
                  type="submit"
                  class="bevel-button"
                  style="margin-top: 10px; width: 100%;"
                  disabled={formLoading() || !addFormData().userId || !addFormData().gameId}
                >
                  {formLoading() ? "Adding..." : "Add Free Spins"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Show>

      {/* Filters */}
      <div class="filters-container">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search by User ID or Game ID..." 
            value={searchTerm()} 
            onInput={handleSearch}
            class="search-input"
          />
          <button 
            class="search-button" 
            onClick={() => handleSearch({ target: { value: searchTerm() } })}
            disabled={loading()}
          >
            🔍
          </button>
        </div>
        
        <div class="filter-selects">
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select 
              class="filter-select" 
              value={activeFilter()} 
              onChange={(e) => handleActiveFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select 
              class="filter-select" 
              value={sortField()} 
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="created_at">Date Added</option>
              <option value="valid_until">Expiry Date</option>
              <option value="freespins_count">Number of Spins</option>
              <option value="freespins_performed">Spins Performed</option>
              <option value="bet_level">Bet Level</option>
            </select>
          </div>
          
          <div class="filter-group small">
            <label class="filter-label">Order</label>
            <select 
              class="filter-select" 
              value={sortOrder()} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
      
      <Show when={!loading()} fallback={
        <div class="games-loading">
          <div class="spinner"></div>
          <p>Loading free spins...</p>
        </div>
      }>
        <Show when={filteredFreespins().length > 0} fallback={
          <div class="empty-games-message">
            <p>No free spins found. Try adjusting your filters or add new free spins.</p>
          </div>
        }>
          <div class="table-container">
            <table class="games-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("user_id")}>User ID</th>
                  <th onClick={() => handleSort("game_id")}>Game ID</th>
                  <th onClick={() => handleSort("freespins_count")}>Total Spins</th>
                  <th onClick={() => handleSort("freespins_performed")}>Used</th>
                  <th onClick={() => handleSort("bet_level")}>Bet Level</th>
                  <th onClick={() => handleSort("created_at")}>Created</th>
                  <th onClick={() => handleSort("valid_until")}>Expires</th>
                  <th onClick={() => handleSort("active")}>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={paginatedFreespins()}>
                  {(freespin) => (
                    <tr>
                      <td title={freespin.user_id}>{freespin.user_id.substring(0, 8)}...</td>
                      <td title={freespin.game_id}>{freespin.game_id.substring(0, 10)}...</td>
                      <td>{freespin.freespins_count}</td>
                      <td>{freespin.freespins_performed}</td>
                      <td>{(freespin.bet_level / 100).toFixed(2)}</td>
                      <td>{formatDate(freespin.created_at)}</td>
                      <td title={formatDate(freespin.valid_until)}>{getRemainingTime(freespin.valid_until)}</td>
                      <td>
                        <span style={{
                          color: isActive(freespin) ? "#59E878" : "#FF5252",
                          fontWeight: "500"
                        }}>
                          {isActive(freespin) ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td>
                        <Show when={isActive(freespin)}>
                          <button 
                            class="bevel-button cancel" 
                            style="padding: 5px 10px; font-size: 12px;"
                            onClick={() => {
                              if (confirm("Are you sure you want to deactivate these free spins?")) {
                                deactivateFreespins(freespin.id);
                              }
                            }}
                          >
                            Deactivate
                          </button>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          
          <div class="pagination-controls">
            <button 
              class="pagination-button" 
              disabled={currentPage() === 1 || loading()}
              onClick={() => setCurrentPage(1)}
            >
              &lt;&lt;
            </button>
            <button 
              class="pagination-button" 
              disabled={currentPage() === 1 || loading()}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              &lt;
            </button>
            
            <span class="pagination-info">
              Page {currentPage()} of {totalPages()}
            </span>
            
            <button 
              class="pagination-button" 
              disabled={currentPage() === totalPages() || loading()}
              onClick={() => setCurrentPage(prev => Math.min(totalPages(), prev + 1))}
            >
              &gt;
            </button>
            <button 
              class="pagination-button" 
              disabled={currentPage() === totalPages() || loading()}
              onClick={() => setCurrentPage(totalPages())}
            >
              &gt;&gt;
            </button>
          </div>
        </Show>
      </Show>
      
      <style jsx>{`
        .dropdown-item {
          padding: 8px 10px;
          cursor: pointer;
          border-bottom: 1px solid #4A4581;
          color: #ADA3EF;
          background: transparent;
          transition: background-color 0.2s ease;
        }
        
        .dropdown-item:hover {
          background: #312A5E;
        }
      `}</style>
    </div>
  );
};

export default FreespinsTab;
