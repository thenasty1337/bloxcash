import { createSignal, createEffect, createMemo } from 'solid-js';
import { favorites } from '../../util/api';
import { AiOutlineHeart, AiFillHeart } from 'solid-icons/ai';

// Pre-define static styles to avoid inline recalculation
const buttonBaseClasses = 'favorite-btn';
const buttonFavoritedClasses = 'favorite-btn favorited';
const buttonLoadingClasses = 'favorite-btn loading';

function FavoriteButton(props) {
  const [isFavorited, setIsFavorited] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  // Use the favorite status from props (passed from API response)
  createEffect(() => {
    if (props.isFavorited !== undefined) {
      setIsFavorited(props.isFavorited);
    }
  });

  // Memoize button classes to prevent recalculation
  const buttonClasses = createMemo(() => {
    if (isLoading()) return buttonLoadingClasses;
    if (isFavorited()) return buttonFavoritedClasses;
    return buttonBaseClasses;
  });

  // Toggle favorite status
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!props.isAuthenticated) {
      // Show login prompt or redirect
      if (props.onLoginRequired) {
        props.onLoginRequired();
      }
      return;
    }

    if (isLoading()) return;

    setIsLoading(true);
    try {
      const result = await favorites.toggle(props.slug);
      setIsFavorited(result.action === 'added');
      
      // Call callback if provided
      if (props.onToggle) {
        props.onToggle(result.action === 'added');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      class={buttonClasses()}
      onClick={toggleFavorite}
      disabled={isLoading()}
      title={isFavorited() ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited() ? 
        <AiFillHeart size={props.size || 16} /> : 
        <AiOutlineHeart size={props.size || 16} />
      }

      <style jsx>{`
        .favorite-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 6px;
          color: #8aa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          z-index: 15;
          backdrop-filter: blur(8px);
          padding: 0;
          outline: none;
        }

        .favorite-btn:hover {
          background: rgba(78, 205, 196, 0.15);
          border-color: rgba(78, 205, 196, 0.6);
          color: #4ecdc4;
          transform: scale(1.05);
        }

        .favorite-btn.favorited {
          background: rgba(220, 38, 127, 0.2);
          border-color: rgba(220, 38, 127, 0.6);
          color: #dc267f;
        }

        .favorite-btn.favorited:hover {
          background: rgba(220, 38, 127, 0.3);
          border-color: rgba(220, 38, 127, 0.8);
          color: #ff1462;
        }

        .favorite-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
          pointer-events: none;
        }

        .favorite-btn:active {
          transform: scale(0.95);
        }

        .favorite-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .favorite-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </button>
  );
}

export default FavoriteButton; 