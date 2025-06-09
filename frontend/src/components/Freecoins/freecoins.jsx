import {useSearchParams} from "@solidjs/router";
import {createResource, createSignal, Show} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";

function Freecoins(props) {

  const [searchParams, setSearchParams] = useSearchParams()
  const [affCode, setAffCode] = createSignal('')
  const [affRes, { mutate: setAffRes }] = createResource(fetchCode)
  const [promo, setPromo] = createSignal('')

  async function fetchCode(paramsCode) {
    try {
      let res = await authedAPI('/user/affiliate/usedCode', 'GET', null)

      if (res.code) {
        setAffRes(true)
        return res.code
      }
      setAffRes(false)
      return ''
    } catch (e) {
      setAffRes(false)
      console.error(e)
      return ''
    }
  }

  function close() {
    setSearchParams({ modal: null })
  }

  return (
    <>
      <div class='modal' onClick={() => close()}>
        <div class='freecoins-container' onClick={(e) => e.stopPropagation()}>
          <div class='fancy-title'>
            <p>💎 CLAIM FREE COINS</p>
          </div>

          <p className='close bevel-light' onClick={() => close()}>X</p>

          <div class='input-wrapper'>
            <p>REDEEM AN AFFILIATE CODE</p>
            <div class='input'>
              <input type='text' placeholder='Code "Nova" for a free $0.50' value={affCode()} onInput={(e) => setAffCode(e.target.value)}/>

              <Show when={!affRes.loading}>
                {!affRes() && (
                  <button className='redeem bevel-gold' onClick={async () => {
                    if (affCode().length < 1) return

                    let res = await authedAPI('/user/affiliate', 'POST', JSON.stringify({
                      code: affCode()
                    }), true)

                    if (res.success) {
                      createNotification('success', `Successfully redeemed affiliate code ${affCode()}.`)
                    }
                  }}>REDEEM</button>
                )}
              </Show>
            </div>
          </div>

          <div className='input-wrapper'>
            <p>REDEEM A PROMO CODE</p>
            <div className='input'>
              <input type='text' placeholder='...' value={promo()} onInput={(e) => setPromo(e.target.value)}/>
              <button className='redeem bevel-gold' onClick={async () => {
                if (promo().length < 1) return

                let res = await authedAPI('/user/promo', 'POST', JSON.stringify({
                  code: promo()
                }), true)

                if (res.success) {
                  createNotification('success', `Successfully redeemed promocode ${promo()}.`)
                }
              }}>REDEEM</button>
            </div>
          </div>
          <div class='bar'/>
          <p class='claim-more'>You can claim free coins by using an affiliate code, or by redeeming a promo code posted by us on our socials.</p>

      

       
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;

          width: 100vw;
          height: 100vh;

          background: rgba(14, 11, 39, 0.65);
          backdrop-filter: blur(4px);

          display: flex;
          align-items: center;
          justify-content: center;

          z-index: 1000;
        }

        .freecoins-container {
          max-width: 870px;
          max-height: 440px;

          height: 100%;
          width: 100%;

          border-radius: 16px;
          background: 
            linear-gradient(135deg, rgba(20, 18, 48, 0.98), rgba(27, 23, 56, 0.98));
          border: 1px solid rgba(139, 120, 221, 0.3);
          backdrop-filter: blur(12px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(139, 120, 221, 0.1);

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .freecoins-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(139, 120, 221, 0.03) 0%, transparent 30%),
            radial-gradient(circle at 80% 80%, rgba(139, 120, 221, 0.02) 0%, transparent 30%);
          pointer-events: none;
          opacity: 0.7;
        }

        .fancy-title {
          width: 280px;
          height: 48px;
          
          position: absolute;
          top: -24px;

          background: linear-gradient(135deg, rgba(20, 18, 48, 0.95), rgba(27, 23, 56, 0.95));
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 12px;
          box-shadow: 
            0 4px 16px rgba(139, 120, 221, 0.2),
            inset 0 1px 0 rgba(139, 120, 221, 0.1);

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0;

          color: #FFF;
          font-size: 24px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          letter-spacing: 0.5px;
          
          z-index: 10;
          position: relative;
          overflow: hidden;
        }

        .fancy-title::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(139, 120, 221, 0.1),
            transparent
          );
          animation: slideShine 4s ease-in-out infinite;
        }

        @keyframes slideShine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        
        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;

          color: #FFF;
          font-size: 14px;
          font-weight: 700;

          width: 100%;
          max-width: 600px;
        }
        
        .input {
          border-radius: 8px;
          border: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(139, 120, 221, 0.08);

          width: 100%;
          height: 50px;
          
          display: flex;
          align-items: center;
          gap: 12px;
          
          padding: 0 12px;
          transition: all 0.3s ease;
        }

        .input:hover {
          border-color: rgba(139, 120, 221, 0.4);
          background: rgba(139, 120, 221, 0.15);
        }
        
        input {
          width: 100%;
          height: 100%;
          
          border: unset;
          outline: unset;
          background: unset;
          
          font-family: "Geogrotesque Wide", sans-serif;
          color: white;
          font-weight: 400;
        }
        
        input::placeholder {
          color: rgba(168, 163, 199, 0.7);
        }
        
        .redeem {
          width: 80px;
          height: 36px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #8b78dd, #6b5cb8);
          border: 1px solid rgba(139, 120, 221, 0.4);
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 120, 221, 0.25);
        }

        .redeem:hover {
          background: linear-gradient(135deg, #9d8de5, #7866c4);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 120, 221, 0.35);
        }

        .redeem:active {
          transform: translateY(0px);
          box-shadow: 0 2px 6px rgba(139, 120, 221, 0.25);
        }
        
        .claim-more {
          max-width: 600px;
          color: rgba(168, 163, 199, 0.9);
          font-size: 16px;
          text-align: center;
          line-height: 1.5;
        }
        
        .socials {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        a {
          display: flex;
          align-items: center;
          
          height: 30px;
          padding: 0 12px;
          line-height: 30px;
          color: white;
          fill: white;
          font-weight: 600;
          font-family: "Geogrotesque Wide", sans-serif;
          
          gap: 8px;
          
        }
        
        a svg {
          fill: white;
        }
        
        .bar {
          width: 190px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(139, 120, 221, 0.6) 50%, transparent 100%);
        }
        
        .discord {
          border-radius: 4px;
          background: #5865F2;
          box-shadow: 0px 1.5px 0px 0px #454FB7, 0px -1.5px 0px 0px #717DFE;
        }
        
        .twitch {
          border-radius: 4px;
          background: #673AB7;
          box-shadow: 0px 1.5px 0px 0px #503286, 0px -1.5px 0px 0px #7443CB;
        }
        
        .youtube {
          border-radius: 4px;
          background: #F61C0D;
          box-shadow: 0px 1.5px 0px 0px #BE2015, 0px -1.5px 0px 0px #FF4B3F;
        }
        
        .twitter {
          border-radius: 4px;
          background: #03A9F4;
          box-shadow: 0px 1.5px 0px 0px #0788C2, 0px -1.5px 0px 0px #2DBAFA;
        }

        .close {
          width: 32px;
          height: 32px;

          background: rgba(139, 120, 221, 0.15);
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          display: flex;
          align-items: center;
          justify-content: center;
          
          position: absolute;
          top: 16px;
          right: 16px;

          font-weight: 700;
          color: #a8a3c7;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close:hover {
          background: rgba(139, 120, 221, 0.25);
          border-color: #8b78dd;
          color: #8b78dd;
          transform: scale(1.05);
        }
      `}</style>
    </>
  )
}

export default Freecoins