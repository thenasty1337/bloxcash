import SlotsHeader from "../components/Slots/slotsheader";
import {createResource, createSignal, For, Show} from "solid-js";
import {api} from "../util/api";
import Loader from "../components/Loader/loader";
import BlurImage from "../components/UI/BlurImage";
import FavoriteButton from "../components/UI/FavoriteButton";
import {A, useSearchParams} from "@solidjs/router";
import Bets from "../components/Home/bets";
import {useUser} from "../contexts/usercontextprovider";
import FancySlotBanner from "../components/Slots/fancyslotbanner";
import {Meta, Title} from "@solidjs/meta";
import { FiFilter, FiChevronDown } from "solid-icons/fi";

const sortingOptions = ['popularity', 'RTP', 'a-z', 'z-a']

function Slots(props) {

  let providersRef
  let [params, setParams] = useSearchParams()

  const [user] = useUser()
  const [slots, setSlots] = createSignal()
  const [categories, setCategories] = createSignal([])
  const [fetching, setFetching] = createSignal(true)
  const [networkError, setNetworkError] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal('')
  const [slotsData] = createResource(() => ({ sort: params.sort, provider: params.provider, search: params.search, category: params.category }), fetchSlots)
  const [providers] = createResource(fetchProviders)
  const [top] = createResource(fetchTopPicks)
  const [providerSearch, setProviderSearch] = createSignal("");
  const [categorySearch, setCategorySearch] = createSignal("");
  const [showProviderDropdown, setShowProviderDropdown] = createSignal(false);
  const [showSortDropdown, setShowSortDropdown] = createSignal(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = createSignal(false);

  async function fetchSlots(params) {
    try {
      // Convert frontend sort params to backend sort format
      let sortBy = 'popularity';  // default sort field
      let sortOrder = 'DESC';     // default sort order
      
      if (params.sort) {
        const sort = params.sort.toLowerCase();
        
        if (sort === 'popularity') {
          sortBy = 'popularity';  // Use the new popularity field
          sortOrder = 'DESC';
        } else if (sort === 'rtp') {
          sortBy = 'rtp';
          sortOrder = 'DESC';
        } else if (sort === 'a-z') {
          sortBy = 'game_name';
          sortOrder = 'ASC';
        } else if (sort === 'z-a') {
          sortBy = 'game_name';
          sortOrder = 'DESC';
        }
      }
      
      const provider = params.provider || '';
      const search = params.search || '';
      const category = params.category || '';
      
      // Build query with all parameters
      let url = `/slots?sortOrder=${sortOrder}&sortBy=${sortBy}&provider=${provider}&search=${search}&limit=48`;
      
      if (category) {
        url += `&category=${category}`;
      }

      let res = await api(url, 'GET', null, false);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch slots:', res.message || res.error);
        setFetching(false);
        setNetworkError(true);
        setErrorMessage(res.message || res.error);
        // Set empty slots array but don't crash the app
        setSlots([]);
        
        if (res.error === 'NETWORK_ERROR') {
          // Could show a user-friendly message
          // toast.error('Unable to load games. Please check your connection.');
        }
        return { data: [], total: 0 };
      }
      
      if (!res.data || !Array.isArray(res.data)) {
        setFetching(false);
        setNetworkError(true);
        setErrorMessage('Unexpected response format');
        setSlots([]);
        return { data: [], total: 0 };
      }

      // Reset error state on successful load
      setNetworkError(false);
      setErrorMessage('');
      setSlots(res.data);
      setFetching(false);
      return res;
    } catch (e) {
      console.error('Unexpected error in fetchSlots:', e);
      setFetching(false);
      setNetworkError(true);
      setErrorMessage('An unexpected error occurred');
      setSlots([]);
      return { data: [], total: 0 };
    }
  }

  async function fetchTopPicks() {
    try {
      let res = await api(`/slots/featured`, 'GET', null, false)
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch top picks:', res.message || res.error);
        return []; // Return empty array instead of crashing
      }
      
      if (!Array.isArray(res)) return []

      return res
    } catch (e) {
      console.error('Unexpected error in fetchTopPicks:', e)
      return []
    }
  }

  async function fetchProviders() {
    try {
      // Fetch categories as well
      const catResponse = await api('/slots/categories', 'GET', null, false);
      if (catResponse && !catResponse.error && Array.isArray(catResponse)) {
        setCategories(catResponse);
      } else if (catResponse && catResponse.error) {
        console.warn('Failed to fetch categories:', catResponse.message || catResponse.error);
        setCategories([]); // Set empty array as fallback
      }
      
      // Fetch providers
      let res = await api('/slots/providers', 'GET', null, false);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch providers:', res.message || res.error);
        // Show a user-friendly message but don't crash the app
        if (res.error === 'NETWORK_ERROR') {
          // Could show a toast notification here if desired
          // toast.error('Unable to load providers. Some features may be limited.');
        }
        return []; // Return empty array to prevent crashes
      }
      
      if (!Array.isArray(res) || res.length < 1) return [];
      return res;
    } catch (e) {
      console.error('Unexpected error in fetchProviders:', e);
      return []; // Always return empty array instead of throwing
    }
  }

  async function fetchMoreSlots() {
    if (fetching()) return

    try {
      setFetching(true)

      // Convert frontend sort params to backend sort format
      let sortBy = 'game_name';  // default sort field
      let sortOrder = 'ASC';     // default sort order
      
      if (params.sort) {
        const sort = params.sort.toLowerCase();
        
        if (sort === 'popularity') {
          sortBy = 'popularity';  // Use the new popularity field
          sortOrder = 'DESC';
        } else if (sort === 'rtp') {
          sortBy = 'rtp';
          sortOrder = 'DESC';
        } else if (sort === 'a-z') {
          sortBy = 'game_name';
          sortOrder = 'ASC';
        } else if (sort === 'z-a') {
          sortBy = 'game_name';
          sortOrder = 'DESC';
        }
      }
      
      const provider = params.provider || '';
      const search = params.search || '';
      const category = params.category || '';
      
      // Build query with offset for pagination and limit to load in multiples of 6
      let url = `/slots?offset=${slots()?.length || 0}&limit=24&sortOrder=${sortOrder}&sortBy=${sortBy}&provider=${provider}&search=${search}`;
      
      if (category) {
        url += `&category=${category}`;
      }

      let res = await api(url, 'GET', null, false);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch more slots:', res.message || res.error);
        setFetching(false);
        
        if (res.error === 'NETWORK_ERROR') {
          // Could show a user-friendly message
          // toast.error('Unable to load more games. Please check your connection.');
        }
        return;
      }
      
      if (!res.data || !Array.isArray(res.data)) {
        setFetching(false);
        return;
      }

      setSlots([...slots(), ...res.data]);
      setFetching(false);
    } catch (e) {
      console.error('Unexpected error in fetchMoreSlots:', e);
      setFetching(false);
    }
  }

  function repeatProviders() {
    if (!providers() || !Array.isArray(providers()) || providers().length === 0) return []
    
    // List of available provider images (those we have in the directory)
    const availableImages = [
      "3-oaks-gaming", "avatarux", "b-gaming", "backseatgaming", "belatra", 
      "bigtimegaming", "blueprint", "bullsharkgames", "elk-studios", "endorphina", 
      "evolution-gaming", "fantasma-games", "fat-panda", "game-art", "games-global", 
      "gamomat", "hacksaw", "jade-rabbit", "just-slots", "live88", "massive-studios", 
      "netent", "nolimit", "novomatic", "octoplay", "onetouch", "petersons", "pgsoft", 
      "playn-go", "pragmatic-play", "print-studios", "push-gaming", "quickspin", 
      "red-rake-gaming", "red-tiger", "relax-gaming", "shady-lady", "slotmill", 
      "spinomenal", "titan-gaming", "truelab", "twist-gaming", "voltent"
    ];
    
    // Filter to only show providers with available images
    const availableProviders = providers().filter(provider => 
      provider && provider.slug && availableImages.includes(provider.slug.toLowerCase())
    );
    
    // If no available providers, return empty array
    if (availableProviders.length === 0) return []
    
    // Ensure we don't try to create an array with invalid length
    const repeatCount = Math.max(1, Math.ceil(6 / availableProviders.length));
    
    // Additional safety check to prevent creating arrays that are too large
    if (repeatCount > 100) return availableProviders; // Fallback to just the providers
    
    try {
      return Array(repeatCount).fill(availableProviders).flat()
    } catch (e) {
      console.warn('Error in repeatProviders:', e);
      return availableProviders; // Fallback to just the providers
    }
  }

  function scrollProviders(direction) {
    providersRef.scrollBy({
      left: providersRef.clientWidth * direction,
      behavior: 'smooth'
    })
  }

  function filteredProviders() {
    if (!providers() || !Array.isArray(providers())) return [];
    const search = providerSearch().toLowerCase();
    if (!search) return providers();
    return providers().filter(p => p.name.toLowerCase().includes(search));
  }
  
  function filteredCategories() {
    if (!categories() || !Array.isArray(categories())) return [];
    const search = categorySearch().toLowerCase();
    if (!search) return categories();
    return categories().filter(c => c.toLowerCase().includes(search));
  }

  return (
    <>
      <Title>BloxClash | Slots</Title>
      <Meta name='title' content='Slots'></Meta>
      <Meta name='description' content='Play And Spin The Best Slots On BloxClash To Win Robux On Roblox Gaming!'></Meta>

      <div class='slots-base-container' onClick={() => {
        setShowProviderDropdown(false);
        setShowSortDropdown(false);
        setShowCategoryDropdown(false);
      }}>
       

        <div class='our-picks'>
          <div style={{ flex: 1, background: 'linear-gradient(270deg, #4ecdc4 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>

          <p>
            <img src='/assets/icons/fire.svg' height='20' width='15'/>
            OUR HOT PICKS
          </p>

          <div style={{ flex: 1, background: 'linear-gradient(90deg, #4ecdc4 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>
        </div>

        <div className='top-five'>
          <Show when={!top.loading}>
            <For each={top()}>{(slot) =>
              <FancySlotBanner {...slot}/>
            }</For>
          </Show>
        </div>


        <div class='sort'>
          <div class='sorting-wrapper' onClick={(e) => {
            e.stopPropagation();
            setShowProviderDropdown(!showProviderDropdown());
            setShowSortDropdown(false);
            setShowCategoryDropdown(false);
          }}>
            <FiFilter size={17} />

            <p>
              Filter By: <span class='white'>Providers</span>
            </p>

            <FiChevronDown size={16} class={showProviderDropdown() ? 'rotated' : ''} />

            <Show when={showProviderDropdown()}>
              <div className='filter-dropdown left' onClick={(e) => e.stopPropagation()}>
                <div className='search-container'>
                  <input 
                    type="text" 
                    placeholder="Search providers..." 
                    value={providerSearch()} 
                    onInput={(e) => setProviderSearch(e.target.value)}
                  />
                </div>
                <div className='filters'>
                  <For each={filteredProviders()}>{(prov) =>
                    <div className={'option ' + (params.provider === prov.slug ? 'active' : '')}
                         onClick={() => {
                           setParams({ provider: params?.provider === prov.slug ? null : prov.slug });
                           setShowProviderDropdown(false);
                         }}>
                      <p>{prov.name}</p>
                      <div className='checkbox'>
                        <img src='/assets/icons/check.svg'/>
                      </div>
                    </div>
                  }</For>
                </div>
              </div>
            </Show>
          </div>

          <div className='sorting-wrapper' onClick={(e) => {
            e.stopPropagation();
            setShowSortDropdown(!showSortDropdown());
            setShowProviderDropdown(false);
            setShowCategoryDropdown(false);
          }}>
            <FiFilter size={17} />

            <p>
              Sort By: <span className='white'>{params.sort || 'Popularity'}</span>
            </p>

            <FiChevronDown size={16} class={showSortDropdown() ? 'rotated' : ''} />

            <Show when={showSortDropdown()}>
              <div class='filter-dropdown' onClick={(e) => e.stopPropagation()}>
                <div class='filters'>
                  <For each={sortingOptions}>{(sort) =>
                    <div className={'option ' + (params.sort === sort ? 'active' : '')}
                         onClick={() => {
                           setParams({ sort: sort });
                           setShowSortDropdown(false);
                         }}>
                      <p>{sort}</p>
                      <div className='checkbox'>
                        <img src='/assets/icons/check.svg'/>
                      </div>
                    </div>
                  }</For>
                </div>
              </div>
            </Show>
          </div>
          
          {/* Add Category Filter */}
          <Show when={categories().length > 0}>
            <div class='sorting-wrapper' onClick={(e) => {
              e.stopPropagation();
              setShowCategoryDropdown(!showCategoryDropdown());
              setShowProviderDropdown(false);
              setShowSortDropdown(false);
            }}>
              <FiFilter size={17} />

              <p>
                Filter By: <span class='white'>Categories</span>
              </p>

              <FiChevronDown size={16} class={showCategoryDropdown() ? 'rotated' : ''} />

                             <Show when={showCategoryDropdown()}>
                 <div className='filter-dropdown left' onClick={(e) => e.stopPropagation()}>
                   <div className='search-container'>
                     <input 
                       type="text" 
                       placeholder="Search categories..." 
                       value={categorySearch()} 
                       onInput={(e) => setCategorySearch(e.target.value)}
                     />
                   </div>
                   <div className='filters'>
                     <For each={filteredCategories()}>{(cat) =>
                       <div className={'option ' + (params.category === cat ? 'active' : '')}
                            onClick={() => {
                              setParams({ category: params?.category === cat ? null : cat });
                              setShowCategoryDropdown(false);
                            }}>
                         <p>{cat}</p>
                         <div className='checkbox'>
                           <img src='/assets/icons/check.svg'/>
                         </div>
                       </div>
                     }</For>
                   </div>
                 </div>
               </Show>
            </div>
          </Show>
        </div>

        <Show when={networkError()}>
          <div className='connection-error'>
            <div className='error-banner'>
              <div className='error-icon'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div className='error-text'>
                <span className='error-title'>Connection Issue</span>
                <span className='error-desc'>Unable to load games</span>
              </div>
              <button className='error-retry' onClick={() => {
                setNetworkError(false);
                setErrorMessage('');
                slotsData.refetch();
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Retry
              </button>
            </div>
          </div>
        </Show>

        <Show when={!networkError()}>
          <div className='slots'>
            <Show when={!slotsData.loading} fallback={<Loader/>}>
              <Show when={slots() && slots().length > 0} fallback={
                <div className='no-slots'>
                  <p>No games found. Try adjusting your filters.</p>
                </div>
              }>
                <For each={slots()}>{(slot, index) =>
                  <div className='slot-container'>
                    <div className='slot-frame'>
                      <div className='slot'>
                        <A href={`/slots/${slot.slug}`} class='gamemode-link'>
                          <BlurImage 
                            src={slot.img} 
                            blurhash={slot.blurhash}
                            style={{'border-radius': '6px'}}
                          />
                        </A>
                      </div>
                    </div>
                    <div class='slot-overlay'>
                      <div class='favorite-container'>
                        <FavoriteButton 
                          slug={slot.slug}
                          isAuthenticated={!!user()}
                          isFavorited={slot.isFavorited}
                          size={16}
                        />
                      </div>
                    </div>
                    {slot.isNew && <div class="new-tag">NEW</div>}
                    {slot.hasJackpot && <div class="jackpot-tag">JACKPOT</div>}
                  </div>
                }</For>
              </Show>
            </Show>
          </div>
        </Show>

        <Show when={!networkError() && slots() && slots().length > 0}>
          <div class='pagination'>
            <p class='displaying'>DISPLAYING <span class='white'>{slots()?.length || 0}</span> OUT
              OF {slotsData()?.total || 0} SLOTS</p>

            <button class='bevel-purple load' onClick={() => fetchMoreSlots()}>
              LOAD MORE
            </button>
          </div>
        </Show>

        <div class='providers-wrapper'>
          <div className='banner'>
            <img src='/assets/icons/providers.svg' height='19' width='19' alt=''/>

            <p className='title'>
              <span className='white bold'>PROVIDERS</span>
            </p>

            <div className='line'/>

            <button className='bevel-purple arrow' onClick={() => scrollProviders(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M12 6L2 6M2 6L7.6 0.999999M2 6L7.6 11" stroke="white" stroke-width="2"/>
              </svg>
            </button>

            <button className='bevel-purple arrow' onClick={() => scrollProviders(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.58933e-07 6L10 6M10 6L4.4 11M10 6L4.4 0.999999" stroke="white" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <div class='providers' ref={providersRef}>
            <Show when={repeatProviders().length > 0} fallback={
              <div className='no-providers'>
                <span>Providers will be available once connection is restored.</span>
              </div>
            }>
              <For each={repeatProviders()}>{(provider, index) =>
                <div class='provider' onClick={() => setParams({ provider: params?.provider === provider.slug ? null : provider.slug })}>
                  <img src={`${import.meta.env.VITE_BASE_URL}${provider.img}`} height='50' 
                       onError={(e) => {
                         // Fallback if image fails to load
                         e.target.style.display = 'none';
                         e.target.parentElement.innerHTML = `<span style="color: #8aa3b8; font-size: 14px;">${provider.name || 'Provider'}</span>`;
                       }}/>
                </div>
              }</For>
              <Show when={repeatProviders().length > 0}>
                <div class='provider more-providers'>
                  <span>and more...</span>
                </div>
              </Show>
            </Show>
          </div>
        </div>

        <Bets user={user()}/>
      </div>

      <style jsx>{`
        .slots-base-container {
          width: 100%;
          max-width: 1175px;
          height: fit-content;

          box-sizing: border-box;
          padding: 30px 0;
          margin: 0 auto;
        }
        
        .our-picks {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .our-picks p {
          height: 40px;
          padding: 0 16px;
          
          line-height: 40px;
          
          border-radius: 8px;
          border: 1px solid rgba(78, 205, 196, 0.3);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);

          font-family: Geogrotesque Wide, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #4ecdc4;
          
          filter: drop-shadow(0 0 15px rgba(78, 205, 196, 0.3));
          
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .top-five {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          grid-gap: 10px;
          margin: 35px 0;
          padding: 4px;
        }

        .sort {
          width: 100%;
          min-height: 50px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          
          padding: 8px 16px;

          border-radius: 10px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 3;
        }

        .sorting-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;

          position: relative;
          z-index: 1001;

          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          font-weight: 600;
          
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sorting-wrapper:hover {
          color: #4ecdc4;
        }

        .sorting-wrapper p {
          margin-top: -2px;
          text-transform: capitalize;
        }
        
        .sorting-wrapper svg {
          transition: all 0.3s ease;
        }
        
        .sorting-wrapper svg.rotated {
          transform: rotate(180deg);
        }
        
        .sorting-wrapper:hover svg {
          color: #4ecdc4;
        }
        
        .filter-dropdown {
          position: absolute;
          right: 0;
          
          z-index: 99999;
          top: 40px;

          width: 280px;
          background: rgba(26, 35, 50, 0.95);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
        }
        
        .filter-dropdown.left {
          left: 0;
          right: unset;
        }
        
        .search-container {
          padding: 12px;
          border-bottom: 1px solid rgba(78, 205, 196, 0.1);
        }
        
        .search-container input {
          width: 100%;
          height: 40px;
          background: rgba(45, 75, 105, 0.3);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 6px;
          padding: 0 12px;
          color: #FFF;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        
        .search-container input::placeholder {
          color: #8aa3b8;
        }
        
        .search-container input:focus {
          outline: none;
          border-color: #4ecdc4;
          box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.15);
        }
        
        .filters {
          display: flex;
          flex-direction: column;
          gap: 2px;
          
          padding: 8px;
          max-height: 320px;
          overflow-y: auto;
        }
        
        .filters::-webkit-scrollbar {
          width: 4px;
        }
        
        .filters::-webkit-scrollbar-track {
          background: rgba(45, 75, 105, 0.2);
          border-radius: 2px;
        }
        
        .filters::-webkit-scrollbar-thumb {
          background: rgba(78, 205, 196, 0.3);
          border-radius: 2px;
        }
        
        .filters::-webkit-scrollbar-thumb:hover {
          background: rgba(78, 205, 196, 0.5);
        }
        
        .option {
          width: 100%;
          height: 44px;
          min-height: 44px;
          
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          text-transform: capitalize;
          box-sizing: border-box;

          border-radius: 6px;
          border: 1px solid rgba(78, 205, 196, 0.08);
          background: rgba(45, 75, 105, 0.2);
          color: #9db3c8;
          cursor: pointer;
          transition: all 0.2s ease;
          
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 14px;
          font-weight: 500;
        }
        
        .option p {
          flex: 1;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 8px;
        }
        
        .option:hover {
          background: rgba(78, 205, 196, 0.12);
          border-color: rgba(78, 205, 196, 0.25);
          color: #ffffff;
          transform: translateX(2px);
        }
        
        .checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          width: 18px;
          height: 18px;

          border-radius: 3px;
          border: 1px solid rgba(78, 205, 196, 0.25);
          background: rgba(26, 35, 50, 0.6);

          transition: all 0.2s ease;
        }
        
        .checkbox img {
          display: none;
          width: 10px;
          height: 10px;
        }
        
        .option.active {
          background: rgba(78, 205, 196, 0.18);
          border-color: rgba(78, 205, 196, 0.4);
          color: #ffffff;
        }
        
        .option.active .checkbox {
          border-color: #4ecdc4;
          background: rgba(78, 205, 196, 0.3);
        }
        
        .option.active .checkbox img {
          display: block;
        }

        .slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          grid-gap: 10px;
          margin-top: 20px;
          min-height: 195px;
          overflow-x: auto;
          padding: 4px;
        }

        .connection-error {
          margin: 20px 0;
        }
        
        .error-banner {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 20px;
          
          border-radius: 10px;
          border: 1px solid rgba(255, 107, 107, 0.2);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(255, 107, 107, 0.1);
        }
        
        .error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .error-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .error-title {
          color: #ff6b6b;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
        }
        
        .error-desc {
          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
        }
        
        .error-retry {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          height: 36px;
          
          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.25);
          border-radius: 6px;
          backdrop-filter: blur(8px);
          
          color: #4ecdc4;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 13px;
          font-weight: 600;
          
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .error-retry:hover {
          background: rgba(78, 205, 196, 0.25);
          border-color: #4ecdc4;
          color: #ffffff;
          transform: translateY(-1px);
        }
        
        .no-slots {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
        }
        
        .no-providers {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 14px;
          text-align: center;
          padding: 20px;
        }

        .slots::-webkit-scrollbar {
          display: none;
        }

        .slot-container {
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .slot-container:hover {
          transform: translateY(-4px);
          z-index: 2;
        }

        .slot-frame {
          background: rgba(26, 35, 50, 0.4);
          border-radius: 8px;
          padding: 3px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transition: box-shadow 0.2s ease, border 0.2s ease;
          border: 1px solid rgba(78, 205, 196, 0.1);
          backdrop-filter: blur(8px);
        }
        
        .slot-container:hover .slot-frame {
          box-shadow: 0 8px 16px rgba(78, 205, 196, 0.2);
          border: 2px solid rgba(78, 205, 196, 0.4);
          padding: 2px;
        }

        .slot {
          width: 100%;
          aspect-ratio: 427/575;
          border-radius: 6px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          overflow: hidden;
          transition: transform 0.5s ease;
        }
        
        .slot-container:hover .slot {
          transform: scale(1.03);
        }
        
        .slot-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 12;
        }

        .favorite-container {
          position: absolute;
          top: 8px;
          right: 8px;
          pointer-events: auto;
        }

        .gamemode-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .new-tag, .jackpot-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
        }
        
        .new-tag {
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
        }
        
        .jackpot-tag {
          background: linear-gradient(180deg, #4ecdc4 0%, #44a08d 100%);
          color: #ffffff;
          top: ${(params.category || params.provider) ? '36px' : '8px'};
          box-shadow: 0 2px 8px rgba(78, 205, 196, 0.4);
        }

        .pagination {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;

          margin: 35px 0 50px 0;
        }

        .displaying {
          height: 45px;
          width: 100%;

          border-radius: 8px;
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(78, 205, 196, 0.1);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.10);

          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          font-weight: 600;
          line-height: 45px;

          text-align: center;
        }

        .load {
          width: 180px;
          height: 45px;

          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 8px;
          backdrop-filter: blur(8px);

          color: #4ecdc4;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 15px;
          font-weight: 700;

          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .load:hover {
          background: rgba(78, 205, 196, 0.25);
          border-color: #4ecdc4;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(78, 205, 196, 0.2);
        }

        .banner {
          outline: unset;
          border: unset;

          width: 100%;
          height: 45px;

          border-radius: 8px;
          background: rgba(26, 35, 50, 0.4);
          border: 1px solid rgba(78, 205, 196, 0.1);
          backdrop-filter: blur(8px);

          padding: 0 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .line {
          flex: 1;
          height: 1px;

          border-radius: 2525px;
          background: linear-gradient(90deg, rgba(78, 205, 196, 0.3) 0%, rgba(78, 205, 196, 0.0) 100%);
        }

        .arrow {
          margin-left: auto;
          
          width: 40px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 6px;
          backdrop-filter: blur(8px);
          
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .arrow:hover {
          background: rgba(78, 205, 196, 0.25);
          border-color: #4ecdc4;
          transform: translateY(-2px);
        }
        
        .providers {
          display: flex;
          gap: 10px;
          
          margin: 20px 0 50px 0;
          width: 100%;
          overflow: hidden;
        }
        
        .provider {
          min-width: 200px;
          height: 80px;
          
          display: flex;
          align-items: center;
          justify-content: center;
          
          border-radius: 8px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);
          
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .provider:hover {
          border-color: rgba(78, 205, 196, 0.3);
          background: rgba(78, 205, 196, 0.1);
          transform: translateY(-2px);
        }
        
        .more-providers {
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .more-providers span {
          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          font-weight: 500;
          text-align: center;
        }

        @media only screen and (max-width: 1000px) {
          .slots-base-container {
            padding-bottom: 90px;
          }
        }

        @media only screen and (min-width: 768px) {
          .top-five {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            grid-gap: 12px;
          }
          
          .slots {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            grid-gap: 12px;
          }
        }
        
        @media only screen and (min-width: 1200px) {
          .top-five {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          
          .slots {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }

        @media only screen and (max-width: 768px) {
          .sort {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          
          .sorting-wrapper {
            width: 100%;
            justify-content: space-between;
          }
          
          .filter-dropdown {
            width: 100%;
            max-width: 100%;
            left: 0;
            right: 0;
          }
          
          .filter-dropdown.left {
            left: 0;
            right: 0;
          }
          
          .option {
            padding: 0 16px;
          }
          
          .sorting-wrapper p {
            flex: 1;
          }
          
          .error-banner {
            height: auto;
            min-height: 60px;
            padding: 16px;
            gap: 12px;
          }
          
          .error-text {
            gap: 4px;
          }
          
          .error-title {
            font-size: 14px;
          }
          
          .error-desc {
            font-size: 12px;
          }
          
          .error-retry {
            padding: 6px 12px;
            height: 32px;
            font-size: 12px;
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}

export default Slots;
