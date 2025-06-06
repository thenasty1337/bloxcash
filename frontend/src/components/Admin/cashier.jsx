import {createSignal} from "solid-js";
import {authedAPI, createNotification} from "../../util/api";
import AdminRobuxCashier from "../Cashier/robuxtxs";
import AdminCryptoCashier from "../Cashier/cryptotxs";
import {useSearchParams} from "@solidjs/router";

function AdminCashier(props) {

    const [params, setParams] = useSearchParams()
    const [username, setUsername] = createSignal('')

    const [worth, setWorth] = createSignal(3)
    const [amount, setAmount] = createSignal(1)

    function exportGiftCards(cards) {
        const blob = new Blob([cards.join('\n')], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "cards.txt";
        link.href = url;
        link.click();
    }

    return (
        <>
            <div className='content'>
            <AdminCryptoCashier/>

                <div class='filters'>
                    <div class='search-wrapper'>
                        <input class='search' placeholder='SEARCH FOR USERS' value={username()}
                               onInput={(e) => setUsername(e.target.value)}/>
                        <button class='search-button' onClick={() => setParams({search: username()})}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"
                                 fill="none">
                                <path
                                    d="M16.2987 17.8313L16.2988 17.8314C16.5039 18.0371 16.7798 18.15 17.0732 18.15C17.3511 18.15 17.6162 18.0476 17.818 17.8601C18.2484 17.4602 18.2624 16.7948 17.8478 16.3785L17.7415 16.4843L17.8478 16.3785L13.7547 12.2684C14.7979 11.0227 15.3686 9.47437 15.3686 7.86374C15.3686 3.99137 12.1072 0.85 8.10932 0.85C4.11147 0.85 0.85 3.99137 0.85 7.86374C0.85 11.7361 4.11147 14.8775 8.10932 14.8775C9.56844 14.8775 10.9619 14.4644 12.163 13.6786L16.2987 17.8313ZM8.10932 2.94054C10.929 2.94054 13.214 5.15409 13.214 7.86374C13.214 10.5734 10.929 12.7869 8.10932 12.7869C5.28964 12.7869 3.00461 10.5734 3.00461 7.86374C3.00461 5.15409 5.28964 2.94054 8.10932 2.94054Z"
                                    fill="#837EC1" stroke="#837EC1" stroke-width="0.3"/>
                            </svg>
                        </button>
                    </div>

                    <div class='dropdown-container bevel-light'>
                        <p>AMOUNT: </p>
                        <select className='dropdown gold' value={worth()} onInput={(e) => setWorth(+e.target.value)}>
                            <option value='3'>$3</option>
                            <option value='5'>$5</option>
                            <option value='10'>$10</option>
                            <option value='25'>$25</option>
                            <option value='50'>$50</option>
                            <option value='100'>$100</option>
                            <option value='250'>$250</option>
                            <option value='500'>$500</option>
                        </select>
                    </div>

                    <div className='dropdown-container bevel-light'>
                        <p>CARDS: </p>
                        <select className='dropdown' value={amount()} onInput={(e) => setAmount(+e.target.value)}>
                            <option value='1'>1</option>
                            <option value='5'>5</option>
                            <option value='10'>10</option>
                            <option value='25'>25</option>
                            <option value='50'>50</option>
                            <option value='100'>100</option>
                            <option value='250'>250</option>
                            <option value='500'>500</option>
                        </select>
                    </div>

                    <button class='generate bevel-light' onClick={async () => {
                        let res = await authedAPI(`/admin/cashier/createGiftCards`, 'POST', JSON.stringify({
                            quantity: amount(),
                            amount: worth(),
                        }))

                        if (res.success) {
                            exportGiftCards(res.codes)
                            createNotification('success', `Successfully created ${amount()} giftcards worth ${worth()}.`)
                        }
                    }}>GENERATE GIFT CARDS
                    </button>
                </div>
            </div>

            <style jsx>{`
              .table {
                display: flex;
                flex-direction: column;
                margin-bottom: 20px;
              }

              .table-header, .table-data {
                display: flex;
                justify-content: space-between;
              }

              .table-header {
                margin: 0 0 20px 0;
              }

              .table-data {
                height: 55px;
                background: rgba(90, 84, 153, 0.35);
                padding: 0 20px;

                display: flex;
                align-items: center;

                color: #ADA3EF;
                font-size: 14px;
                font-weight: 700;
              }

              .table-data:nth-of-type(2n) {
                background: rgba(90, 84, 153, 0.15);
              }

              .table-column {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1 1 0;
              }

              .table-column:nth-of-type(4n) {
                justify-content: flex-end;
              }

              .table-header p {
                background: rgba(90, 84, 153, 0.35);
                height: 25px;
                line-height: 25px;
                padding: 0 15px;
                border-radius: 2px;

                color: #ADA3EF;
                font-size: 12px;
                font-weight: 700;
              }

              .view {
                background: unset;
                outline: unset;
                border: unset;

                display: flex;
                align-items: center;
                gap: 6px;

                color: #ADA3EF;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 14px;
                font-weight: 700;

                cursor: pointer;
              }

              .content {
                display: flex;
                gap: 35px;
              }

              .filters {
                width: 100%;
                max-width: 290px;
                gap: 12px;

                display: flex;
                flex-direction: column;
              }

              .search-wrapper {
                width: 100%;
                height: 50px;

                display: flex;

                border-radius: 5px;
                background: rgba(0, 0, 0, 0.15);
              }

              .search {
                width: 100%;
                height: 100%;

                background: unset;
                border: unset;
                outline: unset;

                color: white;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 15px;
                font-weight: 700;

                padding: 0 15px;
              }

              .search::placeholder {
                color: #837EC1;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 15px;
                font-weight: 700;
              }

              .search-button {
                height: 100%;
                min-width: 50px;

                outline: unset;
                border: unset;

                background: rgba(0, 0, 0, 0.12);
                cursor: pointer;
              }

              .users-wrapper {
                width: 100%;
              }

              .approve {
                  outline: unset;
                  border: unset;

                  border-radius: 3px;
                  background: #59E878;
                  box-shadow: 0px 1px 0px 0px #3CAC54, 0px -1px 0px 0px #96FFAD;

                  color: #FFF;
                  font-family: Geogrotesque Wide, sans-serif;
                  font-size: 14px;
                  font-weight: 600;

                  width: 78px;
                  height: 33px;

                  cursor: pointer;
              }

              .remove {
                outline: unset;
                border: unset;

                border-radius: 3px;
                background: #E2564D;
                box-shadow: 0px 1px 0px 0px #A1443E, 0px -1px 0px 0px #FF8D86;

                color: #FFF;
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 14px;
                font-weight: 600;

                width: 78px;
                height: 33px;

                cursor: pointer;
              }

              .generate {
                width: 100%;
                height: 40px;

                font-family: Geogrotesque Wide, sans-serif;
                font-weight: 600;
                font-size: 15px;
              }

              .dropdown-container {
                width: 100%;
                height: 40px;

                font-family: Geogrotesque Wide, sans-serif;
                font-weight: 600;
                font-size: 15px;
                color: #ADA3EF;

                display: flex;
                align-items: center;
                gap: 4px;

                padding: 0 12px;
              }

              .dropdown {
                width: 100%;
                height: 100%;

                background: unset;
                border: unset;
                outline: unset;

                font-family: Geogrotesque Wide, sans-serif;
                font-size: 15px;
                font-weight: 700;
                color: white;
              }

              .dropdown option {
                font-family: Geogrotesque Wide, sans-serif;
                font-size: 15px;
                font-weight: 700;
              }

              .dropdown.gold option {
                color: var(--gold);
              }

              option {
                background: rgba(90, 84, 153, 1);
              }
            `}</style>
        </>
    );
}

export default AdminCashier;
