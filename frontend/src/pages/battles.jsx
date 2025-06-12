import {getCents} from "../util/balance";
import Toggle from "../components/Toggle/toggle";
import {createEffect, createSignal, For, onCleanup} from "solid-js";
import Switch from "../components/Toggle/switch";
import BattlePreview from "../components/Battles/battlepreview";
import {useWebsocket} from "../contexts/socketprovider";
import Loader from "../components/Loader/loader";
import {A} from "@solidjs/router";
import {useUser} from "../contexts/usercontextprovider";
import {subscribeToGame, unsubscribeFromGames} from "../util/socket";
import {fillEmptySlots} from "../util/battleutil";
import {Meta, Title} from "@solidjs/meta";

function Battles(props) {

    const [toggle, setToggle] = createSignal('ALL')
    const [sortByPrice, setSortByPrice] = createSignal(true)
    const [battles, setBattles] = createSignal(null, { equals: false })
    const [user] = useUser()

    let hasConnected = false
    const [ws] = useWebsocket()

    createEffect(() => {
        if (ws() && ws().connected && !hasConnected) {
            unsubscribeFromGames(ws())
            subscribeToGame(ws(), 'battles')

            ws().on('battles:push', (b) => {
                let curBattles = battles() || []
                b.forEach((battle) => battle.players = fillEmptySlots(battle.playersPerTeam * battle.teams, battle.players))
                setBattles([...b, ...curBattles])
            })

            ws().on('battles:join', (id, user) => {
                let battleIndex = battles()?.findIndex(b => id === b.id)
                if (battleIndex < 0) return

                let curBattle = battles()[battleIndex]
                if (id !== curBattle.id) return

                curBattle.players[user.slot - 1] = user
                setBattles([...battles().slice(0, battleIndex), {...curBattle}, ...battles().slice(battleIndex + 1)])
            })

            ws().on('battles:start', (id, winnerTeam) => {
                let battleIndex = battles()?.findIndex(b => id === b.id)
                if (battleIndex < 0) return

                let curBattle = battles()[battleIndex]
                if (id !== curBattle.id) return

                curBattle.startedAt = Date.now()
                setBattles([...battles().slice(0, battleIndex), {...curBattle}, ...battles().slice(battleIndex + 1)])
            })

            ws().on('battles:ended', (id, winnerTeam) => {
                let battleIndex = battles()?.findIndex(b => id === b.id)
                if (battleIndex < 0) return

                let curBattle = battles()[battleIndex]
                if (id !== curBattle.id) return

                curBattle.endedAt = Date.now()
                curBattle.winnerTeam = +winnerTeam
                setBattles([...battles().slice(0, battleIndex), {...curBattle}, ...battles().slice(battleIndex + 1)])
            })

            hasConnected = true
        }

        hasConnected = !!ws()?.connected
    })

    function getSortedBattles(battles, toggle, sortByPrice) {
        if (!Array.isArray(battles) || battles?.length < 2) return battles

        let baseSort = battles

        if (toggle === 'JOINABLE') baseSort = baseSort.filter((battle) => battle.startedAt === null)
        else if (toggle === 'ENDED') baseSort = baseSort.filter((battle) => battle.winnerTeam !== null)

        if (sortByPrice) { // Sort by price
            baseSort = baseSort.sort((a, b) => {
                if (a.endedAt === null && b.endedAt !== null) {
                    return -1;
                } else if (a.endedAt !== null && b.endedAt === null) {
                    return 1;
                } else {
                    return b.entryPrice - a.entryPrice;
                }
            })
        } else { // Sort by date
            baseSort = baseSort.sort((a, b) => {
                if (a.endedAt === null && b.endedAt !== null) {
                    return -1;
                } else if (a.endedAt !== null && b.endedAt === null) {
                    return 1;
                } else {
                    new Date(b.createdAt) - new Date(a.createdAt)
                }
            })
        }

        return baseSort
    }

    function totalPriceOfBattles() {
        return battles()?.reduce((val, battle) => val + battle?.entryPrice, 0)
    }

    function getJoinable() {
        return battles()?.filter((battle) => battle.startedAt === null)
    }

    function isInBattle(battle) {
        if (!user()) return false
        return battle?.players?.find(player => player?.id === user()?.id)
    }

    return (
        <>
            <Title>Nova Casino | Battles</Title>
            <Meta name='title' content='Battles'></Meta>
            <Meta name='description' content='Wager Robux On Nova Casino Battles And Win Big Versus Other Roblox Players, Win Limiteds!'></Meta>

            <div class='battles-container fadein'>
                <div class='battles-header'>
                    <div class='header-section'>
                        <div class='page-title'>
                            <img src='/assets/game-icons/battles.svg' height='24' alt='Battles'/>
                            <h1>Battles</h1>
                        </div>

                        {/* <div class='total-value'>
                            <img src='/assets/icons/coin.svg' height='16'/>
                            <span class='amount'>
                                {Math.floor(totalPriceOfBattles())?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                                <span class='cents'>.{getCents(totalPriceOfBattles())}</span>
                            </span>
                        </div> */}
                    </div>

                    <div class='header-section center'>
                        <div class='filter-tabs'>
                            <button 
                                class={`tab ${toggle() === 'ALL' ? 'active' : ''}`}
                                onClick={() => setToggle('ALL')}
                            >
                                All <span class='count'>{battles()?.length || 0}</span>
                            </button>
                            <button 
                                class={`tab ${toggle() === 'JOINABLE' ? 'active' : ''}`}
                                onClick={() => setToggle('JOINABLE')}
                            >
                                Open <span class='count'>{getJoinable()?.length || 0}</span>
                            </button>
                            <button 
                                class={`tab ${toggle() === 'ENDED' ? 'active' : ''}`}
                                onClick={() => setToggle('ENDED')}
                            >
                                Ended
                            </button>
                        </div>
                    </div>

                    <div class='header-section right'>
                        <div class='sort-toggle'>
                            <span class={`sort-option ${!sortByPrice() ? 'active' : ''}`}>Date</span>
                            <Switch active={sortByPrice()} toggle={() => setSortByPrice(!sortByPrice())}/>
                            <span class={`sort-option ${sortByPrice() ? 'active' : ''}`}>Price</span>
                        </div>

                        <button class='create-battle-btn'>
                            <A href='/battle/create' class='gamemode-link'></A>
                            <span>Create Battle</span>
                        </button>
                    </div>
                </div>

                <div class='bar'/>

                {battles() ? (
                    <div class='battles'>
                        <For each={getSortedBattles(battles(), toggle(), sortByPrice()) || []}>{(battle, index) => <BattlePreview
                            battle={battle} hasJoined={isInBattle(battle)} ws={ws()}/>}</For>
                    </div>
                ) : (
                    <Loader/>
                )}
            </div>

            <style jsx>{`
              .battles-container {
                width: 100%;
                max-width: 1200px;
                height: fit-content;
                box-sizing: border-box;
                padding: 24px;
                margin: 0 auto;
              }
              
              .battles-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                gap: 24px;
              }
              
              .header-section {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              
              .header-section.center {
                flex: 1;
                justify-content: center;
              }
              
              .header-section.right {
                justify-content: flex-end;
              }
              
              .page-title {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              
              .page-title h1 {
                color: #FFFFFF;
                font-size: 22px;
                font-weight: 700;
                margin: 0;
                letter-spacing: -0.5px;
              }
              
              .total-value {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(139, 120, 221, 0.15);
                border: 1px solid rgba(139, 120, 221, 0.3);
                border-radius: 12px;
                color: #FFFFFF;
                font-weight: 600;
                min-width: 120px;
              }
              
              .total-value .amount {
                font-size: 14px;
              }
              
              .total-value .cents {
                color: #ADA3EF;
              }
              
              .filter-tabs {
                display: flex;
                background: rgba(24, 20, 52, 0.8);
                border: 1px solid rgba(139, 120, 221, 0.2);
                border-radius: 12px;
                padding: 4px;
                gap: 2px;
              }
              
              .tab {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                background: none;
                border: none;
                border-radius: 8px;
                color: #ADA3EF;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
              }
              
              .tab.active {
                background: rgba(139, 120, 221, 0.25);
                color: #FFFFFF;
              }
              
              .tab:hover:not(.active) {
                background: rgba(139, 120, 221, 0.1);
                color: #FFFFFF;
              }
              
              .tab .count {
                background: rgba(139, 120, 221, 0.4);
                color: #FFFFFF;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 6px;
                min-width: 16px;
                text-align: center;
              }
              
              .tab.active .count {
                background: rgba(255, 255, 255, 0.2);
              }
              
              .sort-toggle {
                display: flex;
                align-items: center;
                gap: 12px;
                color: #ADA3EF;
                font-size: 13px;
                font-weight: 600;
              }
              
              .sort-option {
                transition: color 0.2s ease;
              }
              
              .sort-option.active {
                color: #FFFFFF;
              }
              
              .create-battle-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                padding: 12px 20px;
                background: linear-gradient(135deg, #8b78dd, #7c6bbf);
                border: none;
                border-radius: 12px;
                color: #FFFFFF;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .create-battle-btn:hover {
                background: linear-gradient(135deg, #9d8ae8, #8b78dd);
                transform: translateY(-1px);
              }
              
              .battles {
                display: flex;
                flex-direction: column;
                width: 100%;
                gap: 16px;
              }

              @media (max-width: 1024px) {
                .battles-header {
                  flex-direction: column;
                  gap: 16px;
                  align-items: stretch;
                }
                
                .header-section.center {
                  order: 2;
                }
                
                .header-section.right {
                  order: 3;
                  justify-content: center;
                }
                
                .filter-tabs {
                  justify-content: center;
                }
              }

              @media (max-width: 768px) {
                .battles-container {
                  padding: 16px;
                  padding-bottom: 90px;
                }
                
                .page-title h1 {
                  font-size: 20px;
                }
                
                .total-value {
                  min-width: auto;
                  padding: 6px 12px;
                }
                
                .filter-tabs {
                  width: 100%;
                }
                
                .tab {
                  flex: 1;
                  justify-content: center;
                  padding: 8px 12px;
                  font-size: 13px;
                }
                
                .sort-toggle {
                  font-size: 12px;
                  gap: 8px;
                }
                
                .create-battle-btn {
                  padding: 10px 16px;
                  font-size: 13px;
                }
              }

              @media (max-width: 480px) {
                .battles-header {
                  gap: 12px;
                }
                
                .header-section {
                  gap: 12px;
                }
                
                .header-section.center {
                  order: 1;
                }
                
                .header-section:first-child {
                  order: 2;
                  justify-content: center;
                }
                
                .header-section.right {
                  order: 3;
                }
                
                .tab .count {
                  display: none;
                }
                
                .battles {
                  gap: 12px;
                }
              }
            `}</style>
        </>
    );
}

export default Battles;

