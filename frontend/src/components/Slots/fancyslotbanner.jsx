import {A} from "@solidjs/router";
import { createEffect } from "solid-js";
import BlurImage from "../UI/BlurImage";

function FancySlotBanner(props) {
  return (
    <div class='slot-container'>
      <div class='slot-frame'>
        <div class='banner'>
          <A href={`/slots/${props.slug}`} class='gamemode-link'>
            <BlurImage
              src={props.img}
              blurhash={props.blurhash}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                'border-radius': '6px'
              }}
            />
          </A>
        </div>
      </div>
      
      {props.isNew && <div class="new-tag">NEW</div>}
      {props.hasJackpot && <div class="jackpot-tag">JACKPOT</div>}

      <style jsx>{`
        .slot-container {
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 160px;
          min-width: 160px;
        }
        
        .slot-container:hover {
          transform: translateY(-4px);
          z-index: 2;
        }

        .slot-frame {
          background: rgba(54, 48, 98, 0.6);
          border-radius: 8px;
          padding: 3px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transition: box-shadow 0.2s ease, border 0.2s ease;
          border: 1px solid rgba(84, 76, 146, 0.3);
        }
        
        .slot-container:hover .slot-frame {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.6);
          padding: 2px;
        }

        .banner {
          width: 100%;
          aspect-ratio: 427/575;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          transition: transform 0.5s ease;
        }
        
        .slot-container:hover .banner {
          transform: scale(1.03);
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
          background-color: #59E878;
          color: #0D2611;
        }
        
        .jackpot-tag {
          background: linear-gradient(180deg, #FFC700 0%, #FF7A00 100%);
          color: #3A2800;
          top: 36px;
        }
        
        @media only screen and (max-width: 1000px) {
          .banner {
            max-width: unset;
          }
        }

        @media only screen and (max-width: 450px) {
          .banner {
            max-width: unset;
          }
        }
      `}</style>
    </div>
  );
}

export default FancySlotBanner;
