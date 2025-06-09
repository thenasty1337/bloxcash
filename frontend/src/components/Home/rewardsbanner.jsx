import Level from "../Level/level";
import {getUserNextLevel, progressToNextLevel} from "../../resources/levels";
import {useSearchParams} from "@solidjs/router";

function RewardsBanner(props) {

  const [params, setParams] = useSearchParams()

  return (
    <>
      <div class='rewards-banner'>
        <img class='mascot' src='/assets/mascots/landing.png' width='118' height='149' alt=''/>

        <div class='welcome'>
          {props?.user ? (
              <p>Welcome back, <span className='gold'>{props?.user?.username || ''}</span></p>
          ) : (
              <p>Welcome to <span className='gold'>Nova Casino</span></p>
          )}

          {props?.user && (
              <div className='level-progression'>
                <Level xp={props?.user?.xp || 0}/>

                <div className='level-container'>
                  <div className='xp-bar' style={{width: `${100 - progressToNextLevel(props?.user?.xp || 0)}%`}}/>
                </div>

                <Level xp={getUserNextLevel(props?.user?.xp || 0)}/>
              </div>
          )}
        </div>

        <div class='rewards'>
          <img src='/assets/art/rewards.png' alt=''/>

          {props?.user ? (
              <p><span className='gold'>{props?.user?.rewards || 0}</span> REWARDS</p>
          ) : (
              <p style={{ 'font-size': '14px' }}><span className='gold'>EARN</span> REWARDS</p>
          )}

          <button class='claim' onClick={() => {
            if (!props?.user) return setParams({ modal: 'login' })
            setParams({ modal: 'rakeback' })
          }}>
            <span>{props?.user ? 'CLAIM' : 'LOGIN'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .rewards-banner {
          flex: 1;
          min-height: 165px;
          max-width: 100%;

          border-radius: 12px;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.3) 0%, rgba(139, 120, 221, 0.1) 30%, rgba(0,0,0,0) 70%);
          border: 1px solid rgba(139, 120, 221, 0.2);

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          padding: 16px 32px;

          position: relative;
          backdrop-filter: blur(8px);
        }

        .rewards-banner:before {
          position: absolute;
          content: '';

          width: calc(100% - 2px);
          height: calc(100% - 2px);

          border-radius: 12px;
          top: 1px;
          left: 1px;
          z-index: 0;

          background: linear-gradient(135deg, #181434 0%, #0e0b27 100%);
        }

        .rewards-banner > * {
          z-index: 1;
          position: relative;
        }
        
        .mascot {
          position: absolute !important;
          z-index: 2 !important;
          left: -25;
          bottom: 0;
        }
        
        .welcome {
          height: 112px;
          width: 100%;
          
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.2) 0%, rgba(139, 120, 221, 0.05) 50%, rgba(0, 0, 0, 0.00) 100%), #1B1738;
          border: 1px solid rgba(139, 120, 221, 0.3);
          
          padding: 16px 16px 16px 70px;

          color: white;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 21px;
          font-weight: 600;
          
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          backdrop-filter: blur(8px);
        }
        
        .level-progression {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        .level-container {
          width: 100%;
          height: 8px;
          border-radius: 2525px;
          background: rgba(14, 11, 39, 0.8);
          border: 1px solid rgba(139, 120, 221, 0.1);
        }

        .xp-bar {
          height: 100%;
          background: linear-gradient(135deg, #8b78dd 0%, #7c6bbf 100%);
          border-radius: 2525px;
          box-shadow: 0 2px 8px rgba(139, 120, 221, 0.4);
        }
        
        .rewards {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          
          color: #FFF;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 18px;
          font-weight: 700;
        }
        
        .rewards img {
          margin-top: -20px;
          filter: drop-shadow(0 15px 1rem rgba(252, 163, 30, 0.3));
        }
        
        .claim {
          border-radius: 8px;
          border: 1px solid rgba(139, 120, 221, 0.4);
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.2) 0%, rgba(139, 120, 221, 0.1) 100%), #1B1738;

          width: 100px;
          height: 32px;
          
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        
        .claim:hover {
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.3) 0%, rgba(139, 120, 221, 0.15) 100%), #1B1738;
          border-color: #8b78dd;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 120, 221, 0.3);
        }
        
        .claim span {
          background: linear-gradient(135deg, #8b78dd 0%, #ffffff 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          
          font-family: "Geogrotesque Wide", sans-serif;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        
        .claim:hover span {
          background: linear-gradient(135deg, #ffffff 0%, #8b78dd 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media only screen and (max-width: 500px) {
          .welcome, .mascot {
            display: none;
          }
          
          .rewards-banner {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

export default RewardsBanner;
