import { createSignal, createEffect, Show, For } from "solid-js";
import { format } from "date-fns";

const SessionsTab = (props) => {
  const { sessions, loading } = props;
  const [searchTerm, setSearchTerm] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal("all");
  const [sortField, setSortField] = createSignal("started_at");
  const [sortOrder, setSortOrder] = createSignal("desc");
  const [currentPage, setCurrentPage] = createSignal(1);
  const [itemsPerPage] = createSignal(10);
  
  // Filtered and sorted sessions
  const filteredSessions = () => {
    const search = searchTerm().toLowerCase();
    const status = statusFilter();
    
    return sessions().filter(session => {
      const matchesSearch = 
        session.game_id?.toLowerCase().includes(search) ||
        session.session_id?.toLowerCase().includes(search) ||
        `${session.user_id}`.toLowerCase().includes(search);
      
      const matchesStatus = status === "all" || session.status === status;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const field = sortField();
      const order = sortOrder() === "asc" ? 1 : -1;
      
      if (a[field] === null) return 1 * order;
      if (b[field] === null) return -1 * order;
      
      if (field === "started_at" || field === "ended_at") {
        return (new Date(a[field]) - new Date(b[field])) * order;
      }
      
      if (typeof a[field] === "string") {
        return a[field].localeCompare(b[field]) * order;
      }
      
      return (a[field] - b[field]) * order;
    });
  };
  
  // Paginated sessions
  const paginatedSessions = () => {
    const filtered = filteredSessions();
    const startIndex = (currentPage() - 1) * itemsPerPage();
    return filtered.slice(startIndex, startIndex + itemsPerPage());
  };
  
  // Total pages
  const totalPages = () => {
    return Math.ceil(filteredSessions().length / itemsPerPage()) || 1;
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };
  
  // Format status with color
  const formatStatus = (status) => {
    const statusColors = {
      active: "var(--success)",
      completed: "var(--gold)",
      expired: "var(--danger)"
    };
    
    return (
      <span style={{
        color: statusColors[status] || "var(--text-color)",
        "font-weight": "500"
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div class="games-container-in">
      <div class="games-header">
        <h2 class="games-title">Game Sessions</h2>
      </div>
      
      <div class="filters-container">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search by ID or User ID..." 
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
              value={statusFilter()} 
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
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
              <option value="session_id">Session ID</option>
              <option value="user_id">User ID</option>
              <option value="game_id">Game ID</option>
              <option value="status">Status</option>
              <option value="started_at">Started At</option>
              <option value="ended_at">Ended At</option>
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
          <p>Loading sessions...</p>
        </div>
      }>
        <Show when={filteredSessions().length > 0} fallback={
          <div class="empty-games-message">
            <p>No sessions found. Try adjusting your filters.</p>
          </div>
        }>
          <div class="table-container">
            <table class="games-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("session_id")}>Session ID</th>
                  <th onClick={() => handleSort("user_id")}>User ID</th>
                  <th onClick={() => handleSort("game_id")}>Game ID</th>
                  <th onClick={() => handleSort("currency")}>Currency</th>
                  <th onClick={() => handleSort("status")}>Status</th>
                  <th onClick={() => handleSort("started_at")}>Started</th>
                  <th onClick={() => handleSort("ended_at")}>Ended</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <For each={paginatedSessions()}>
                  {(session) => (
                    <tr>
                      <td title={session.session_id}>{session.session_id.substring(0, 10)}...</td>
                      <td>{session.user_id.substring(0, 8)}...</td>
                      <td title={session.game_id}>{session.game_id.substring(0, 15)}...</td>
                      <td>{session.currency}</td>
                      <td>{formatStatus(session.status)}</td>
                      <td>{formatDate(session.started_at)}</td>
                      <td>{formatDate(session.ended_at)}</td>
                      <td>
                        <button 
                          class="bevel-button" 
                          style="padding: 5px 10px; font-size: 12px;"
                          title="View session details"
                          onClick={() => window.location.href = `/admin/spinshield/session/${session.id}`}
                        >
                          View
                        </button>
                        <Show when={session.status === "active"}>
                          <button 
                            class="bevel-button cancel" 
                            style="padding: 5px 10px; font-size: 12px; margin-left: 5px;"
                            title="End session"
                            onClick={() => {
                              if (confirm("Are you sure you want to end this session?")) {
                                // TODO: Implement end session functionality
                                alert("End session functionality to be implemented");
                              }
                            }}
                          >
                            End
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
    </div>
  );
};

export default SessionsTab;
