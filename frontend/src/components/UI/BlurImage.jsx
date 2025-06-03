import { createSignal, onMount, createEffect } from 'solid-js';
import { decode } from 'blurhash';

/**
 * BlurImage component that shows a blurhash placeholder while loading the actual image
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.isHouse - House game
 * @param {string} props.blurhash - BlurHash string representation
 * @param {string} props.alt - Alt text for the image
 * @param {number} props.width - Width of the image
 * @param {number} props.height - Height of the image
 * @param {string} props.class - CSS class for the image container
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element}
 */
function BlurImage(props) {
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [blurhashUrl, setBlurhashUrl] = createSignal('');
  
  // Default dimensions for thumbnail
  const defaultWidth = props.width || 200;
  const defaultHeight = props.height || 200;
  
  // Decode blurhash to a data URL when component mounts
  onMount(() => {
    if (props.blurhash) {
      try {
        // Use small pixel size for the placeholder (32px)
        const pixels = decode(props.blurhash, 32, 32);
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Create ImageData and set the decoded pixels
        const imageData = ctx.createImageData(32, 32);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL();
        setBlurhashUrl(dataURL);
      } catch (error) {
        console.error('Error decoding blurhash:', error);
      }
    }
    
    // Preload the actual image
    if (props.src) {
      const img = new Image();
      img.src = props.src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => console.error('Failed to load image:', props.src);
    }
  });
  
  return (
    <div 
      class={`blur-image-container ${props.class || ''}`} 
      style={{
        position: 'relative',
        width: props.width ? `${props.width}px` : '100%',
        height: props.height ? `${props.height}px` : '100%',
        overflow: 'hidden',
        'border-radius': 'inherit',
        ...(props.style || {})
      }}
      onClick={props.onClick}
    >
      {/* Blurhash placeholder */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          'background-color': '#1D183E',
          'filter': !props.blurhash ? 'brightness(0.4)' : 'none',
          'z-index': 1,
          ...(blurhashUrl() ? {
            'background-image': `url(${blurhashUrl()})`,
            'background-size': 'cover',
            'background-position': 'center'
          } : {})
        }}
      />

      {/* Actual image */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isLoaded() ? 1 : 0,
          'transition': 'opacity 0.3s ease-in-out',
          'z-index': 2,
          'background-image': `url(${props.src})`,
          'background-size': 'cover',
          'background-position': 'center',
          'border': props.isHouse ? '1px solid #fdfdfd3b' : 'none',
          'border-radius': props.isHouse ? '12px' : 'inherit'
        }}
      />
    </div>
  );
}

export default BlurImage;
