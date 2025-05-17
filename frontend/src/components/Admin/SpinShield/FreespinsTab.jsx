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
    <div class="freespins-tab">
      <div class="tab-header">
        <h2 class="tab-title">Free Spins Management</h2>
        <button class="add-btn" onClick={toggleAddForm}>
          {showAddForm() ? "Cancel" : "+ Add Free Spins"}
        </button>
      </div>
      
      {/* Add Free Spins Form */}
      <Show when={showAddForm()}>
        <div class="add-freespins-form">
          <h3>Add Free Spins to User</h3>
          <form onSubmit={submitAddFreespins}>
            <div class="form-row">
              <div class="form-group">
                <label>User</label>
                <div class="search-input-container">
                  <input 
                    type="text" 
                    placeholder="Search for user..." 
                    value={userSearchTerm()} 
                    onInput={handleUserSearch}
                    class="search-input"
                  />
                  <Show when={userSearchResults().length > 0}>
                    <div class="search-results">
                      <For each={userSearchResults()}>
                        {(user) => (
                          <div class="search-result-item" onClick={() => selectUser(user)}>
                            {user.username}
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
                <Show when={addFormData().userId}>
                  <div class="selected-item">
                    Selected: <strong>{addFormData().userName}</strong>
                  </div>
                </Show>
              </div>
              
              <div class="form-group">
                <label>Game</label>
                <div class="search-input-container">
                  <input 
                    type="text" 
                    placeholder="Search for game..." 
                    value={gameSearchTerm()} 
                    onInput={handleGameSearch}
                    class="search-input"
                  />
                  <Show when={gameSearchResults().length > 0}>
                    <div class="search-results">
                      <For each={gameSearchResults()}>
                        {(game) => (
                          <div class="search-result-item" onClick={() => selectGame(game)}>
                            {game.game_name} ({game.provider})
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
                <Show when={addFormData().gameId}>
                  <div class="selected-item">
                    Selected: <strong>{addFormData().gameName}</strong>
                  </div>
                </Show>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Number of Free Spins</label>
                <input 
                  type="number" 
                  min="1" 
                  max="1000" 
                  value={addFormData().freespinsCount} 
                  onInput={(e) => updateFormField("freespinsCount", e.target.value)}
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Bet Level (cents)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={addFormData().betLevel} 
                  onInput={(e) => updateFormField("betLevel", e.target.value)}
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Valid for (days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30" 
                  value={addFormData().validDays} 
                  onInput={(e) => updateFormField("validDays", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="submit-btn" disabled={formLoading()}>
                {formLoading() ? "Adding..." : "Add Free Spins"}
              </button>
            </div>
          </form>
        </div>
      </Show>
      
      {/* Free Spins List */}
      <div class="filter-container">
        <div class="search-filter">
          <input 
            type="text" 
            placeholder="Search by User ID or Game ID..." 
            value={searchTerm()} 
            onInput={handleSearch}
            class="search-input"
          />
        </div>
        
        <div class="status-filter">
          <button 
            class={`filter-btn ${activeFilter() === "all" ? "active" : ""}`}
            onClick={() => handleActiveFilter("all")}
          >
            All
          </button>
          <button 
            class={`filter-btn ${activeFilter() === "active" ? "active" : ""}`}
            onClick={() => handleActiveFilter("active")}
          >
            Active
          </button>
          <button 
            class={`filter-btn ${activeFilter() === "expired" ? "active" : ""}`}
            onClick={() => handleActiveFilter("expired")}
          >
            Expired
          </button>
        </div>
      </div>
      
      <Show when={!loading()} fallback={<div class="loading">Loading free spins...</div>}>
        <Show when={filteredFreespins().length > 0} fallback={<div class="no-data">No free spins found</div>}>
          <div class="table-container">
            <table class="data-table freespins-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} class={sortField() === "id" ? sortOrder() : ""}>
                    ID
                  </th>
                  <th onClick={() => handleSort("user_id")} class={sortField() === "user_id" ? sortOrder() : ""}>
                    User
                  </th>
                  <th onClick={() => handleSort("game_id")} class={sortField() === "game_id" ? sortOrder() : ""}>
                    Game
                  </th>
                  <th onClick={() => handleSort("freespins_count")} class={sortField() === "freespins_count" ? sortOrder() : ""}>
                    Total
                  </th>
                  <th onClick={() => handleSort("freespins_performed")} class={sortField() === "freespins_performed" ? sortOrder() : ""}>
                    Used
                  </th>
                  <th onClick={() => handleSort("bet_level")} class={sortField() === "bet_level" ? sortOrder() : ""}>
                    Bet Level
                  </th>
                  <th onClick={() => handleSort("freespins_wallet")} class={sortField() === "freespins_wallet" ? sortOrder() : ""}>
                    Wallet
                  </th>
                  <th onClick={() => handleSort("valid_until")} class={sortField() === "valid_until" ? sortOrder() : ""}>
                    Expires
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={paginatedFreespins()}>
                  {(freespin) => {
                    const active = isActive(freespin);
                    const remaining = getRemainingTime(freespin.valid_until);
                    
                    return (
                      <tr class={!active ? "expired-row" : ""}>
                        <td>{freespin.id}</td>
                        <td title={freespin.user_id}>{freespin.user_id.substring(0, 8)}...</td>
                        <td title={freespin.game_id}>{freespin.game_id.substring(0, 10)}...</td>
                        <td>{freespin.freespins_count}</td>
                        <td>{freespin.freespins_performed}</td>
                        <td>{(freespin.bet_level / 100).toFixed(2)} {freespin.currency}</td>
                        <td>{(freespin.freespins_wallet / 100).toFixed(2)} {freespin.currency}</td>
                        <td title={formatDate(freespin.valid_until)}>{remaining}</td>
                        <td>
                          <span class={`status-badge ${active ? "active" : "expired"}`}>
                            {active ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td>
                          <Show when={active}>
                            <button 
                              class="action-btn deactivate-btn" 
                              title="Deactivate free spins"
                              onClick={() => deactivateFreespins(freespin.id)}
                            >
                              <i class="fas fa-ban"></i>
                            </button>
                          </Show>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div class="pagination">
            <button 
              class="pagination-btn" 
              disabled={currentPage() === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span class="pagination-info">
              Page {currentPage()} of {totalPages()}
            </span>
            <button 
              class="pagination-btn" 
              disabled={currentPage() === totalPages()}
              onClick={() => setCurrentPage(prev => Math.min(totalPages(), prev + 1))}
            >
              Next
            </button>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default FreespinsTab;
