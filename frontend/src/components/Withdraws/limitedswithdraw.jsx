import {createResource, createSignal, For, Show} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";
import Loader from "../Loader/loader";
import Bundle from "../Items/bundle";
import {useSearchParams} from "@solidjs/router";

function LimitedsWithdraw(props) {

    const [peer, {mutate: mutatePeer}] = createResource(() => props?.refetch?.toString(), fetchPeer)

    const [numLoaded, setNumLoaded] = createSignal(50)

    async function fetchPeer() {
        try {
            let res = await authedAPI('/trading/limiteds', 'GET', null)
            if (!res || !Array.isArray(res)) return []
            return res
        } catch (e) {
            console.log(e)
            return []
        }
    }

    function isActive(bundle) {
        return props?.selected?.id === bundle.id
    }

    function endOfScroll(e) {
        let height = e.target.scrollHeight - e.target.clientHeight

        if (e.target.scrollTop >= height) {
            let max = peer()?.length || 0
            setNumLoaded(Math.min(numLoaded() + 50, max))
        }
    }

    return (
        <div class='flex flex-col gap-3 grow h-full items-center'>
            <div class='flex flex-col w-full overflow-y-auto grow p-3 pr-0 gap-3' onScroll={endOfScroll}>
                <Show when={peer() && !peer.loading} fallback={<Loader/>}>
                    <For each={peer()?.slice(0, numLoaded())}>{(item, index) =>
                        <Bundle bundle={item} active={isActive(item)} onClick={() => props.setSelected(item)}/>
                    }</For>
                </Show>
            </div>
        </div>
    )
}

export default LimitedsWithdraw
