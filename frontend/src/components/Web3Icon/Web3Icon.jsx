import { createMemo, createSignal, onMount } from "solid-js";

// Web3 Icon component for Solid.js
const Web3Icon = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [currentImageUrl, setCurrentImageUrl] = createSignal('');

  // Map of crypto symbols to their common icon representations (fallback)
  const cryptoIcons = {
    'btc': '₿',
    'eth': 'Ξ', 
    'usdt': '₮',
    'usdc': '$',
    'xrp': '◉',
    'trx': '▲',
    'ltc': 'Ł',
    'doge': 'Ð',
    'usd': '$'
  };

  const iconUrls = createMemo(() => {
    const { symbol } = props;
    const symbolUpper = symbol.toUpperCase();
    
    const urls = [];
    
    // Try local branded icons first (highest quality)
    urls.push(`/assets/cryptos/branded/${symbolUpper}.svg`);
    
    // Fallback to CoinGecko for USD or if local file doesn't exist
    const coinGeckoMapping = {
      'BTC': { id: 'bitcoin', image: 1 },
      'ETH': { id: 'ethereum', image: 279 },
      'USDT': { id: 'tether', image: 325 },
      'USDC': { id: 'usd-coin', image: 6319 },
      'XRP': { id: 'ripple', image: 44 },
      'TRX': { id: 'tron', image: 1094 },
      'LTC': { id: 'litecoin', image: 2 },
      'DOGE': { id: 'dogecoin', image: 5 },
    };

    const mapping = coinGeckoMapping[symbolUpper];
    if (mapping && mapping.image) {
      urls.push(`https://assets.coingecko.com/coins/images/${mapping.image}/small/${mapping.id}.png`);
    }
    
    return urls;
  });

  // Test if image loads with fallback logic
  onMount(() => {
    const urls = iconUrls();
    let currentIndex = 0;
    
    const tryNextUrl = () => {
      if (currentIndex >= urls.length) {
        setImageLoaded(false);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        setImageLoaded(true);
        setCurrentImageUrl(urls[currentIndex]);
      };
      
      img.onerror = () => {
        currentIndex++;
        tryNextUrl();
      };
      
      img.src = urls[currentIndex];
    };
    
    tryNextUrl();
  });

  return (
    <div 
      class="web3-icon"
      style={{
        width: `${props.size || 32}px`,
        height: `${props.size || 32}px`,
        "border-radius": "50%",
        "background-color": props.backgroundColor ? `${props.backgroundColor}33` : "transparent",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "flex-shrink": "0",
        "background-image": imageLoaded() ? `url(${currentImageUrl()})` : "none",
        "background-size": "contain",
        "background-repeat": "no-repeat",
        "background-position": "center",
        border: imageLoaded() ? "none" : `2px solid ${props.backgroundColor || "#4ecdc4"}`
      }}
    >
      {/* Show fallback when image fails to load */}
      {!imageLoaded() && (
        <span 
          style={{
            "font-size": `${(props.size || 32) * 0.5}px`,
            "font-weight": "bold",
            color: "#ffffff",
            "text-transform": "uppercase"
          }}
          class="fallback-text"
        >
          {cryptoIcons[props.symbol?.toLowerCase()] || props.fallback || props.symbol?.substring(0, 2)}
        </span>
      )}
    </div>
  );
};

export default Web3Icon; 