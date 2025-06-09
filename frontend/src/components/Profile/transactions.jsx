import {useSearchParams} from "@solidjs/router";
import {createResource, createSignal, For, Show} from "solid-js";
import {authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import Pagination from "../Pagination/pagination";
import { TbChartBar, TbCreditCard, TbCalendar, TbCoins, TbCheck, TbBrandPaypal, TbCurrencyBitcoin, TbGift } from 'solid-icons/tb';

const SITE_TYPES = ['affiliate', 'tip', 'rakeback', 'rain']
const FIAT_TYPES = ['giftcard']

function Transactions(props) {

    let loadedPages = new Set()
    const [total, setTotal] = createSignal(1)
    const [page, setPage] = createSignal(1)

    const [isLoading, setIsLoading] = createSignal(true)
    const [txs, setTxs] = createSignal([], {equals: false})

    const [searchParams, setSearchParams] = useSearchParams()
    const [transactionsData, {mutate: mutateTransactions}] = createResource(() => searchParams?.filter || '', fetchTransactions)

    async function fetchTransactions() {
        try {
            setPage(+searchParams?.page || 1)
            let txs = await authedAPI(`/user/transactions?page=${page()}${queryParams()}`, 'GET', null)

            setTotal(txs?.pages)
            addPage(txs?.data)
            setIsLoading(false)
            return mutateTransactions(txs)
        } catch (e) {
            console.log(e)
            setIsLoading(false)
            return mutateTransactions(null)
        }
    }

    function isActive(filter) {
        if (filter === '') return !searchParams?.filter || searchParams?.filter === filter

        return searchParams?.filter === filter
    }

    function queryParams() {
        let params = ''

        switch (searchParams?.filter || '') {
            case 'site':
                params += `&methods=${SITE_TYPES.join(',')}`
                break

            case 'crypto':
                params += '&methods=crypto'
                break
            case 'fiat':
                params += `&methods=${FIAT_TYPES.join(',')}`
                break
            default:
                break
        }

        return params
    }

    function addPage(data) {
        return setTxs(txs => {
            txs[page()] = data
            return txs
        })
    }

    async function loadPage() {
        if (isLoading()) return
        setIsLoading(true)
        setSearchParams({page: page()})

        let moreData = await authedAPI(`/user/transactions?page=${page()}${queryParams()}`, 'GET', null)
        if (!moreData) return setIsLoading(false)

        addPage(moreData.data)
        setTotal(moreData.pages)
        loadedPages.add(page())

        setIsLoading(false)
    }

    function getMethodIcon(method) {
        switch(method?.toLowerCase()) {
            case 'crypto':
            case 'bitcoin':
            case 'ethereum':
                return '₿';
            case 'giftcard':
                return '🎁';
            case 'paypal':
                return '💳';
            case 'affiliate':
                return '🤝';
            case 'tip':
                return '💝';
            case 'rakeback':
                return '🔄';
            case 'rain':
                return '🌧️';
            default:
                return '💰';
        }
    }

    function getTypeColor(type) {
        if (type === 'in' || type === 'deposit') {
            return 'deposit';
        }
        return 'withdraw';
    }

    return (
        <>
            <div class='transactions-container'>
                {/* Header */}
                <div class="transactions-header">
                    <div class="header-icon">
                        <TbChartBar size={18}/>
                    </div>
                    <div class="header-content">
                        <h1 class="transactions-title">Transactions</h1>
                        <p class="transactions-subtitle">Track your deposits, withdrawals and payments</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div class="filter-tabs">
                    <button 
                        class={`filter-tab ${isActive('') ? 'active' : ''}`}
                        onClick={() => setSearchParams({filter: '', page: 1})}
                    >
                        All Types
                    </button>
                    <button 
                        class={`filter-tab ${isActive('crypto') ? 'active' : ''}`}
                        onClick={() => setSearchParams({filter: 'crypto', page: 1})}
                    >
                        Crypto
                    </button>
                    <button 
                        class={`filter-tab ${isActive('fiat') ? 'active' : ''}`}
                        onClick={() => setSearchParams({filter: 'fiat', page: 1})}
                    >
                        Fiat
                    </button>
                    <button 
                        class={`filter-tab ${isActive('site') ? 'active' : ''}`}
                        onClick={() => setSearchParams({filter: 'site', page: 1})}
                    >
                        On-Site
                    </button>
                </div>

                {/* Content */}
                <div class="transactions-content">
                    <Show when={!transactionsData.loading && !isLoading() && txs()[page()]} fallback={
                        <div class="skeleton-container">
                            {/* Desktop Table Header Skeleton */}
                            <div class="skeleton-header desktop-only">
                                <div class="skeleton-header-cell"></div>
                                <div class="skeleton-header-cell"></div>
                                <div class="skeleton-header-cell"></div>
                                <div class="skeleton-header-cell"></div>
                                <div class="skeleton-header-cell"></div>
                            </div>

                            {/* Skeleton Cards */}
                            <div class="skeleton-list">
                                {Array.from({length: 8}).map((_, index) => (
                                    <div class="skeleton-card">
                                        {/* Mobile Skeleton Header */}
                                        <div class="skeleton-tx-header mobile-only">
                                            <div class="skeleton-method-info">
                                                <div class="skeleton-emoji"></div>
                                                <div class="skeleton-method-name"></div>
                                            </div>
                                            <div class="skeleton-type-badge"></div>
                                        </div>

                                        {/* Desktop Skeleton Row */}
                                        <div class="skeleton-row desktop-only">
                                            <div class="skeleton-cell type">
                                                <div class="skeleton-type-badge"></div>
                                            </div>
                                            <div class="skeleton-cell method">
                                                <div class="skeleton-emoji"></div>
                                                <div class="skeleton-method-name"></div>
                                            </div>
                                            <div class="skeleton-cell date">
                                                <div class="skeleton-date-text"></div>
                                            </div>
                                            <div class="skeleton-cell status">
                                                <div class="skeleton-status-badge"></div>
                                            </div>
                                            <div class="skeleton-cell amount">
                                                <div class="skeleton-amount"></div>
                                            </div>
                                        </div>

                                        {/* Mobile Skeleton Details */}
                                        <div class="skeleton-details mobile-only">
                                            <div class="skeleton-detail-row">
                                                <div class="skeleton-label"></div>
                                                <div class="skeleton-date-small"></div>
                                            </div>
                                            <div class="skeleton-detail-row">
                                                <div class="skeleton-label"></div>
                                                <div class="skeleton-amount-small"></div>
                                            </div>
                                            <div class="skeleton-detail-row">
                                                <div class="skeleton-label"></div>
                                                <div class="skeleton-status-small"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skeleton Pagination */}
                            <div class="skeleton-pagination">
                                <div class="skeleton-btn"></div>
                                <div class="skeleton-page-info"></div>
                                <div class="skeleton-btn"></div>
                            </div>
                        </div>
                    }>
                        <Show when={txs()[page()]?.length > 0} fallback={
                            <div class="empty-state">
                                <div class="empty-icon">
                                    <TbChartBar size={48}/>
                                </div>
                                <h3>No transactions found</h3>
                                <p>You haven't made any transactions yet. Make a deposit or withdrawal to see your transaction history here!</p>
                            </div>
                        }>
                            {/* Desktop Table Header */}
                            <div class="table-header desktop-only">
                                <div class="header-cell type">
                                    <TbChartBar size={16}/>
                                    <span>Type</span>
                                </div>
                                <div class="header-cell method">
                                    <TbCreditCard size={16}/>
                                    <span>Method</span>
                                </div>
                                <div class="header-cell date">
                                    <TbCalendar size={16}/>
                                    <span>Date</span>
                                </div>
                                <div class="header-cell status">
                                    <TbCheck size={16}/>
                                    <span>Status</span>
                                </div>
                                <div class="header-cell amount">
                                    <TbCoins size={16}/>
                                    <span>Amount</span>
                                </div>
                            </div>

                            {/* Transaction Cards */}
                            <div class="transactions-list">
                                <For each={txs()[page()]}>{(tx, index) => (
                                    <div class="transaction-card">
                                        {/* Mobile Transaction Header */}
                                        <div class="tx-header mobile-only">
                                            <div class="method-info">
                                                <span class="method-emoji">{getMethodIcon(tx?.method)}</span>
                                                <span class="method-name">{tx?.method}</span>
                                            </div>
                                            <div class={`type-badge ${getTypeColor(tx?.type)}`}>
                                                {tx?.type}
                                            </div>
                                        </div>

                                        {/* Desktop Row */}
                                        <div class="tx-row desktop-only">
                                            <div class="tx-cell type">
                                                <div class={`type-badge ${getTypeColor(tx?.type)}`}>
                                                    {tx?.type}
                                                </div>
                                            </div>

                                            <div class="tx-cell method">
                                                <div class="method-info">
                                                    <span class="method-emoji">{getMethodIcon(tx?.method)}</span>
                                                    <span class="method-name">{tx?.method}</span>
                                                </div>
                                            </div>

                                            <div class="tx-cell date">
                                                <span class="date-text">
                                                    {new Date(tx?.createdAt || 0)?.toLocaleString([], {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div class="tx-cell status">
                                                <div class="status-badge completed">
                                                    <TbCheck size={14}/>
                                                    <span>Completed</span>
                                                </div>
                                            </div>

                                            <div class="tx-cell amount">
                                                <div class="amount-display">
                                                    <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                                                    <span class="amount-value">
                                                        ${tx?.amount?.toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Details */}
                                        <div class="tx-details mobile-only">
                                            <div class="detail-row">
                                                <span class="detail-label">Date:</span>
                                                <span class="detail-value">
                                                    {new Date(tx?.createdAt || 0)?.toLocaleString([], {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Amount:</span>
                                                <div class="amount-display">
                                                    <img src='/assets/cryptos/branded/USDT.svg' height='24' width='24'/>
                                                    <span class="amount-value">
                                                        ${tx?.amount?.toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Status:</span>
                                                <div class="status-badge completed mobile">
                                                    <TbCheck size={12}/>
                                                    <span>Completed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}</For>
                            </div>

                            <Pagination 
                                isLoading={isLoading()} 
                                loadedPages={loadedPages} 
                                loadPage={loadPage} 
                                page={page()}
                                total={total()} 
                                setPage={setPage} 
                                setParams={setSearchParams}
                            />
                        </Show>
                    </Show>
                </div>
            </div>

            <style>{`
                .transactions-container {
                    padding: 1.5rem;
                    width: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                /* Header */
                .transactions-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem 1.25rem;
                    background: rgba(139, 120, 221, 0.04);
                    border: 1px solid rgba(139, 120, 221, 0.15);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .header-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, rgba(139, 120, 221, 0.15), rgba(124, 107, 191, 0.1));
                    border: 1px solid rgba(139, 120, 221, 0.25);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8b78dd;
                    flex-shrink: 0;
                }

                .header-content {
                    flex: 1;
                }

                .transactions-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 0.25rem 0;
                    letter-spacing: -0.01em;
                }

                .transactions-subtitle {
                    font-size: 0.85rem;
                    color: #8aa3b8;
                    margin: 0;
                    font-weight: 400;
                    line-height: 1.4;
                }

                /* Filter Tabs */
                .filter-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(24, 20, 52, 0.6);
                    border: 1px solid rgba(139, 120, 221, 0.12);
                    border-radius: 12px;
                    backdrop-filter: blur(15px);
                }

                .filter-tab {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #8aa3b8;
                    font-size: 0.8rem;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .filter-tab:hover {
                    background: rgba(139, 120, 221, 0.1);
                    border-color: rgba(139, 120, 221, 0.2);
                    color: #ffffff;
                }

                .filter-tab.active {
                    background: linear-gradient(135deg, #8b78dd, #7c6bbf);
                    border-color: #8b78dd;
                    color: #ffffff;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(139, 120, 221, 0.25);
                }

                /* Content */
                .transactions-content {
                    background: rgba(24, 20, 52, 0.6);
                    border: 1px solid rgba(139, 120, 221, 0.12);
                    border-radius: 14px;
                    overflow: hidden;
                    backdrop-filter: blur(15px);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    text-align: center;
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(139, 120, 221, 0.1);
                    border: 1px solid rgba(139, 120, 221, 0.2);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8b78dd;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 0.5rem 0;
                }

                .empty-state p {
                    font-size: 0.9rem;
                    color: #8aa3b8;
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.4;
                }

                /* Table Header */
                .table-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, rgba(139, 120, 221, 0.06), rgba(124, 107, 191, 0.03));
                    border-bottom: 1px solid rgba(139, 120, 221, 0.1);
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #8aa3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .header-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .header-cell.type { flex: 1.5; }
                .header-cell.method { flex: 2; }
                .header-cell.date { flex: 2; }
                .header-cell.status { flex: 1.5; }
                .header-cell.amount { flex: 1.5; justify-content: flex-end; }

                /* Transaction Cards */
                .transactions-list {
                    padding: 0;
                }

                .transaction-card {
                    border-bottom: 1px solid rgba(139, 120, 221, 0.08);
                    transition: all 0.2s ease;
                    position: relative;
                }

                .transaction-card:last-child {
                    border-bottom: none;
                }

                .transaction-card:hover {
                    background: rgba(139, 120, 221, 0.04);
                }

                .transaction-card:hover::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(180deg, #8b78dd, #7c6bbf);
                    opacity: 1;
                }

                .transaction-card::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(180deg, #8b78dd, #7c6bbf);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                /* Desktop Row */
                .tx-row {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    min-height: 60px;
                }

                .tx-cell {
                    display: flex;
                    align-items: center;
                }

                .tx-cell.type { flex: 1.5; }
                .tx-cell.method { flex: 2; }
                .tx-cell.date { flex: 2; }
                .tx-cell.status { flex: 1.5; }
                .tx-cell.amount { flex: 1.5; justify-content: flex-end; }

                /* Method Info */
                .method-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .method-emoji {
                    font-size: 1.1rem;
                }

                .method-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ffffff;
                    text-transform: capitalize;
                }

                /* Type Badge */
                .type-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .type-badge.deposit {
                    background: rgba(76, 175, 80, 0.15);
                    color: #4CAF50;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                }

                .type-badge.withdraw {
                    background: rgba(255, 107, 107, 0.15);
                    color: #ff6b6b;
                    border: 1px solid rgba(255, 107, 107, 0.3);
                }

                /* Status Badge */
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.completed {
                    background: linear-gradient(135deg, #8b78dd, #7c6bbf);
                    color: #ffffff;
                }

                .status-badge.mobile {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                }

                /* Date */
                .date-text {
                    font-size: 0.85rem;
                    color: #8aa3b8;
                    font-weight: 500;
                }

                /* Amount Display */
                .amount-display {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                .amount-value {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ffffff;
                    font-variant-numeric: tabular-nums;
                }

                /* Mobile Layout */
                .mobile-only {
                    display: none !important;
                }

                .desktop-only {
                    display: flex !important;
                }

                /* Mobile Transaction Layout */
                .tx-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1rem 0.5rem;
                }

                .tx-details {
                    padding: 0.5rem 1rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .detail-label {
                    font-size: 0.8rem;
                    color: #8aa3b8;
                    font-weight: 500;
                }

                .detail-value {
                    font-size: 0.8rem;
                    color: #ffffff;
                    font-weight: 500;
                }

                /* Skeleton Loader Styles */
                .skeleton-container {
                    padding: 0;
                }

                .skeleton-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, rgba(139, 120, 221, 0.06), rgba(124, 107, 191, 0.03));
                    border-bottom: 1px solid rgba(139, 120, 221, 0.1);
                    gap: 1rem;
                }

                .skeleton-header-cell {
                    height: 12px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-header-cell:nth-child(1) { flex: 1.5; }
                .skeleton-header-cell:nth-child(2) { flex: 2; }
                .skeleton-header-cell:nth-child(3) { flex: 2; }
                .skeleton-header-cell:nth-child(4) { flex: 1.5; }
                .skeleton-header-cell:nth-child(5) { flex: 1.5; }

                .skeleton-list {
                    padding: 0;
                }

                .skeleton-card {
                    border-bottom: 1px solid rgba(139, 120, 221, 0.08);
                    animation: skeleton-fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }

                .skeleton-card:nth-child(1) { animation-delay: 0.1s; }
                .skeleton-card:nth-child(2) { animation-delay: 0.2s; }
                .skeleton-card:nth-child(3) { animation-delay: 0.3s; }
                .skeleton-card:nth-child(4) { animation-delay: 0.4s; }
                .skeleton-card:nth-child(5) { animation-delay: 0.5s; }
                .skeleton-card:nth-child(6) { animation-delay: 0.6s; }
                .skeleton-card:nth-child(7) { animation-delay: 0.7s; }
                .skeleton-card:nth-child(8) { animation-delay: 0.8s; }

                .skeleton-card:last-child {
                    border-bottom: none;
                }

                /* Desktop Skeleton Row */
                .skeleton-row {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    min-height: 60px;
                }

                .skeleton-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .skeleton-cell.type { flex: 1.5; }
                .skeleton-cell.method { flex: 2; }
                .skeleton-cell.date { flex: 2; }
                .skeleton-cell.status { flex: 1.5; }
                .skeleton-cell.amount { flex: 1.5; justify-content: flex-end; }

                .skeleton-emoji {
                    width: 20px;
                    height: 20px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 4px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-method-name {
                    width: 80px;
                    height: 14px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 7px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-type-badge {
                    width: 80px;
                    height: 24px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-status-badge {
                    width: 90px;
                    height: 28px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-date-text {
                    width: 120px;
                    height: 14px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 7px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-amount {
                    width: 90px;
                    height: 14px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 7px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                /* Mobile Skeleton Styles */
                .skeleton-tx-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1rem 0.5rem;
                }

                .skeleton-method-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .skeleton-details {
                    padding: 0.5rem 1rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .skeleton-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .skeleton-label {
                    width: 60px;
                    height: 12px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-date-small, .skeleton-amount-small {
                    width: 80px;
                    height: 12px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-status-small {
                    width: 70px;
                    height: 20px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                /* Skeleton Pagination */
                .skeleton-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, rgba(139, 120, 221, 0.04), rgba(124, 107, 191, 0.02));
                    border-top: 1px solid rgba(139, 120, 221, 0.08);
                }

                .skeleton-btn {
                    width: 80px;
                    height: 36px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 8px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                .skeleton-page-info {
                    width: 60px;
                    height: 16px;
                    background: rgba(139, 120, 221, 0.1);
                    border-radius: 8px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                }

                /* Skeleton Animations */
                @keyframes skeleton-pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.4;
                    }
                }

                @keyframes skeleton-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .mobile-only {
                        display: block !important;
                    }

                    .desktop-only {
                        display: none !important;
                    }

                    .transactions-container {
                        padding: 1rem;
                    }

                    .transactions-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.625rem;
                        padding: 1rem;
                    }

                    .transactions-title {
                        font-size: 1.125rem;
                    }

                    .transactions-subtitle {
                        font-size: 0.8rem;
                    }

                    .filter-tabs {
                        padding: 0.75rem;
                        gap: 0.375rem;
                    }

                    .filter-tab {
                        font-size: 0.75rem;
                        padding: 0.4rem 0.75rem;
                    }

                    .tx-header .method-name {
                        font-size: 0.9rem;
                    }

                    .detail-row .amount-display,
                    .detail-row .status-badge {
                        gap: 0.25rem;
                    }

                    .detail-row .amount-value {
                        font-size: 0.8rem;
                    }
                }

                @media (max-width: 480px) {
                    .transactions-container {
                        padding: 0.75rem;
                    }

                    .transactions-header {
                        padding: 0.875rem;
                        margin-bottom: 1.25rem;
                    }

                    .transactions-title {
                        font-size: 1rem;
                    }

                    .filter-tabs {
                        gap: 0.25rem;
                    }

                    .filter-tab {
                        font-size: 0.7rem;
                        padding: 0.375rem 0.625rem;
                    }

                    .tx-header {
                        padding: 0.875rem 0.875rem 0.5rem;
                    }

                    .tx-details {
                        padding: 0.5rem 0.875rem 0.875rem;
                    }
                }
            `}</style>
        </>
    );
}

export default Transactions;
