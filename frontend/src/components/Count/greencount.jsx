function GreenCount(props) {
    return (
        <>
            <div class={'text-count ' + (props.active ? 'active' : '')} style={props.css}>
                <div class='simple-dot'/>
                {props?.max ? (
                    <p>{props.number} / {props?.max}</p>
                ) : (
                    <p>{props?.number}</p>
                )}
            </div>

            <style jsx>{`
              .text-count {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 24px;
                font-weight: 700;
                font-size: 11px;
                color: #9296D6;
              }
              
              .text-count.active {
                color: #59E878;
              }
              
              .simple-dot {
                height: 8px;
                width: 8px;
                background: #9296D6;
                border-radius: 50%;
              }
              
              .active .simple-dot {
                background: #59E878;
                box-shadow: 0px 0px 4px rgba(89, 232, 120, 0.5);
              }
            `}</style>
        </>
    );
}

export default GreenCount;
