import { createSignal, createEffect, Show, For } from "solid-js";
import { format } from "date-fns";

const TransactionsTab = (props) => {
  const { transactions, loading } = props;
  const [searchTerm, setSearchTerm] = createSignal("");
  const [actionFilter, setActionFilter] = createSignal("all");
  const [dateRange, setDateRange] = createSignal({ from: "", to: "" });
  const [sortField, setSortField] = createSignal("created_at");
  const [sortOrder, setSortOrder] = createSignal("desc");
  const [currentPage, setCurrentPage] = createSignal(1);
  const [itemsPerPage] = createSignal(10);

  // Calculate filtered transactions
  const filteredTransactions = () => {
    const search = searchTerm().toLowerCase();
    const action = actionFilter();
    const { from, to } = dateRange();
    
    return transactions().filter(tx => {
      // Search filter
      const matchesSearch = 
        tx.game_id?.toLowerCase().includes(search) ||
        tx.user_id?.toLowerCase().includes(search) ||
        tx.round_id?.toLowerCase().includes(search) ||
        tx.call_id?.toLowerCase().includes(search);
      
      // Action filter
      const matchesAction = action === "all" || tx.action === action;
      
      // Date range filter
      let matchesDateRange = true;
      if (from) {
        const fromDate = new Date(from);
        const txDate = new Date(tx.created_at);
        matchesDateRange = matchesDateRange && txDate >= fromDate;
      }
      
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // End of day
        const txDate = new Date(tx.created_at);
        matchesDateRange = matchesDateRange && txDate <= toDate;
      }
      
      return matchesSearch && matchesAction && matchesDateRange;
    }).sort((a, b) => {
      const field = sortField();
      const order = sortOrder() === "asc" ? 1 : -1;
      
      if (a[field] === null) return 1 * order;
      if (b[field] === null) return -1 * order;
      
      if (field === "created_at" || field === "timestamp") {
        return (new Date(a[field]) - new Date(b[field])) * order;
      }
      
      if (field === "amount" || field === "balance_before" || field === "balance_after") {
        return (Number(a[field]) - Number(b[field])) * order;
      }
      
      if (typeof a[field] === "string") {
        return a[field].localeCompare(b[field]) * order;
      }
      
      return (a[field] - b[field]) * order;
    });
  };
  
  // Get paginated transactions
  const paginatedTransactions = () => {
    const filtered = filteredTransactions();
    const startIndex = (currentPage() - 1) * itemsPerPage();
    return filtered.slice(startIndex, startIndex + itemsPerPage());
  };
  
  // Calculate total pages
  const totalPages = () => {
    return Math.ceil(filteredTransactions().length / itemsPerPage()) || 1;
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle date range change
  const handleDateChange = (type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle action filter
  const handleActionFilter = (action) => {
    setActionFilter(action);
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
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };
  
  // Format currency amount (cents to dollars)
  const formatAmount = (amount, currency) => {
    const dollars = (Number(amount) / 100).toFixed(2);
    return `${dollars} ${currency || "USD"}`;
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
  
  // Format action with color
  const formatAction = (action) => {
    const actionColors = {
      balance: "var(--info)",
      debit: "var(--danger)",
      credit: "var(--success)"
    };
    
    return (
      <span style={{
        color: actionColors[action] || "var(--text-color)",
        "font-weight": "500"
      }}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };
  
  // Calculate transaction stats
  const stats = () => {
    const filtered = filteredTransactions();
    
    // Initialize stats
    const stats = {
      totalTransactions: filtered.length,
      totalDebits: 0,
      totalCredits: 0,
      totalAmount: 0,
      netAmount: 0
    };
    
    // Calculate stats
    filtered.forEach(tx => {
      const amount = Number(tx.amount);
      
      if (tx.action === "debit") {
        stats.totalDebits++;
        stats.totalAmount += amount;
        stats.netAmount -= amount;
      } else if (tx.action === "credit") {
        stats.totalCredits++;
        stats.totalAmount += amount;
        stats.netAmount += amount;
      }
    });
    
    return stats;
  };

  return (
    <div class="transactions-tab">
      <div class="tab-header">
        <h2 class="tab-title">Transactions</h2>
        <div class="tab-stats">
          <div class="stat-card">
            <div class="stat-value">{stats().totalTransactions}</div>
            <div class="stat-label">Transactions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats().totalDebits}</div>
            <div class="stat-label">Bets</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{stats().totalCredits}</div>
            <div class="stat-label">Wins</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style={{
              color: stats().netAmount >= 0 ? "var(--success)" : "var(--danger)"
            }}>
              {formatAmount(Math.abs(stats().netAmount), "USD")}
            </div>
            <div class="stat-label">{stats().netAmount >= 0 ? "Player Profit" : "House Edge"}</div>
          </div>
        </div>
      </div>
      
      <div class="filters-container">
        <div class="search-filter">
          <input 
            type="text" 
            placeholder="Search by Game ID, User ID, Round ID..." 
            value={searchTerm()} 
            onInput={handleSearch}
            class="search-input"
          />
        </div>
        
        <div class="date-filter">
          <div class="date-input-group">
            <label>From:</label>
            <input 
              type="date" 
              value={dateRange().from} 
              onChange={(e) => handleDateChange("from", e.target.value)}
            />
          </div>
          <div class="date-input-group">
            <label>To:</label>
            <input 
              type="date" 
              value={dateRange().to} 
              onChange={(e) => handleDateChange("to", e.target.value)}
            />
          </div>
        </div>
        
        <div class="action-filter">
          <button 
            class={`filter-btn ${actionFilter() === "all" ? "active" : ""}`}
            onClick={() => handleActionFilter("all")}
          >
            All
          </button>
          <button 
            class={`filter-btn ${actionFilter() === "balance" ? "active" : ""}`}
            onClick={() => handleActionFilter("balance")}
          >
            Balance
          </button>
          <button 
            class={`filter-btn ${actionFilter() === "debit" ? "active" : ""}`}
            onClick={() => handleActionFilter("debit")}
          >
            Bets
          </button>
          <button 
            class={`filter-btn ${actionFilter() === "credit" ? "active" : ""}`}
            onClick={() => handleActionFilter("credit")}
          >
            Wins
          </button>
        </div>
        
        <button class="reset-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      <Show when={!loading()} fallback={<div class="loading">Loading transactions...</div>}>
        <Show when={filteredTransactions().length > 0} fallback={<div class="no-data">No transactions found</div>}>
          <div class="table-container">
            <table class="data-table transactions-table">
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
                  <th onClick={() => handleSort("round_id")} class={sortField() === "round_id" ? sortOrder() : ""}>
                    Round
                  </th>
                  <th onClick={() => handleSort("action")} class={sortField() === "action" ? sortOrder() : ""}>
                    Type
                  </th>
                  <th onClick={() => handleSort("amount")} class={sortField() === "amount" ? sortOrder() : ""}>
                    Amount
                  </th>
                  <th onClick={() => handleSort("balance_before")} class={sortField() === "balance_before" ? sortOrder() : ""}>
                    Before
                  </th>
                  <th onClick={() => handleSort("balance_after")} class={sortField() === "balance_after" ? sortOrder() : ""}>
                    After
                  </th>
                  <th onClick={() => handleSort("created_at")} class={sortField() === "created_at" ? sortOrder() : ""}>
                    Date
                  </th>
                  <th>Free Spin</th>
                </tr>
              </thead>
              <tbody>
                <For each={paginatedTransactions()}>
                  {(tx) => (
                    <tr class={tx.is_freespin ? "freespin-row" : ""}>
                      <td>{tx.id}</td>
                      <td title={tx.user_id}>{tx.user_id.substring(0, 8)}...</td>
                      <td title={tx.game_id}>{tx.game_id.substring(0, 10)}...</td>
                      <td title={tx.round_id}>{tx.round_id ? tx.round_id.substring(0, 6) + "..." : "N/A"}</td>
                      <td>{formatAction(tx.action)}</td>
                      <td style={{ color: tx.action === "credit" ? "var(--success)" : tx.action === "debit" ? "var(--danger)" : "inherit" }}>
                        {formatAmount(tx.amount, tx.currency)}
                      </td>
                      <td>{formatAmount(tx.balance_before, tx.currency)}</td>
                      <td>{formatAmount(tx.balance_after, tx.currency)}</td>
                      <td>{formatDate(tx.created_at)}</td>
                      <td>
                        {tx.is_freespin ? (
                          <span class="badge free-spin-badge" title="Free Spin Transaction">
                            <i class="fas fa-gift"></i> Free
                          </span>
                        ) : ""}
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

export default TransactionsTab;
