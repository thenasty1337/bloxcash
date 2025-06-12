import { For } from "solid-js";

function SlotsSkeleton() {
  return (
    <>
      <div class="slots-skeleton-container">
        {/* Header skeleton */}
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>

        {/* Hot picks section skeleton */}
        <div class="skeleton-hot-picks">
          <div class="skeleton-section-title"></div>
          <div class="skeleton-games-row">
            <For each={Array(8).fill(0)}>{() => (
              <div class="skeleton-game-card">
                <div class="skeleton-game-image"></div>
              </div>
            )}</For>
          </div>
        </div>

        {/* Sort controls skeleton */}
        <div class="skeleton-sort-controls">
          <div class="skeleton-filter"></div>
          <div class="skeleton-filter"></div>
          <div class="skeleton-filter"></div>
        </div>

        {/* Main slots grid skeleton */}
        <div class="skeleton-slots-grid">
          <For each={Array(24).fill(0)}>{() => (
            <div class="skeleton-slot">
              <div class="skeleton-image"></div>
            </div>
          )}</For>
        </div>
      </div>

      <style jsx>{`
        .slots-skeleton-container {
          width: 100%;
          max-width: 1175px;
          margin: 0 auto;
          padding: 30px 0;
          box-sizing: border-box;
        }

        .skeleton-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .skeleton-line {
          background: linear-gradient(
            90deg,
            rgba(45, 75, 105, 0.3) 25%,
            rgba(78, 205, 196, 0.1) 50%,
            rgba(45, 75, 105, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
          margin: 0 auto;
        }

        .skeleton-title {
          height: 32px;
          width: 300px;
          margin-bottom: 12px;
        }

        .skeleton-subtitle {
          height: 18px;
          width: 200px;
        }

        .skeleton-hot-picks {
          margin: 35px 0;
        }

        .skeleton-section-title {
          height: 24px;
          width: 200px;
          background: linear-gradient(
            90deg,
            rgba(45, 75, 105, 0.3) 25%,
            rgba(78, 205, 196, 0.1) 50%,
            rgba(45, 75, 105, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .skeleton-games-row {
          display: flex;
          gap: 12px;
          overflow: hidden;
          padding: 4px;
        }

        .skeleton-game-card {
          min-width: 120px;
          background: rgba(26, 35, 50, 0.4);
          border-radius: 8px;
          padding: 3px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          backdrop-filter: blur(8px);
        }

        .skeleton-game-image {
          width: 100%;
          aspect-ratio: 427/575;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(45, 75, 105, 0.3) 25%,
            rgba(78, 205, 196, 0.1) 50%,
            rgba(45, 75, 105, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        .skeleton-sort-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(8px);
          margin-bottom: 20px;
        }

        .skeleton-filter {
          height: 34px;
          width: 150px;
          background: linear-gradient(
            90deg,
            rgba(45, 75, 105, 0.3) 25%,
            rgba(78, 205, 196, 0.1) 50%,
            rgba(45, 75, 105, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }

        .skeleton-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          grid-gap: 10px;
          padding: 4px;
        }

        .skeleton-slot {
          background: rgba(26, 35, 50, 0.4);
          border-radius: 8px;
          padding: 3px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          backdrop-filter: blur(8px);
          overflow: hidden;
        }

        .skeleton-image {
          width: 100%;
          aspect-ratio: 427/575;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(45, 75, 105, 0.3) 25%,
            rgba(78, 205, 196, 0.1) 50%,
            rgba(45, 75, 105, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Responsive adjustments */
        @media only screen and (min-width: 768px) {
          .skeleton-slots-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            grid-gap: 12px;
          }
          
          .skeleton-game-card {
            min-width: 140px;
          }
        }
        
        @media only screen and (min-width: 1200px) {
          .skeleton-slots-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          
          .skeleton-game-card {
            min-width: 150px;
          }
        }

        @media only screen and (max-width: 768px) {
          .skeleton-sort-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          
          .skeleton-filter {
            width: 100%;
          }
          
          .skeleton-title {
            width: 250px;
          }
          
          .skeleton-subtitle {
            width: 150px;
          }
        }
      `}</style>
    </>
  );
}

export default SlotsSkeleton; 