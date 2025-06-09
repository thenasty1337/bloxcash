import Level from "../Level/level";
import {levelToXP} from "../../resources/levels";
import Avatar from "../Level/avatar";
import {authedAPI} from "../../util/api";

const NotificationTitles = {
  'withdraw-completed': 'Withdraw',
  'deposit-completed': 'Deposit',
  'tip-received': 'Tip',
  'rewards-claimed': 'Rewards',
  'level-up': 'Rewards',
}

function Notification(props) {

  const NotificationContent = {
    'withdraw-completed': () => <div>
      Your withdraw of
      <img src='/assets/icons/coin.svg' height='18' width='19' alt=''/>
      <span class='white bold'>{props?.content?.amount?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}</span>
      succeeded.
    </div>,

    'deposit-completed': () => <div>
      Your deposit of
      <img src='/assets/icons/coin.svg' height='18' width='19' alt=''/>
      <span className='white bold'>{props?.content?.amount?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}</span>
      has been credited.
    </div>,

    'tip-received': () => <div class='tip'>
      <Avatar id={props?.content?.fromUser?.id} height='24' avatar={props?.content?.fromUser?.avatar}/> <p class='white bold'>{props?.content?.fromUser?.username}</p> <Level xp={props?.content?.fromUser?.xp}/>
      tipped you &nbsp;
      <span class='fancyamt'>
        <img src='/assets/icons/coin.svg' height='18' width='19' alt=''/>
        {props?.content?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </span>
    </div>,

    'reward-claimed': () => <div>
      <span class='gold'>You claimed: </span>
      <div class='flex'>
        <span className='fancyamt'>
          <img src='/assets/icons/coin.svg' height='18' width='19' alt=''/>
          {props?.content?.amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </span> from your rewards.
      </div>
    </div>,

    'level-up': () => <p class='gold'>Congrats, you leveled up! <Level xp={levelToXP(props?.content?.level)}/></p>,
  }

  return (
    <>
      <div className='notification'>
        <p class='title'>
          <img src='/assets/icons/bell.svg' height='15' width='12' alt=''/>
          {NotificationTitles[props?.type]}
        </p>

        <button class='trash' onClick={async () => {
          let res = await authedAPI(`/user/notifications/${props?.id}`, 'DELETE', null, true)

          if (res.success) {
            props?.delete()
          }
        }}>
          <img src='/assets/icons/trash.svg' height='13' width='12' alt=''/>
        </button>

        <div class='content'>
          {NotificationContent[props?.type]}
        </div>
      </div>

      <style jsx>{`
        .notification {
          width: 100%;
          height: fit-content;
          margin-bottom: 8px;

          border-radius: 10px;
          border: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(14, 11, 39, 0.6);
          backdrop-filter: blur(8px);

          display: flex;
          flex-direction: column;

          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          font-weight: 500;

          position: relative;
          transition: all 0.2s ease;
        }
        
        .notification:hover {
          background: rgba(14, 11, 39, 0.8);
          border-color: rgba(139, 120, 221, 0.3);
          transform: translateY(-1px);
        }

        .title {
          height: auto;
          width: fit-content;
          padding: 8px 12px 6px;
          margin: 0;

          border-radius: 10px 10px 0 0;
          background: rgba(139, 120, 221, 0.15);
          border-bottom: 1px solid rgba(139, 120, 221, 0.2);

          color: #8b78dd;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .trash {
          height: 28px;
          width: 28px;
          
          background: rgba(139, 120, 221, 0.15);
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 6px;
          
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          
          position: absolute;
          top: 8px;
          right: 8px;
          
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .trash:hover {
          background: rgba(139, 120, 221, 0.25);
          border-color: rgba(139, 120, 221, 0.5);
          transform: translateY(-1px);
        }

        .content {
          padding: 12px 16px 16px;
          color: #a8a3c7;
        }

        .content > div, .content > p {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 13px;
          line-height: 1.4;

          cursor: initial;
          align-items: center;
        }

        .gold {
          color: #8b78dd !important;
          font-weight: 600;
        }

        .fancyamt {
          border-radius: 6px;
          border: 1px solid rgba(139, 120, 221, 0.4);
          background: linear-gradient(135deg, rgba(139, 120, 221, 0.2), rgba(139, 120, 221, 0.1));
          box-shadow: 0 2px 8px rgba(139, 120, 221, 0.2);

          height: 28px;
          padding: 0 10px;

          color: #ffffff;
          font-weight: 600;
          font-size: 13px;

          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
        }
        
        .flex {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
      `}</style>
    </>
  );
}

export default Notification
