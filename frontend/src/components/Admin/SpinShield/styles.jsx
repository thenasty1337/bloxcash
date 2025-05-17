// CSS styles for SpinShield components
export const spinshieldStyles = `
  .spin-shield-container {
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
    gap: 8px;
  }
  
  .feature-checkbox {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .feature-label {
    color: #ADA3EF;
    font-size: 14px;
  }
  
  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    padding: 15px;
    min-height: 200px;
  }
  
  .game-card {
    background: #1E1A3A;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #3C3472;
  }
  
  .game-image {
    width: 100%;
    height: 140px;
    object-fit: cover;
    background: linear-gradient(135deg, #312A5E, #1E193A);
    position: relative;
  }
  
  .game-icon {
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
    font-size: 14px;
    margin: 0 0 8px 0;
  }
  
  .game-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .game-badge {
    font-size: 10px;
    padding: 3px 6px;
    border-radius: 3px;
    font-weight: 600;
  }
  
  .mobile {
    background: #2C5F9B;
    color: white;
  }
  
  .new {
    background: #E5446D;
    color: white;
  }
  
  .freerounds {
    background: #59E878;
    color: #1E193A;
  }
  
  .featurebuy {
    background: #ADA3EF;
    color: #1E193A;
  }
  
  .jackpot {
    background: var(--gold);
    color: #1E193A;
  }
  
  .game-rtp {
    font-size: 12px;
    color: #ADA3EF;
  }
  
  .games-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #ADA3EF;
    gap: 15px;
  }
  
  .spinner {
    border: 3px solid rgba(173, 163, 239, 0.3);
    border-radius: 50%;
    border-top: 3px solid var(--gold);
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .empty-games-message {
    padding: 30px;
    text-align: center;
    color: #ADA3EF;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
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
    padding: 40px;
    color: #ADA3EF;
    gap: 15px;
  }
  
  /* Modal styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
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
    font-weight: 600;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    color: #ADA3EF;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .full-width {
    grid-column: 1 / span 2;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 10px;
  }
  
  .preview-image {
    margin-top: 10px;
    max-width: 100%;
    height: 100px;
    border-radius: 5px;
  }
  
  .modal-footer {
    padding: 15px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #4A4581;
  }
  
  .modal-spinner {
    margin-right: 10px;
    width: 20px;
    height: 20px;
  }
  
  .bevel-button {
    background: var(--gold);
    color: #1E193A;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0px 1px 0px 0px #1E193A, 0px -1px 0px 0px #FFDD77;
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
    border: none;
    border-radius: 3px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
  }

  .tab-button {
    padding: 10px 15px;
    background: none;
    color: #ADA3EF;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: "Geogrotesque Wide", sans-serif;
    font-weight: 600;
    cursor: pointer;
  }
  
  .tab-button.active {
    color: var(--gold);
    border-bottom: 2px solid var(--gold);
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`;
