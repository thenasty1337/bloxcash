import {createResource, createSignal, For, Show} from "solid-js";
import {A} from "@solidjs/router";
import {api} from "../../util/api";
import Loader from "../Loader/loader";
import BlurImage from "../UI/BlurImage";
import { BsDiamond } from 'solid-icons/bs';
import { AiOutlineEye, AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';

function SlotsList() {

  let slotsRef
  const [slots, setSlots] = createSignal([])
  const [slotsInfo] = createResource(fetchSlots)

  async function fetchSlots() {
    try {
      let res = await api('/slots?limit=25', 'GET', null, false)
      if (!Array.isArray(res.data)) return

      setSlots(res.data)
      return res
    } catch (e) {
      console.error(e)
      return []
    }
  }

  function scrollGames(direction) {
    slotsRef.scrollBy({
      left: slotsRef.clientWidth * direction,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <div class='games-container'>
        <div class='games'>
          <div class='games-header'>
            <div class='header-content'>
              <div class='header-left'>
                
                <div class='header-text'>
                  <h2 class='title'>Slots</h2>
                  <Show when={!slotsInfo.loading} fallback={<span class='count'>Loading...</span>}>
                    <span class='count'>{slotsInfo()?.total || 0} games available</span>
                  </Show>
                </div>
              </div>

              <div class='header-right'>
                <div class='viewall-btn'>
                  <AiOutlineEye size={14} />
                  <span>See All</span>
                  <A href='/slots' class='gamemode-link'/>
                </div>
                
                <div class='nav-controls'>
                  <button class='nav-btn' onClick={() => scrollGames(-1)} type="button">
                    <AiOutlineArrowLeft size={16} />
                  </button>
                  
                  <button class='nav-btn' onClick={() => scrollGames(1)} type="button">
                    <AiOutlineArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div class='header-divider'></div>
          </div>

          <div class='slots' ref={slotsRef}>
            <Show when={!slotsInfo.loading} fallback={<Loader small={true}/>}>
              <For each={slots()}>{(slot, index) =>
                <div className='slot'>
                  <BlurImage 
                    src={`${slot.img}`}
                    blurhash={slot.blurhash}
                    style={{ 'border-radius': '6px' }}
                  />
                  <A href={`/slots/${slot.slug}`} class='gamemode-link'/>
                </div>
              }</For>
              
              {/* View All card at the end */}
              <div className='slot view-all-slot'>
                <div class='view-all-content'>
                  <div class='view-all-icon'>
                    <AiOutlineEye size={24} />
                  </div>
                  <div class='view-all-text'>
                    <span class='view-all-title'>View All</span>
                    <span class='view-all-subtitle'>{slotsInfo()?.total || 0} games</span>
                  </div>
                </div>
                <A href='/slots' class='gamemode-link'/>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <style jsx>{`
        .games-container {
          width: 100%;
          margin-top: 1.5rem;
        }

        .games {
          width: 100%;
        }

        .games-header {
          margin-bottom: 1.5rem;
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
          background: rgba(78, 205, 196, 0.1);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-icon svg {
          fill: #4ecdc4;
          opacity: 0.9;
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .count {
          font-size: 0.75rem;
          color: #8aa3b8;
          font-weight: 500;
        }

        .header-divider {
          height: 1px;
          background: linear-gradient(90deg, 
            rgba(78, 205, 196, 0.3) 0%, 
            rgba(78, 205, 196, 0.1) 30%,
            transparent 100%
          );
        }



        .viewall-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(26, 35, 50, 0.8);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .viewall-btn:hover {
          border-color: rgba(78, 205, 196, 0.4);
          background: rgba(78, 205, 196, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
        }

        .viewall-btn svg {
          opacity: 0.8;
          color: #4ecdc4;
        }

        .viewall-btn:hover svg {
          opacity: 1;
        }

        .nav-controls {
          display: flex;
          gap: 0.25rem;
        }

        .nav-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          background: rgba(26, 35, 50, 0.8);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 6px;
          color: #4ecdc4;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover {
          border-color: rgba(78, 205, 196, 0.4);
          background: rgba(78, 205, 196, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
        }

        .nav-btn svg {
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .nav-btn:hover svg {
          opacity: 1;
          transform: scale(1.1);
        }

        .nav-btn:active {
          transform: translateY(0);
        }

        .slots {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(78, 205, 196, 0.1);
          background: rgba(26, 35, 50, 0.4);
          backdrop-filter: blur(20px);
          min-height: 195px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .slots::-webkit-scrollbar {
          display: none;
        }

        .slot {
          min-width: 146px;
          width: 146px;
          height: 195px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .slot:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 8px 16px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(78, 205, 196, 0.2),
            0 0 20px rgba(78, 205, 196, 0.1);
        }

        .view-all-slot {
          background: linear-gradient(135deg, 
            rgba(78, 205, 196, 0.1) 0%, 
            rgba(26, 35, 50, 0.8) 100%
          );
          border: 2px dashed rgba(78, 205, 196, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .view-all-slot:hover {
          border-color: rgba(78, 205, 196, 0.6);
          background: linear-gradient(135deg, 
            rgba(78, 205, 196, 0.2) 0%, 
            rgba(26, 35, 50, 0.9) 100%
          );
        }

        .view-all-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          padding: 1rem;
        }

        .view-all-icon {
          width: 48px;
          height: 48px;
          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ecdc4;
          transition: all 0.3s ease;
        }

        .view-all-slot:hover .view-all-icon {
          background: rgba(78, 205, 196, 0.25);
          border-color: rgba(78, 205, 196, 0.5);
          transform: scale(1.1);
        }

        .view-all-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .view-all-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-all-subtitle {
          font-size: 0.75rem;
          color: #8aa3b8;
          font-weight: 500;
        }

        .gamemode-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .games-container {
            margin-top: 1.25rem;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-right {
            justify-content: space-between;
          }

          .title {
            font-size: 1rem;
          }

          .slots {
            gap: 0.75rem;
            padding: 0.75rem;
          }

          .slot {
            min-width: 130px;
            width: 130px;
            height: 170px;
          }

          .view-all-icon {
            width: 40px;
            height: 40px;
          }

          .view-all-title {
            font-size: 0.8rem;
          }

          .view-all-subtitle {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .header-right {
            flex-direction: column;
            gap: 0.5rem;
          }

          .viewall-btn {
            align-self: stretch;
            justify-content: center;
          }

          .nav-controls {
            align-self: stretch;
            justify-content: center;
          }

          .slots {
            gap: 0.5rem;
            padding: 0.5rem;
          }

          .slot {
            min-width: 120px;
            width: 120px;
            height: 150px;
          }

          .view-all-icon {
            width: 36px;
            height: 36px;
          }

          .view-all-content {
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .view-all-title {
            font-size: 0.75rem;
          }

          .view-all-subtitle {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </>
  );
}

export default SlotsList;
