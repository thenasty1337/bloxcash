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
    <div class="sessions-tab">
      <div class="tab-header">
        <h2 class="tab-title">Game Sessions</h2>
        <div class="tab-actions">
          <div class="search-filter">
            <input 
              type="text" 
              placeholder="Search by ID or User ID..." 
              value={searchTerm()} 
              onInput={handleSearch}
              class="search-input"
            />
            <div class="status-filter">
              <button 
                class={`filter-btn ${statusFilter() === "all" ? "active" : ""}`}
                onClick={() => handleStatusFilter("all")}
              >
                All
              </button>
              <button 
                class={`filter-btn ${statusFilter() === "active" ? "active" : ""}`}
                onClick={() => handleStatusFilter("active")}
              >
                Active
              </button>
              <button 
                class={`filter-btn ${statusFilter() === "completed" ? "active" : ""}`}
                onClick={() => handleStatusFilter("completed")}
              >
                Completed
              </button>
              <button 
                class={`filter-btn ${statusFilter() === "expired" ? "active" : ""}`}
                onClick={() => handleStatusFilter("expired")}
              >
                Expired
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Show when={!loading()} fallback={<div class="loading">Loading sessions...</div>}>
        <Show when={filteredSessions().length > 0} fallback={<div class="no-data">No sessions found</div>}>
          <div class="table-container">
            <table class="data-table sessions-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("session_id")} class={sortField() === "session_id" ? sortOrder() : ""}>
                    Session ID
                  </th>
                  <th onClick={() => handleSort("user_id")} class={sortField() === "user_id" ? sortOrder() : ""}>
                    User ID
                  </th>
                  <th onClick={() => handleSort("game_id")} class={sortField() === "game_id" ? sortOrder() : ""}>
                    Game ID
                  </th>
                  <th onClick={() => handleSort("currency")} class={sortField() === "currency" ? sortOrder() : ""}>
                    Currency
                  </th>
                  <th onClick={() => handleSort("status")} class={sortField() === "status" ? sortOrder() : ""}>
                    Status
                  </th>
                  <th onClick={() => handleSort("started_at")} class={sortField() === "started_at" ? sortOrder() : ""}>
                    Started
                  </th>
                  <th onClick={() => handleSort("ended_at")} class={sortField() === "ended_at" ? sortOrder() : ""}>
                    Ended
                  </th>
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
                          class="action-btn view-btn" 
                          title="View session details"
                          onClick={() => window.location.href = `/admin/spinshield/session/${session.id}`}
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <Show when={session.status === "active"}>
                          <button 
                            class="action-btn end-btn" 
                            title="End session"
                            onClick={() => {
                              if (confirm("Are you sure you want to end this session?")) {
                                // TODO: Implement end session functionality
                                alert("End session functionality to be implemented");
                              }
                            }}
                          >
                            <i class="fas fa-stop-circle"></i>
                          </button>
                        </Show>
                      </td>
                    </tr>
                  )}
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

export default SessionsTab;
