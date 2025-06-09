import SlotsHeader from "../components/Slots/slotsheader";
import {createResource, createSignal, For, Show, createEffect} from "solid-js";
import {api, favorites} from "../util/api";
import Loader from "../components/Loader/loader";
import BlurImage from "../components/UI/BlurImage";
import FavoriteButton from "../components/UI/FavoriteButton";
import {A, useSearchParams, useLocation, useNavigate} from "@solidjs/router";
import Bets from "../components/Home/bets";
import {useUser} from "../contexts/usercontextprovider";
import FancySlotBanner from "../components/Slots/fancyslotbanner";
import ProvidersSection from "../components/Slots/ProvidersSection";
import {Meta, Title} from "@solidjs/meta";
import { FiFilter, FiChevronDown } from "solid-icons/fi";
import { AiOutlineHeart, AiOutlineEye } from "solid-icons/ai";

const sortingOptions = ['popularity', 'RTP', 'a-z', 'z-a']

function Slots(props) {

  let [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [user] = useUser()
  const [slots, setSlots] = createSignal()
  const [categories, setCategories] = createSignal([])
  const [fetching, setFetching] = createSignal(true)
  const [networkError, setNetworkError] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal('')
  const [favoritesOffset, setFavoritesOffset] = createSignal(0)
  
  // Check if we're on the favorites page
  const isFavoritesPage = () => location.pathname === '/favorites'
  
  // Check if we're on the featured page
  const isFeaturedPage = () => location.pathname === '/slots/featured'
  
  // Redirect unauthenticated users from favorites page
  createEffect(() => {
    if (isFavoritesPage() && user() === null) {
      navigate("/?modal=login&mode=login");
    }
  });
  
  const [slotsData] = createResource(() => ({ 
    sort: params.sort, 
    provider: params.provider, 
    search: params.search, 
    category: params.category,
    type: params.type,
    isNew: params.isNew,
    isFavoritesPage: isFavoritesPage(),
    isFeaturedPage: isFeaturedPage()
  }), fetchSlots)
  const [top] = createResource(fetchTopPicks)
  const [providerSearch, setProviderSearch] = createSignal("");
  const [categorySearch, setCategorySearch] = createSignal("");
  const [showProviderDropdown, setShowProviderDropdown] = createSignal(false);
  const [showSortDropdown, setShowSortDropdown] = createSignal(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = createSignal(false);

  // Fetch categories on component mount
  createEffect(() => {
    fetchCategories();
  });

  async function fetchSlots(params) {
    try {
      // If we're on the favorites page, fetch favorites instead
      if (params.isFavoritesPage) {
        return await fetchFavorites();
      }
      
      // If we're on the featured page, fetch featured slots
      if (params.isFeaturedPage) {
        return await fetchFeaturedSlots();
      }
      
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
      
      const provider = params.provider;
      const search = params.search;
      const category = params.category;
      const type = params.type;
      const isNew = params.isNew;
      
      // Build query with all parameters
      let url = `/slots?sortOrder=${sortOrder}&sortBy=${sortBy}&limit=48`;
      
      if (provider) {
        url += `&provider=${provider}`;
      }
      
      if (search) {
        url += `&search=${search}`;
      }
      
      if (category) {
        url += `&category=${category}`;
      }
      
      if (type) {
        url += `&type=${type}`;
      }
      
      if (isNew) {
        url += `&isNew=${isNew}`;
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

  async function fetchFavorites() {
    try {
      if (!user()) {
        setFetching(false);
        setNetworkError(false);
        setSlots([]);
        return { data: [], total: 0 };
      }
      
      let res = await favorites.get(48, 0);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch favorites:', res.message || res.error);
        setFetching(false);
        setNetworkError(true);
        setErrorMessage(res.message || res.error);
        setSlots([]);
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
      setFavoritesOffset(0);
      return res;
    } catch (e) {
      console.error('Unexpected error in fetchFavorites:', e);
      setFetching(false);
      setNetworkError(true);
      setErrorMessage('An unexpected error occurred');
      setSlots([]);
      return { data: [], total: 0 };
    }
  }

  async function fetchFeaturedSlots() {
    try {
      let res = await api('/slots/featured?limit=48', 'GET', null, false);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch featured slots:', res.message || res.error);
        setFetching(false);
        setNetworkError(true);
        setErrorMessage(res.message || res.error);
        setSlots([]);
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
      console.error('Unexpected error in fetchFeaturedSlots:', e);
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

  async function fetchCategories() {
    try {
      // Fetch categories
      const catResponse = await api('/slots/categories', 'GET', null, false);
      if (catResponse && !catResponse.error && Array.isArray(catResponse)) {
        setCategories(catResponse);
      } else if (catResponse && catResponse.error) {
        console.warn('Failed to fetch categories:', catResponse.message || catResponse.error);
        setCategories([]); // Set empty array as fallback
      }
    } catch (e) {
      console.error('Unexpected error in fetchCategories:', e);
      setCategories([]);
    }
  }

  async function fetchMoreSlots() {
    if (fetching()) return

    try {
      setFetching(true)

      // Handle favorites pagination differently
      if (isFavoritesPage()) {
        const newOffset = favoritesOffset() + 24;
        let res = await favorites.get(24, newOffset);
        
        // Handle network errors gracefully
        if (res && res.error) {
          console.warn('Failed to fetch more favorites:', res.message || res.error);
          setFetching(false);
          return;
        }
        
        if (!res.data || !Array.isArray(res.data)) {
          setFetching(false);
          return;
        }

        setSlots([...slots(), ...res.data]);
        setFavoritesOffset(newOffset);
        setFetching(false);
        return;
      }

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
      
      const provider = params.provider;
      const search = params.search;
      const category = params.category;
      const type = params.type;
      const isNew = params.isNew;
      
      // Build query with offset for pagination and limit to load in multiples of 6
      let url = `/slots?offset=${slots()?.length || 0}&limit=24&sortOrder=${sortOrder}&sortBy=${sortBy}`;
      
      if (provider) {
        url += `&provider=${provider}`;
      }
      
      if (search) {
        url += `&search=${search}`;
      }
      
      if (category) {
        url += `&category=${category}`;
      }
      
      if (type) {
        url += `&type=${type}`;
      }
      
      if (isNew) {
        url += `&isNew=${isNew}`;
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

  function filteredProviders() {
    // This will be handled by the ProvidersSection component
    return [];
  }
  
  function filteredCategories() {
    if (!categories() || !Array.isArray(categories())) return [];
    const search = categorySearch().toLowerCase();
    if (!search) return categories();
    return categories().filter(c => c.toLowerCase().includes(search));
  }

  return (
    <>
      <Title>{isFavoritesPage() ? 'BloxClash | My Favorites' : 'BloxClash | Slots'}</Title>
      <Meta name='title' content={isFavoritesPage() ? 'My Favorites' : 'Slots'}></Meta>
      <Meta name='description' content={isFavoritesPage() ? 'Your favorite slots collection on BloxClash - Play your most loved games to win Robux!' : 'Play And Spin The Best Slots On BloxClash To Win Robux On Roblox Gaming!'}></Meta>

      <div class='slots-base-container' onClick={() => {
        setShowProviderDropdown(false);
        setShowSortDropdown(false);
        setShowCategoryDropdown(false);
      }}>
       

        <Show when={!isFavoritesPage()}>
          <div class='our-picks'>
            <div style={{ flex: 1, background: 'linear-gradient(270deg, #3b4376 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>

            <p>
              <img src='/assets/icons/fire.svg' height='20' width='15'/>
              OUR HOT PICKS
            </p>

            <div style={{ flex: 1, background: 'linear-gradient(90deg, #3b4376 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>
          </div>

          <div className='top-five'>
            <Show when={!top.loading}>
              <For each={top()}>{(slot) =>
                <FancySlotBanner {...slot}/>
              }</For>
            </Show>
          </div>
        </Show>

        <Show when={isFavoritesPage()}>
          <div class='our-picks'>
            <div style={{ flex: 1, background: 'linear-gradient(270deg, #3b4376 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>

            <p>
              <AiOutlineHeart size={20} color="#dc2626"/>
              MY FAVORITES
            </p>

            <div style={{ flex: 1, background: 'linear-gradient(90deg, #3b4376 0%, rgba(252, 163, 30, 0.00) 98.59%)', 'min-height': '1px' }}/>
          </div>
        </Show>


        <Show when={!isFavoritesPage()}>
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
        </Show>

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
                  <Show when={isFavoritesPage()} fallback={
                    <p>No games found. Try adjusting your filters.</p>
                  }>
                    <div className='favorites-empty'>
                      <AiOutlineHeart size={48} color="#8aa3b8"/>
                      <h3>No favorites yet</h3>
                      <p>Discover amazing games and add them to your favorites collection</p>
                      <A href="/slots" class="browse-button">
                        Browse Games
                      </A>
                    </div>
                  </Show>
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
                        onToggle={(isFavorited) => {
                          // If we're on favorites page and item was unfavorited, refresh the list
                          if (isFavoritesPage() && !isFavorited) {
                            slotsData.refetch();
                          }
                        }}
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
              OF {slotsData()?.total || 0} {isFavoritesPage() ? 'FAVORITES' : 'SLOTS'}</p>

            <Show when={(slots()?.length || 0) < (slotsData()?.total || 0)}>
              <button class='load' onClick={() => fetchMoreSlots()}>
                LOAD MORE
              </button>
            </Show>
          </div>
        </Show>

       
          <ProvidersSection />
        

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
          border: 1px solid #3b43764d;
          
          backdrop-filter: blur(8px);

          font-family: Geogrotesque Wide, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #8aa3b8;
          
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
        
        .favorites-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px 20px;
          text-align: center;
        }
        
        .favorites-empty h3 {
          margin: 0;
          color: #ffffff;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 24px;
          font-weight: 700;
        }
        
        .favorites-empty p {
          margin: 0;
          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          max-width: 400px;
        }
        
        .browse-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 8px;
          backdrop-filter: blur(8px);
          color: #4ecdc4;
          text-decoration: none;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .browse-button:hover {
          background: rgba(78, 205, 196, 0.25);
          border-color: #4ecdc4;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(78, 205, 196, 0.2);
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
          margin: 35px 0 50px 0;
        }

        .displaying {
          height: 45px;
          width: 100%;

          border-radius: 8px;
         
          backdrop-filter: blur(8px);
         

          color: #8aa3b8;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          font-weight: 600;
          line-height: 45px;

          text-align: center;
        }

        .load {
          padding: 12px 32px;
          
          background: transparent;
          border: none;
          border-radius: 8px;
          
          color: #4ecdc4;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .load::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
          border-radius: 8px;
          transition: all 0.3s ease;
          z-index: -1;
        }
        
        .load:hover {
          color: #ffffff;
          transform: translateY(-2px);
        }
        
        .load:hover::before {
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.2);
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
