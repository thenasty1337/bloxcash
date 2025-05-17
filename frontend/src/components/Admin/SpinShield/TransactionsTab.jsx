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
    <div class="games-container-in">
      <div class="games-header">
        <h2 class="games-title">Transactions</h2>
        <div class="stats-container" style="display: flex; gap: 15px;">
          <div class="stat-item" style="background: #312A5E; padding: 8px 15px; border-radius: 5px; text-align: center;">
            <div style="color: #ADA3EF; font-size: 12px;">Transactions</div>
            <div style="color: white; font-weight: bold;">{stats().totalTransactions}</div>
          </div>
          <div class="stat-item" style="background: #312A5E; padding: 8px 15px; border-radius: 5px; text-align: center;">
            <div style="color: #ADA3EF; font-size: 12px;">Bets</div>
            <div style="color: white; font-weight: bold;">{stats().totalDebits}</div>
          </div>
          <div class="stat-item" style="background: #312A5E; padding: 8px 15px; border-radius: 5px; text-align: center;">
            <div style="color: #ADA3EF; font-size: 12px;">Wins</div>
            <div style="color: white; font-weight: bold;">{stats().totalCredits}</div>
          </div>
          <div class="stat-item" style="background: #312A5E; padding: 8px 15px; border-radius: 5px; text-align: center;">
            <div style="color: #ADA3EF; font-size: 12px;">{stats().netAmount >= 0 ? "Player Profit" : "House Edge"}</div>
            <div style={{
              color: stats().netAmount >= 0 ? "#59E878" : "#FF5252",
              fontWeight: "bold"
            }}>
              {formatAmount(Math.abs(stats().netAmount), "USD")}
            </div>
          </div>
        </div>
      </div>
      
      <div class="filters-container">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Search by Game ID, User ID, Round ID..." 
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
            <label class="filter-label">Transaction Type</label>
            <select 
              class="filter-select" 
              value={actionFilter()} 
              onChange={(e) => handleActionFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="debit">Bets</option>
              <option value="credit">Wins</option>
              <option value="balance">Balance</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">From Date</label>
            <input 
              type="date" 
              class="filter-select" 
              value={dateRange().from} 
              onChange={(e) => handleDateChange("from", e.target.value)}
            />
          </div>
          
          <div class="filter-group">
            <label class="filter-label">To Date</label>
            <input 
              type="date" 
              class="filter-select" 
              value={dateRange().to} 
              onChange={(e) => handleDateChange("to", e.target.value)}
            />
          </div>
          
          <div class="filter-group small">
            <label class="filter-label">Sort Order</label>
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
        
        <div class="feature-filters">
          <button 
            class="bevel-button cancel" 
            style="padding: 6px 12px; font-size: 12px;"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      <Show when={!loading()} fallback={
        <div class="games-loading">
          <div class="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      }>
        <Show when={filteredTransactions().length > 0} fallback={
          <div class="empty-games-message">
            <p>No transactions found. Try adjusting your filters.</p>
          </div>
        }>
          <div class="table-container">
            <table class="games-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("user_id")}>User ID</th>
                  <th onClick={() => handleSort("game_id")}>Game ID</th>
                  <th onClick={() => handleSort("round_id")}>Round ID</th>
                  <th onClick={() => handleSort("action")}>Type</th>
                  <th onClick={() => handleSort("amount")}>Amount</th>
                  <th onClick={() => handleSort("balance_before")}>Balance Before</th>
                  <th onClick={() => handleSort("balance_after")}>Balance After</th>
                  <th onClick={() => handleSort("created_at")}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <For each={paginatedTransactions()}>
                  {(tx) => (
                    <tr>
                      <td title={tx.user_id}>{tx.user_id.substring(0, 8)}...</td>
                      <td title={tx.game_id}>{tx.game_id ? tx.game_id.substring(0, 10) + '...' : 'N/A'}</td>
                      <td title={tx.round_id}>{tx.round_id ? tx.round_id.substring(0, 8) + '...' : 'N/A'}</td>
                      <td>{formatAction(tx.action)}</td>
                      <td>{formatAmount(tx.amount, tx.currency)}</td>
                      <td>{formatAmount(tx.balance_before, tx.currency)}</td>
                      <td>{formatAmount(tx.balance_after, tx.currency)}</td>
                      <td>{formatDate(tx.created_at)}</td>
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

export default TransactionsTab;
