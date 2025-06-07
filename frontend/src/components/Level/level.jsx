import {getUserLevel} from "../../resources/levels";
import {createEffect, createSignal} from "solid-js";

function Level(props) {

    const [level, setLevel] = createSignal(0)

    createEffect(() => {
        setLevel(getUserLevel(props?.xp))
    })

    function levelToColor(level) {
        if (level < 2) return ''
        if (level < 26) {
            return 'green'
        }
        if (level < 51) {
            return 'blue'
        }
        if (level < 76) {
            return 'pink'
        }
        if (level < 100) {
            return 'gem'
        }
        return 'fire'
    }

    return (
        <>
            <div class={'level ' + levelToColor(level()) + (props?.blend ? ' blend' : '')}>
                {levelToColor(level()) === 'gem' ? (
                    <img src='/assets/icons/greengem.png' height='10' alt=''/>
                ) : levelToColor(level()) === 'fire' ? (
                    <img src='/assets/icons/goldfire.png' height='10' alt=''/>
                ) : ''}
                <p>{level()}</p>
            </div>

            <style jsx>{`

                .level {
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                    color: white;

                    background: linear-gradient(135deg, #6B6B7D, #8F8DA1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0 6px;
                    height: 18px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);

                    display: flex;
                    align-items: center;
                    gap: 4px;
                    position: relative;
                    overflow: hidden;
                }

                .level::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                }

                .level p {
                    margin: 0;
                    font-weight: 800;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                    z-index: 1;
                }

                .level.green {
                    background: linear-gradient(135deg, #4CAF50, #66BB6A, #81C784);
                    border: 1px solid #388E3C;
                    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .level.green p {
                    color: #E8F5E8;
                }

                .blue.level {
                    background: linear-gradient(135deg, #2196F3, #42A5F5, #64B5F6);
                    border: 1px solid #1976D2;
                    color: #E3F2FD;
                    box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .blue.level p {
                    color: #E3F2FD;
                }

                .level.pink {
                    background: linear-gradient(135deg, #E91E63, #F06292, #F48FB1);
                    border: 1px solid #C2185B;
                    color: #FCE4EC;
                    box-shadow: 0 2px 6px rgba(233, 30, 99, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .level.pink p {
                    color: #FCE4EC;
                }

                .level.gem {
                    background: linear-gradient(135deg, rgba(0, 181, 156, 0.9), rgba(156, 255, 172, 0.8), rgba(0, 181, 156, 0.9));
                    border: 1px solid #00B59C;
                    box-shadow: 0 2px 8px rgba(0, 181, 156, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    position: relative;
                }

                .level.gem::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .level.gem p {
                    background: linear-gradient(135deg, #9CFFAC, #00E5CC, #9CFFAC);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-fill-color: transparent;
                    font-weight: 900;
                    z-index: 2;
                }

                .level.fire {
                    background: linear-gradient(135deg, #FF9900, #FFB74D, #FF9900);
                    border: 1px solid #F57C00;
                    box-shadow: 0 2px 8px rgba(255, 153, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    position: relative;
                }

                .level.fire::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%);
                    animation: fireShimmer 1.5s infinite;
                }

                @keyframes fireShimmer {
                    0% { transform: translateX(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) rotate(45deg); }
                }

                .level.fire p {
                    background: linear-gradient(135deg, #FFE082, #FFF3C4, #FFE082);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-fill-color: transparent;
                    font-weight: 900;
                    z-index: 2;
                }

                .level img {
                    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
                    z-index: 2;
                }
            `}</style>
        </>
    );
}

export default Level;
