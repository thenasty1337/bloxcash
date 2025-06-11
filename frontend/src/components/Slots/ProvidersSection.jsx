import { createResource, createSignal, For, Show, createMemo } from "solid-js";
import { useSearchParams, useNavigate, useLocation } from "@solidjs/router";
import { api } from "../../util/api";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';

// Memoize available images list to prevent recreation
const AVAILABLE_IMAGES = Object.freeze([
  "3-oaks-gaming", "avatarux", "b-gaming", "backseatgaming", "belatra", 
  "bigtimegaming", "blueprint", "bullsharkgames", "elk-studios", "endorphina", 
  "evolution-gaming", "fantasma-games", "fat-panda", "game-art", "games-global", 
  "gamomat", "hacksaw", "jade-rabbit", "just-slots", "live88", "massive-studios", 
  "netent", "nolimit", "novomatic", "octoplay", "onetouch", "petersons", "pgsoft", 
  "playn-go", "pragmatic-play", "print-studios", "push-gaming", "quickspin", 
  "red-rake-gaming", "red-tiger", "relax-gaming", "shady-lady", "slotmill", 
  "spinomenal", "titan-gaming", "truelab", "twist-gaming", "voltent"
]);

function ProvidersSection() {
  let providersRef;
  const [params, setParams] = useSearchParams();
  const [providers] = createResource(fetchProviders);
  const navigate = useNavigate();
  const location = useLocation();

  async function fetchProviders() {
    try {
      let res = await api('/slots/providers', 'GET', null, false);
      
      // Handle network errors gracefully
      if (res && res.error) {
        console.warn('Failed to fetch providers:', res.message || res.error);
        return []; // Return empty array to prevent crashes
      }
      
      if (!Array.isArray(res) || res.length < 1) return [];
      return res;
    } catch (e) {
      console.error('Unexpected error in fetchProviders:', e);
      return []; // Always return empty array instead of throwing
    }
  }

  // Memoize filtered providers to prevent expensive filtering on every render
  const availableProviders = createMemo(() => {
    if (!providers() || !Array.isArray(providers()) || providers().length === 0) return [];
    
    return providers().filter(provider => 
      provider && provider.slug && AVAILABLE_IMAGES.includes(provider.slug.toLowerCase())
    );
  });

  // Memoize repeated providers to prevent expensive array operations
  const repeatProviders = createMemo(() => {
    const available = availableProviders();
    if (available.length === 0) return [];
    
    // Don't repeat if we already have enough providers
    if (available.length >= 12) return available.slice(0, 12);
    
    // Simple repeat logic - just show providers once or twice max
    const repeatCount = available.length < 6 ? 2 : 1;
    
    try {
      return Array(repeatCount).fill(available).flat().slice(0, 12);
    } catch (e) {
      console.warn('Error in repeatProviders:', e);
      return available;
    }
  });

  function scrollProviders(direction) {
    providersRef.scrollBy({
      left: providersRef.clientWidth * direction,
      behavior: 'smooth'
    })
  }

  function handleProviderClick(provider) {
    const isCurrentProvider = params?.provider === provider.slug;
    const newProvider = isCurrentProvider ? null : provider.slug;
    
    // Check if we're currently on the slots page
    if (location.pathname === '/slots' || location.pathname.startsWith('/slots/')) {
      // Already on slots page, just update params
      setParams({ provider: newProvider });
    } else {
      // Navigate to slots page with provider parameter
      if (newProvider) {
        navigate(`/slots?provider=${newProvider}`);
      } else {
        navigate('/slots');
      }
    }
  }

  return (
    <div class='providers-container'>
      <div class='providers-header'>
        <div class='header-content'>
          <div class='header-left'>
            <div class='header-icon'>
              <img src='/assets/GameIcons/provider.svg' alt='Providers' />
            </div>
            
            <div class='header-text'>
              <h2 class='title'>PROVIDERS</h2>
              <span class='count'>{providers()?.length || 0} providers available</span>
            </div>
          </div>

          <div class='header-right'>
            <div class='nav-controls'>
              <button class='nav-btn' onClick={() => scrollProviders(-1)} type="button">
                <AiOutlineArrowLeft size={16} />
              </button>
              
              <button class='nav-btn' onClick={() => scrollProviders(1)} type="button">
                <AiOutlineArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div class='header-divider'></div>
      </div>

      <div class='providers' ref={providersRef}>
        <Show when={repeatProviders().length > 0} fallback={
          <div className='no-providers'>
            <span>Providers will be available once connection is restored.</span>
          </div>
        }>
          <For each={repeatProviders()}>{(provider, index) =>
            <div class='provider' onClick={() => handleProviderClick(provider)}>
              <img src={`${import.meta.env.VITE_BASE_URL}${provider.img}`} height='50' 
                   loading="lazy"
                   decoding="async"
                   onError={(e) => {
                     // Use CSS class instead of innerHTML and direct style manipulation
                     e.target.classList.add('image-error');
                     const parent = e.target.parentElement;
                     if (parent && !parent.querySelector('.fallback-text')) {
                       const fallbackSpan = document.createElement('span');
                       fallbackSpan.className = 'fallback-text';
                       fallbackSpan.textContent = provider.name || 'Provider';
                       parent.appendChild(fallbackSpan);
                     }
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

      <style jsx>{`
        .providers-container {
          width: 100%;
          margin-top: 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-icon img {
          width: 32px;
          height: 32px;
        }

        .header-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          font-family: Geogrotesque Wide, sans-serif;
        }

        .count {
          font-size: 0.75rem;
          color: #8aa3b8;
          font-weight: 500;
        }

        .header-divider {
          height: 1px;
          background: linear-gradient(90deg, rgb(31 36 68) 0%, rgba(78, 205, 196, 0.1) 30%, transparent 100%);
        }

        .nav-controls {
          display: flex;
          gap: 0.25rem;
        }

        .nav-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          background: #0F0B27;
          border: 1px solid rgb(56 50 93);
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover {
          border-color: rgb(31 36 68);
          background: rgb(20 16 43);
          transform: translateY(-1px);
        }

        .nav-btn svg {
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .nav-btn:hover svg {
          opacity: 1;
          transform: scale(1.1);
        }

        .providers {
          display: flex;
          gap: 1rem;
          padding: 10px 0;
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .providers::-webkit-scrollbar {
          display: none;
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
            border-color: rgb(78 152 205 / 30%);
    background: rgb(18 16 50 / 10%);
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

        .provider img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .image-error {
          display: none !important;
        }
        
        .fallback-text {
          color: #8aa3b8;
          font-size: 14px;
          font-family: Geogrotesque Wide, sans-serif;
          text-align: center;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-right {
            justify-content: center;
          }

          .title {
            font-size: 1rem;
          }

          .providers {
            gap: 0.75rem;
          }

          .provider {
            min-width: 160px;
            height: 70px;
          }

          .more-providers {
            min-width: 120px;
          }

          .more-providers span {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .providers {
            gap: 0.5rem;
          }

          .provider {
            min-width: 140px;
            height: 60px;
          }

          .more-providers span {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProvidersSection; 