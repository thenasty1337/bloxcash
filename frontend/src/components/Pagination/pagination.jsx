import { TbChevronLeft, TbChevronRight } from 'solid-icons/tb';

function Pagination(props) {
    return (
        <>
            <div class='pagination-container'>
                {/* Previous Button */}
                <button 
                    class={`pagination-btn ${(props?.page <= 1 || props?.isLoading) ? 'disabled' : ''}`}
                    disabled={props?.page <= 1 || props?.isLoading} 
                    onClick={async () => {
                        props?.setPage(page => page - 1)

                        if (!props?.loadedPages.has(props?.page))
                            await props?.loadPage()
                        else
                            props?.setParams({ page: props?.page })
                    }}
                >
                    <TbChevronLeft size={14}/>
                    <span>Previous</span>
                </button>

                {/* Page Info */}
                <div class='page-info'>
                    <span class='page-current'>{props?.page}</span>
                    <span class='page-divider'>/</span>
                    <span class='page-total'>{props?.total || 1}</span>
                </div>

                {/* Next Button */}
                <button 
                    class={`pagination-btn ${(props?.page >= props?.total || props?.isLoading) ? 'disabled' : ''}`}
                    disabled={props?.page >= props?.total || props?.isLoading} 
                    onClick={async () => {
                        props?.setPage(page => page + 1)

                        if (!props?.loadedPages.has(props?.page))
                            await props?.loadPage()
                        else
                            props?.setParams({ page: props?.page })
                    }}
                >
                    <span>Next</span>
                    <TbChevronRight size={14}/>
                </button>
            </div>

            <style>{`
                .pagination-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.04), rgba(68, 160, 141, 0.02));
                    border-top: 1px solid rgba(78, 205, 196, 0.08);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .pagination-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 0.875rem;
                    background: rgba(78, 205, 196, 0.06);
                    border: 1px solid rgba(78, 205, 196, 0.15);
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 0.8rem;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .pagination-btn:not(.disabled):hover {
                    background: rgba(78, 205, 196, 0.12);
                    border-color: rgba(78, 205, 196, 0.25);
                    color: #4ecdc4;
                    transform: translateX(2px);
                }

                .pagination-btn:not(.disabled):active {
                    transform: translateX(1px);
                }

                .pagination-btn.disabled {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.08);
                    color: #8aa3b8;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .pagination-btn.disabled:hover {
                    transform: none;
                }

                .page-info {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                    font-variant-numeric: tabular-nums;
                }

                .page-current {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #4ecdc4;
                }

                .page-divider {
                    font-size: 0.8rem;
                    color: #8aa3b8;
                    margin: 0 0.125rem;
                }

                .page-total {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #ffffff;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .pagination-container {
                        padding: 0.875rem 1rem;
                    }

                    .pagination-btn {
                        padding: 0.4rem 0.75rem;
                        font-size: 0.75rem;
                    }

                    .pagination-btn span {
                        display: none;
                    }

                    .page-info {
                        gap: 0.2rem;
                    }

                    .page-current {
                        font-size: 0.85rem;
                    }

                    .page-total {
                        font-size: 0.8rem;
                    }
                }

                @media (max-width: 480px) {
                    .pagination-container {
                        padding: 0.75rem 0.875rem;
                    }

                    .pagination-btn {
                        padding: 0.375rem 0.625rem;
                    }
                }
            `}</style>
        </>
    );
}

export default Pagination;
