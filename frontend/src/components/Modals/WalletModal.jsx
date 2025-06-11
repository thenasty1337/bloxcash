import { createSignal, Show, createResource, createEffect, For } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { authedAPI, api, createNotification, addDropdown } from "../../util/api";
import Loader from "../Loader/loader";
import { formatNumber } from "../../util/numbers";
import CryptoTX from "../Transactions/cryptotx";
// We will import the adapted deposit and withdraw components later
// import CryptoDepositContent from '../Deposits/CryptoDepositContent'; // Example, actual path/name might change
// import CryptoWithdrawContent from '../Withdraws/CryptoWithdrawContent'; // Example

const DEPOSIT_CRYPTO_METHODS = [
  { name: 'Bitcoin', id: 'BTC', apiId: 'BTC', img: '/assets/cryptos/branded/BTC.svg' },
  { name: 'Tether', id: 'USDT', apiId: 'USDT.ERC20', img: '/assets/cryptos/branded/USDT.svg' },
  { name: 'USDC', id: 'USDC', apiId: 'USDC', img: '/assets/cryptos/branded/USDC.svg' },
  { name: 'Ethereum', id: 'ETH', apiId: 'ETH', img: '/assets/cryptos/branded/ETH.svg' },
  { name: 'Ripple', id: 'XRP', apiId: 'XRP', img: '/assets/cryptos/branded/XRP.svg' },
  { name: 'TRON', id: 'TRX', apiId: 'TRX', img: '/assets/cryptos/branded/TRX.svg' },
  { name: 'Litecoin', id: 'LTC', apiId: 'LTC', img: '/assets/cryptos/branded/LTC.svg' },
  { name: 'Dogecoin', id: 'DOGE', apiId: 'DOGE', img: '/assets/cryptos/branded/DOGE.svg' },
  { name: 'BNB', id: 'BNB', apiId: 'BNB.BSC', img: '/assets/cryptos/branded/BNB.svg' }
];

function WalletModal(props) {
  const [activeTab, setActiveTab] = createSignal('deposit'); // 'deposit' or 'withdraw'

  // --- Start of CryptoDeposit Content --- 
  const [depositUSD, setDepositUSD] = createSignal(10.00); // Default to $10.00 USD for calculator
  const [depositCryptoAmount, setDepositCryptoAmount] = createSignal(0); // The amount of selected crypto
  const [depositConfirmations, setDepositConfirmations] = createSignal(0);
  const [depositRate, setDepositRate] = createSignal(0); // Stores selected crypto price in USD (1 crypto = X USD)
  const [depositCurrencyName, setDepositCurrencyName] = createSignal(''); // e.g., Ethereum
  const [depositCurrencySymbol, setDepositCurrencySymbol] = createSignal(''); // e.g., ETH
  const [depositCurrencyImg, setDepositCurrencyImg] = createSignal('');
  
  const [depositCurrencyDropdownOpen, setDepositCurrencyDropdownOpen] = createSignal(false);
  const [addressCopied, setAddressCopied] = createSignal(false);
  addDropdown(setDepositCurrencyDropdownOpen);

  const [selectedDepositCurrencyApiId, setSelectedDepositCurrencyApiId] = createSignal(DEPOSIT_CRYPTO_METHODS[1].apiId);

  const [depositAddress, { mutate: mutateDepositAddress, refetch: refetchDepositAddress }] = 
    createResource(selectedDepositCurrencyApiId, fetchCryptoDepositAddressDetails);

  createEffect(() => {
    const initialCurrency = DEPOSIT_CRYPTO_METHODS.find(c => c.apiId === selectedDepositCurrencyApiId());
    if (initialCurrency) {
        setDepositCurrencyName(initialCurrency.name);
        setDepositCurrencySymbol(initialCurrency.id);
        setDepositCurrencyImg(initialCurrency.img);
        console.log("[WalletModal - Deposit] Initial effect set display symbols for:", initialCurrency.id);
    }
  });

  // Effect to handle pre-selected crypto from carousel
  createEffect(() => {
    if (props.selectedCrypto && props.show && activeTab() === 'deposit') {
      const matchingMethod = DEPOSIT_CRYPTO_METHODS.find(method => 
        method.id === props.selectedCrypto.id || method.apiId === props.selectedCrypto.apiId
      );
      
      if (matchingMethod) {
        setSelectedDepositCurrencyApiId(matchingMethod.apiId);
      }
    }
  });

  async function fetchCryptoDepositAddressDetails(apiSymbol) {
      console.log("[WalletModal - Deposit] fetchCryptoDepositAddressDetails CALLED with apiSymbol:", apiSymbol);
      if (!apiSymbol) {
        mutateDepositAddress(null);
        setDepositRate(0); setDepositConfirmations(0);
        console.log("[WalletModal - Deposit] fetchCryptoDepositAddressDetails: No apiSymbol, address mutated to null.");
        return null;
      }
      try {
          console.log(`[WalletModal - Deposit] Making API call to /trading/crypto/deposit/wallet for apiSymbol: ${apiSymbol}`);
          let res = await authedAPI('/trading/crypto/deposit/wallet', 'POST', JSON.stringify({ currency: apiSymbol }));
          console.log("[WalletModal - Deposit] Raw Response from /trading/crypto/deposit/wallet:", res);

          if (!res || !res.address) {
            console.warn("[WalletModal - Deposit] No address in response for apiSymbol:", apiSymbol, res);
            mutateDepositAddress(null);
            setDepositRate(0); setDepositConfirmations(0);
            return null;
          }
          
          const currentMethod = DEPOSIT_CRYPTO_METHODS.find(m => m.apiId === apiSymbol);
          if (currentMethod) {
            setDepositCurrencyName(currentMethod.name);
            setDepositCurrencySymbol(currentMethod.id);
            setDepositCurrencyImg(currentMethod.img);
          }

          if (res.currency) {
            setDepositRate(res.currency.price || 0);
            setDepositConfirmations(res.currency.confirmations || 0);
            console.log(`[WalletModal - Deposit] Details from res.currency: Rate=${res.currency.price}, Confirmations=${res.currency.confirmations}`);
            convertDepositAmounts(depositUSD(), 'usd', res.currency.price || 0);
          } else {
             console.warn("[WalletModal - Deposit] res.currency not present in deposit/wallet response.");
             setDepositRate(0);
             setDepositConfirmations(0);
          }
          console.log("[WalletModal - Deposit] Mutating depositAddress with:", res.address);
          mutateDepositAddress(res.address);
          // After mutation, let's log the resource value if possible (might be tricky due to async nature)
          // setTimeout(() => console.log("[WalletModal - Deposit] depositAddress() value after mutate timeout:", depositAddress()), 0);
          return res.address;
      } catch (e) {
          console.error("Error fetching crypto deposit details for", apiSymbol, e);
          mutateDepositAddress(null);
          setDepositRate(0); setDepositConfirmations(0);
          return null; 
      }
  }
  
  createEffect(() => {
    const currency = DEPOSIT_CRYPTO_METHODS.find(c => c.apiId === selectedDepositCurrencyApiId());
    console.log("[WalletModal - Deposit] Effect for selectedDepositCurrency. Current value:", currency);
    if (currency && currency.id && typeof currency.price === 'number') { // Ensure price is a number for rate calculations
        setDepositCurrencyName(currency.name || currency.id);
        setDepositCurrencySymbol(currency.id);
        setDepositRate(currency.price);
        convertDepositAmounts(depositUSD(), 'usd', currency.price);
        // The resource `depositAddress` should refetch because its key `selectedDepositCurrencyApiId()` changes.
        // No explicit call to refetchDepositAddress() needed here usually.
    } else if (activeTab() === 'deposit' && !currency && !depositCryptoTypes.loading) {
        const types = depositCryptoTypes();
        if (Array.isArray(types) && types.length > 0) {
            console.log("[WalletModal - Deposit] Effect trying to set default selectedDepositCurrency as current is null.");
            let eth = types.find(c=> c.id === 'ETH' && typeof c.price === 'number');
            let firstValid = types.find(c => c && c.id && typeof c.price === 'number');
            const defaultToSet = eth || firstValid;
            if (defaultToSet) {
                console.log("[WalletModal - Deposit] Setting default currency from effect:", defaultToSet);
                setSelectedDepositCurrencyApiId(defaultToSet.apiId);
            } else {
                 console.warn("[WalletModal - Deposit] No valid (ETH or first) default currency found in types to set from effect.");
                 setSelectedDepositCurrencyApiId(null); // Explicitly set to null if no valid default
            }
        }
    }
  });

  function convertDepositAmounts(amount, sourceType, currentRate) {
      const rateToUse = currentRate !== undefined ? currentRate : depositRate();
      if (typeof rateToUse !== 'number' || rateToUse === 0) { // Ensure rateToUse is a valid number
        setDepositCryptoAmount(0);
        if (sourceType === 'usd') setDepositUSD(amount);
        else if (sourceType === 'crypto') setDepositCryptoAmount(amount);
        return;
      }
      if (sourceType === 'usd') {
          setDepositUSD(parseFloat(amount.toFixed(2)));
          setDepositCryptoAmount(parseFloat((amount / rateToUse).toFixed(8)));
      } else if (sourceType === 'crypto') {
          setDepositCryptoAmount(parseFloat(amount.toFixed(8)));
          setDepositUSD(parseFloat((amount * rateToUse).toFixed(2)));
      }
  }

  function handleDepositCurrencySelect(method) {
    console.log("[WalletModal - Deposit] handleDepositCurrencySelect CALLED with method:", method);
    if (method && method.apiId) {
        setSelectedDepositCurrencyApiId(method.apiId); // This will trigger the resource to refetch
        setDepositCurrencyName(method.name);
        setDepositCurrencySymbol(method.id);
        setDepositCurrencyImg(method.img);
        // Reset rate and confirmations until fetched for the new currency
        setDepositRate(0);
        setDepositConfirmations(0);
        setDepositCryptoAmount(0); // Reset crypto amount as rate changed
    } else {
        console.warn("[WalletModal - Deposit] Invalid method selected in dropdown:", method);
    }
    setDepositCurrencyDropdownOpen(false);
  }

  function formatAddressForDisplay(address) {
    if (!address || address.length < 11) return address;
    const firstPart = address.substring(0, 6);
    const lastPart = address.substring(address.length - 4);
    const middlePart = address.substring(6, address.length - 4);
    return { firstPart, middlePart, lastPart };
  }

  function copyDepositAddress() {
      if (depositAddress()) {
        navigator.clipboard.writeText(`${depositAddress()}`);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      }
  }
  // --- End of CryptoDeposit Content --- 

  // --- Start of CryptoWithdraw Content ---
  const [withdrawRobux, setWithdrawRobux] = createSignal(0);
  const [withdrawDollars, setWithdrawDollars] = createSignal(0);
  const [withdrawCryptoValue, setWithdrawCryptoValue] = createSignal(0); // Renamed to avoid conflict with depositCrypto signal
  const [withdrawRates, setWithdrawRates] = createSignal({});
  const [withdrawAddressInput, setWithdrawAddressInput] = createSignal(''); // Renamed to avoid conflict
  const [withdrawPrice, setWithdrawPrice] = createSignal(0);
  const [withdrawSymbol, setWithdrawSymbol] = createSignal('');
  const [withdrawChain, setWithdrawChain] = createSignal({});
  const [withdrawExplorers, setWithdrawExplorers] = createSignal([]);
  const [withdrawTransactions, setWithdrawTransactions] = createSignal([]);
  const [withdrawCurrencyDropdown, setWithdrawCurrencyDropdown] = createSignal(false);
  const [withdrawNetworkDropdown, setWithdrawNetworkDropdown] = createSignal(false);

  addDropdown(setWithdrawCurrencyDropdown); // Ensure addDropdown is available and correctly scoped if it's a global util
  addDropdown(setWithdrawNetworkDropdown);

  const [withdrawCryptoTypes] = createResource(fetchWithdrawCryptoInfo);
  const [withdrawTxsInfo, { refetch: refetchWithdrawTxs }] = createResource(fetchWithdrawTransactions); // Added refetch

  async function fetchWithdrawCryptoInfo() {
    try {
      let res = await api('/trading/crypto/withdraw', 'GET');
      if (!Array.isArray(res.currencies) || res.currencies.length === 0) return [];
      
      // Find USDT or take the first valid currency object
      let usdtCurrency = res.currencies.find(c => c && c.id === 'USDT' && Array.isArray(c.chains));
      let firstValidCurrency = res.currencies.find(c => c && c.id && Array.isArray(c.chains) && c.chains.length > 0);
      let defaultCurrency = usdtCurrency || firstValidCurrency; // Prioritize USDT, then first valid

      if (defaultCurrency) {
        setWithdrawRates({
            robux: res?.robuxRate?.robux || 1000,
            usd: res?.robuxRate?.usd || 3.5,
        });
        setWithdrawPrice(defaultCurrency.price || 0);
        setWithdrawSymbol(defaultCurrency.id);
        // Chains should be valid due to the find condition
        setWithdrawChain(defaultCurrency.chains.find(e => e.id === 'TRC20') || defaultCurrency.chains[0]);
        convertWithdrawAmounts(100,0,0); 
      } else {
        // Handle case where no valid default currency is found
        setWithdrawPrice(0);
        setWithdrawSymbol('');
        setWithdrawChain({});
        console.warn("No valid default currency found for withdrawal.");
      }
      setWithdrawExplorers(res.explorers || []);
      return res?.currencies || [];
    } catch (e) {
      console.error("Error fetching withdraw crypto info:", e);
      return [];
    }
  }

  async function fetchWithdrawTransactions() {
    try {
      let res = await authedAPI('/trading/crypto/withdraw/transactions', 'GET');
      if (Array.isArray(res.data)) {
        setWithdrawTransactions(res.data);
      } else {
        setWithdrawTransactions([]);
      }
      return res;
    } catch (e) {
      console.error("Error fetching withdraw transactions:", e);
      setWithdrawTransactions([]);
      return null;
    }
  }
  
  createEffect(() => {
    if(activeTab() === 'withdraw') {
        const types = withdrawCryptoTypes();
        // console.log("Withdraw createEffect: activeTab is withdraw. Types loading:", withdrawCryptoTypes.loading, "Types value:", types);
        if (!withdrawCryptoTypes.loading && Array.isArray(types) && types.length > 0 && !withdrawSymbol()) {
            // console.log("Inside condition. Types before find:", types);
            
            // Find USDT or take the first valid currency object from the loaded types
            let usdtType = types.find(t => t && t.id === 'USDT' && Array.isArray(t.chains));
            let firstValidType = types.find(t => t && t.id && Array.isArray(t.chains) && t.chains.length > 0);
            let defaultCurrency = usdtType || firstValidType;

            // console.log("Default currency selected in effect:", defaultCurrency);
            if (defaultCurrency && defaultCurrency.id) { // Ensure defaultCurrency and its id are valid
                setWithdrawSymbol(defaultCurrency.id);
                if (defaultCurrency.chains && Array.isArray(defaultCurrency.chains) && defaultCurrency.chains.length > 0) {
                    setWithdrawChain(defaultCurrency.chains.find(e => e.id === 'TRC20') || defaultCurrency.chains[0]);
                } else {
                    setWithdrawChain({});
                }
                setWithdrawPrice(defaultCurrency.price || 0);
                 if(withdrawRobux() > 0) convertWithdrawAmounts(withdrawRobux(), 0, 0);
                 else if(withdrawDollars() > 0) convertWithdrawAmounts(0, withdrawDollars(), 0);
                 else convertWithdrawAmounts(100, 0, 0); 
            } else {
                console.warn("No valid default currency could be set from loaded types in effect.");
                 // Potentially set to a known safe state or leave as is if fetchWithdrawCryptoInfo handles it
            }
        }
        refetchWithdrawTxs(); 
    }
  });

  function convertWithdrawAmounts(robux, dollars, crypto) {
    if (!withdrawRates() || !withdrawPrice() || withdrawPrice() === 0) return;

    if (robux) {
      dollars = Math.floor(robux / withdrawRates().robux * withdrawRates().usd * 10000) / 10000;
      crypto = Math.floor(dollars / withdrawPrice() * 1000000000) / 1000000000;
      setWithdrawRobux(robux);
      setWithdrawDollars(dollars);
      setWithdrawCryptoValue(crypto);
    } else if (dollars) {
      robux = Math.round(dollars / withdrawRates().usd * withdrawRates().robux * 100) / 100;
      crypto = Math.floor(dollars / withdrawPrice() * 1000000000) / 1000000000;
      setWithdrawDollars(dollars);
      setWithdrawRobux(robux);
      setWithdrawCryptoValue(crypto);
    } else if (crypto) {
      dollars = Math.floor(crypto * withdrawPrice() * 10000) / 10000;
      robux = Math.round(dollars / withdrawRates().usd * withdrawRates().robux * 100) / 100;
      setWithdrawCryptoValue(crypto);
      setWithdrawRobux(robux);
      setWithdrawDollars(dollars);
    }
  }

  function availableWithdrawChains() {
    const types = withdrawCryptoTypes();
    if (!types || types.loading || !Array.isArray(types)) return []; // Added check for Array.isArray
    const coin = types.find(c => c.id === withdrawSymbol());
    return coin?.chains || [];
  }

  function getWithdrawCoin(symbol) {
    const types = withdrawCryptoTypes();
    if (!types || types.loading || !Array.isArray(types)) return null; // Added check for Array.isArray
    return types.find(c => c.id === symbol);
  }

  function changeWithdrawCrypto(symbol) {
    let coinInfo = getWithdrawCoin(symbol);
    if (coinInfo) {
      setWithdrawSymbol(symbol);
      setWithdrawChain(coinInfo.chains[0] || {});
      setWithdrawPrice(coinInfo.price);
      convertWithdrawAmounts(withdrawRobux(), 0, 0); // Recalculate based on current Robux amount
    }
  }

  async function handleCryptoWithdraw() {
    try {
        let res = await authedAPI('/trading/crypto/withdraw', 'POST', JSON.stringify({
            currency: withdrawSymbol(),
            chain: withdrawChain().id,
            address: withdrawAddressInput(),
            amount: withdrawRobux(),
        }), true);

        if (res.error && res.error === 'KYC' && props.setKYC) {
            props.setKYC(true); // Assuming WalletModal receives setKYC prop for KYC handling
            return;
        }

        if (res.success && res.transaction) {
            setWithdrawTransactions([res.transaction, ...withdrawTransactions()].slice(0,10));
            createNotification('success', `Successfully created a ${withdrawChain().coinName || withdrawSymbol()} withdrawal worth ${withdrawRobux()} Robux.`);
            // Reset fields after successful withdrawal
            setWithdrawRobux(0);
            setWithdrawDollars(0);
            setWithdrawCryptoValue(0);
            setWithdrawAddressInput('');
        } else if (res.error) {
            createNotification('error', res.error);
        }
    } catch (e) {
        console.error("Error during crypto withdraw:", e);
        createNotification('error', 'An unexpected error occurred during withdrawal.');
    }
  }

  function cancelWithdrawCryptoTX(id) {
    let index = withdrawTransactions().findIndex(tx => tx.id === id);
    if (index < 0) return;

    // Optimistically update UI - actual cancellation should be confirmed by backend if needed
    let updatedTx = { ...withdrawTransactions()[index], status: 'cancelled' };
    const newTxs = [...withdrawTransactions()];
    newTxs[index] = updatedTx;
    setWithdrawTransactions(newTxs);
    
    // TODO: Call backend to actually cancel if your API supports it
    // authedAPI(`/trading/crypto/withdraw/cancel/${id}`, 'POST').then(...);
  }
  // --- End of CryptoWithdraw Content ---

  // Helper to attempt to parse network from apiId for display
  function getDisplayNetworkFromApiId(apiId) {
    if (apiId?.includes('.')) {
      return apiId.substring(apiId.indexOf('.') + 1);
    }
    return null; // Or 'Mainnet' or the currency symbol itself if no specific network part
  }

  if (!props.show) {
    return null;
  }

  return (
    <>

      <div class='modal fadein' onClick={() => props.close()}>
        <div class='wallet-modal-container' onClick={(e) => e.stopPropagation()}>
          <div class='header'>
            <button class='exit bevel-light' onClick={() => props.close()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M3.9497 0.447999L5.21006 1.936L6.45216 0.447999C6.68353 0.149333 6.95752 0 7.27413 0H9.6122C9.79486 0 9.90445 0.0533333 9.94099 0.16C9.9897 0.256 9.95925 0.362666 9.84966 0.48L6.79921 3.968L9.88619 7.52C9.99578 7.63733 10.0262 7.74933 9.97752 7.856C9.94099 7.952 9.83139 8 9.64873 8H6.96361C6.68353 8 6.40954 7.85067 6.14163 7.552L4.863 6.048L3.58438 7.552C3.31647 7.85067 3.04857 8 2.78067 8H0.351272C0.180788 8 0.071191 7.952 0.0224814 7.856C-0.0262283 7.74933 0.00421525 7.63733 0.113812 7.52L3.27385 3.936L0.296473 0.48C0.186876 0.362666 0.150344 0.256 0.186876 0.16C0.235586 0.0533333 0.351272 0 0.533933 0H3.10946C3.42607 0 3.70615 0.149333 3.9497 0.447999Z"
                  fill="#ADA3EF"/>
              </svg>
            </button>
            <div class='tabs'>
              <button class={`tab ${activeTab() === 'deposit' ? 'active' : ''}`} onClick={() => { setActiveTab('deposit'); if(withdrawCryptoTypes()?.length === 0) refetchWithdrawCryptoInfo(); else if (!withdrawSymbol() && withdrawCryptoTypes()?.length > 0) { setWithdrawSymbol(withdrawCryptoTypes().find(c=>c.id==='USDT')?.id || withdrawCryptoTypes()[0].id);}}}>Deposit</button>
              <button class={`tab ${activeTab() === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>Withdraw</button>
            </div>
          </div>

          <div class='content-area'>
            <Show when={activeTab() === 'deposit'}>
              <div class='crypto-deposit-content-wrapper'>
                <div class='modal-section-header' style={{"margin-bottom": "15px"}}>
                    <p class='type'>Deposit with Crypto</p>
                    <div class="bar"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                </div>
                
                <div class='withdraw-dropdowns'>
                  
                  <div class={`dropdown-wrapper ${depositCurrencyDropdownOpen() ? 'active' : ''}`} 
                      onClick={(e) => { setDepositCurrencyDropdownOpen(!depositCurrencyDropdownOpen()); e.stopPropagation(); }}>
                        
                      <p>Currency: </p>
                      <Show when={depositCurrencySymbol()} fallback={<p class='white bold'>Select</p>}>
                          <img src={depositCurrencyImg()} 
                              height='18' alt={depositCurrencySymbol()} onError={(e) => e.currentTarget.classList.add('image-error')}/>
                          <p class='white bold'>{depositCurrencySymbol()}</p>
                          <Show when={getDisplayNetworkFromApiId(selectedDepositCurrencyApiId())}>
                              <span>({getDisplayNetworkFromApiId(selectedDepositCurrencyApiId())})</span>
                          </Show>
                      </Show>
                      <img class='arrow' src='/assets/icons/dropdownarrow.svg' alt=''/>
                      <div class='dropdown-container modal-dropdown-options' onClick={(e) => e.stopPropagation()}>
                          <For each={DEPOSIT_CRYPTO_METHODS}>{(method) =>
                              <div class='option' onClick={() => handleDepositCurrencySelect(method)}>
                                  <div class='option-left'>
                                      <img src={method.img} 
                                          height='20' alt={method.id} onError={(e) => e.currentTarget.classList.add('image-error')}/> 
                                      <div class='option-text'>
                                          <span class='currency-name'>{method.id}</span>
                                          <span class='currency-full-name'>{method.name}</span>
                                      </div>
                                  </div>
                                  <Show when={getDisplayNetworkFromApiId(method.apiId)}>
                                      <span class='network-badge'>{getDisplayNetworkFromApiId(method.apiId)}</span>
                                  </Show>
                              </div>
                          }</For>
                      </div>
                  </div>
                </div>


                <Show when={selectedDepositCurrencyApiId() && !depositAddress.loading && depositAddress()} 
                      fallback={
                        <Show when={selectedDepositCurrencyApiId() && depositAddress.loading} keyed>
                            <div style={{padding: '20px', textAlign: 'center'}}><Loader text={`Fetching ${depositCurrencySymbol() || selectedDepositCurrencyApiId()} address...`}/></div>
                        </Show>
                      }>
                    <div style={{"margin-top": "10px"}}>
                        <label class='input-label'>Deposit Address ({selectedDepositCurrencyApiId()})</label>
                        <div class='input deposit-address-display'>
                            <div class='address-text'>
                              <Show when={depositAddress()} keyed>
                                {(address) => {
                                  const { firstPart, middlePart, lastPart } = formatAddressForDisplay(address);
                                  return (
                                    <>
                                      <span class='address-highlight'>{firstPart}</span>
                                      <span>{middlePart}</span>
                                      <span class='address-highlight'>{lastPart}</span>
                                    </>
                                  );
                                }}
                              </Show>
                            </div>
                            <button class='copy' onClick={copyDepositAddress}>
                                <Show when={!addressCopied()} fallback={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-success">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                }>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </Show>
                            </button>
                        </div>
                        <div class='deposit-qr-and-info'>
                            <div class='qr-code-container'>
                                <Show when={depositAddress()}><QRCodeSVG value={depositAddress()} size={132} class='qr'/></Show>
                            </div>
                            <div class='deposit-instructions-container'>
                                <div class='deposit-instruction-item'>
                                    <div class='instruction-icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADA3EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                    </div>
                                    <p>Send only <span class='gold'>{depositCurrencyName()} ({selectedDepositCurrencyApiId()})</span> to this address.</p>
                                </div>
                                <div class='deposit-instruction-item'>
                                    <div class='instruction-icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADA3EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                    </div>
                                    <p>Minimum deposit: <span class='gold'>$10.00 USD</span></p>
                                </div>
                                <div class='deposit-instruction-item'>
                                    <div class='instruction-icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADA3EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                            <path d="M9 12l2 2 4-4"></path>
                                        </svg>
                                    </div>
                                    <p>Required confirmations: <span class='gold'>{depositConfirmations()}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
                <Show when={selectedDepositCurrencyApiId() && !depositAddress() && !depositAddress.loading}>
                    <p class='text-center red-text' style={{"margin-top": "20px"}}>Could not load deposit address for {depositCurrencySymbol() || selectedDepositCurrencyApiId()}. Please try again or select another currency.</p>
                </Show>

                
                <div class='bar' style={{margin: '15px 0 0 0'}}/>
                <div class='disclaimer deposit-warning-box'>
                     <p class='disclaimer-text bold-text red-text'>Only deposit <Show when={depositCurrencyName()} fallback={<span>the selected currency</span>}><span class='gold'>{depositCurrencyName()} ({selectedDepositCurrencyApiId()})</span></Show> over the correct network. Sending other tokens may result in loss of funds.</p>
                </div>
              </div> 
            </Show>
            <Show when={activeTab() === 'withdraw'}>
              <div class='crypto-withdraw-content-wrapper'>
                <div class='modal-section-header' style={{"margin-bottom": "15px"}}>
                    <p class='type'>Withdraw Crypto</p>
                    <div class="bar"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                </div>
                
                <Show when={!withdrawCryptoTypes.loading && withdrawCryptoTypes()} fallback={<Loader/>}>
                    <>
                        <div style={{
                           
                            "margin-bottom": "10px"
                        }}>
                            <p style={{
                                "color": "#a8a3c7",
                                "font-size": "13px",
                                "font-weight": "600",
                                "margin-bottom": "12px"
                            }}>Select Currency & Network</p>
                            
                            <div class='withdraw-dropdowns'>
                                <div class={`dropdown-wrapper ${withdrawCurrencyDropdown() ? 'active' : ''}`} 
                                     onClick={(e) => { setWithdrawCurrencyDropdown(!withdrawCurrencyDropdown()); e.stopPropagation(); }}
                                     style={{
                                         "background": "rgba(139, 120, 221, 0.08)",
                                         "border": "1px solid rgba(139, 120, 221, 0.2)",
                                         "border-radius": "8px",
                                         "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
                                     }}>
                                    <p style={{"font-size": "13px"}}>Currency: </p>
                                    <Show when={withdrawSymbol()} fallback={<p class='white bold'>Select</p>}>
                                      <img src={`/assets/cryptos/branded/${withdrawSymbol().toUpperCase()}.svg`} height='18' alt={withdrawSymbol()}/>
                                      <p class='white bold'>{withdrawSymbol()}</p>
                                    </Show>
                                    <img class='arrow' src='/assets/icons/dropdownarrow.svg' alt=''/>
                                    <div class='dropdown-container modal-dropdown-options' onClick={(e) => e.stopPropagation()}
                                         style={{
                                             "box-shadow": "0 4px 12px rgba(0,0,0,0.3)",
                                             "border": "1px solid rgba(139, 120, 221, 0.3)",
                                             "border-radius": "0 0 8px 8px"
                                         }}>
                                        <For each={withdrawCryptoTypes()}>{(crypto) =>
                                            <div class='option' onClick={() => { changeWithdrawCrypto(crypto?.id); setWithdrawCurrencyDropdown(false); }}>
                                                <div class='option-left'>
                                                    <img src={`/assets/cryptos/branded/${crypto.id.toUpperCase()}.svg`} height='20' alt={crypto.id}/>
                                                    <div class='option-text'>
                                                        <span class='currency-name'>{crypto?.id}</span>
                                                        <span class='currency-full-name'>{crypto?.name || crypto?.id}</span>
                                                    </div>
                                                </div>
                                                <Show when={crypto?.chains && crypto.chains.length > 0}>
                                                    <span class='network-count'>{crypto.chains.length} network{crypto.chains.length > 1 ? 's' : ''}</span>
                                                </Show>
                                            </div>
                                        }</For>
                                    </div>
                                </div>

                                <div class={`dropdown-wrapper ${withdrawNetworkDropdown() ? 'active' : ''}`} 
                                     onClick={(e) => { setWithdrawNetworkDropdown(!withdrawNetworkDropdown()); e.stopPropagation(); }}
                                     style={{
                                         "background": "rgba(139, 120, 221, 0.08)",
                                         "border": "1px solid rgba(139, 120, 221, 0.2)",
                                         "border-radius": "8px",
                                         "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
                                     }}>
                                    <p style={{"font-size": "13px"}}>Network: </p>
                                    <Show when={withdrawChain()?.id} fallback={<p class='white bold'>Select</p>}>
                                       <p class='white bold'>{withdrawChain()?.id}</p>
                                    </Show>
                                    <img class='arrow' src='/assets/icons/dropdownarrow.svg' alt=''/>
                                    <div class='dropdown-container modal-dropdown-options' onClick={(e) => e.stopPropagation()}
                                         style={{
                                             "box-shadow": "0 4px 12px rgba(0,0,0,0.3)",
                                             "border": "1px solid rgba(139, 120, 221, 0.3)",
                                             "border-radius": "0 0 8px 8px"
                                         }}>
                                        <For each={availableWithdrawChains()}>{(chainOpt) =>
                                       
                                            <div class='option' onClick={() => { setWithdrawChain(chainOpt); setWithdrawNetworkDropdown(false); }}>
                                                <div class='option-left'>
                                                    <div class='option-text'>
                                                        <span class='currency-name'>{chainOpt?.id?.replace(/\(.*?\)/, '')?.trim() || chainOpt?.id}</span>
                                                        <span class='currency-full-name'>{chainOpt?.id?.match(/\((.*?)\)/)?.[1] || chainOpt?.id}</span>
                                                      
                                                    </div>
                                                </div>
                                                <Show when={chainOpt?.fee}>
                                                    <span class='network-fee'>Fee: {chainOpt.fee}</span>
                                                </Show>
                                            </div>
                                        }</For>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount and Address Input Container */}
                        <div class='withdraw-input-fields-container' style={{
                            "background": "rgba(27, 23, 56, 0.4)",
                            "border-radius": "12px",
                            "padding": "20px",
                            "border": "1px solid rgba(139, 120, 221, 0.15)",
                            "box-shadow": "0 4px 12px rgba(0,0,0,0.1)"
                        }}>
                            {/* Amount Input */}
                            <div>
                                <label class='input-label' style={{ "margin-bottom": "8px", "display": "block", "color": "#a8a3c7", "font-size": "14px", "font-weight": "600" }}>
                                    Amount in USD
                                </label>
                                <div class='input withdraw-input' style={{
                                    "height": "45px", 
                                    "background": "rgba(139, 120, 221, 0.08)", 
                                    "border": "1px solid rgba(139, 120, 221, 0.2)", 
                                    "border-radius": "8px", 
                                    "padding": "0 12px",
                                    "display": "flex",
                                    "align-items": "center"
                                }}>
                                    <div style={{ "color": "#a8a3c7", "font-size": "13px", "font-weight": "600" }}>$</div>
                                    <input
                                        type='number'
                                        placeholder="0.00"
                                        value={withdrawDollars()}
                                        onInput={(e) => convertWithdrawAmounts(0, e.target.valueAsNumber || 0, 0)}
                                        style={{
                                            "background": "transparent", "border": "none", "outline": "none",
                                            "color": "white", "font-size": "15px", "font-weight": "600",
                                            "text-align": "left", "flex-grow": "1", "height": "100%",
                                            "margin-left": "8px"
                                        }}
                                    />
                                    <span style={{ "color": "#a8a3c7", "font-size": "13px", "font-weight": "600", "margin-left": "auto" }}>USD</span>
                                </div>
                                
                                <div style={{
                                    "display": "flex", 
                                    "justify-content": "space-between",
                                    "margin-top": "8px",
                                    "padding": "0 5px"
                                }}>
                                    <span style={{ "color": "#a8a3c7", "font-size": "12px" }}>
                                        <img src='/assets/icons/coin.svg' height='10' alt="Robux" style={{ "vertical-align": "middle", "margin-right": "3px" }} />
                                       {withdrawCryptoValue()} {withdrawSymbol()}
                                    </span>
                                    <span style={{ "color": "#a8a3c7", "font-size": "12px" }}>
                                        Network fee: <span style={{"color": "white"}}>${formatNumber( ( (withdrawChain()?.fee || 0) * withdrawPrice() ) )} USD</span>
                                    </span>
                                </div>
                            </div>

                            {/* Address Input */}
                            <div style={{ "margin-top": "20px" }}>
                                <label class='input-label' style={{ "margin-bottom": "8px", "display": "block", "color": "#a8a3c7", "font-size": "14px", "font-weight": "600" }}>
                                    Your {withdrawSymbol() || 'Crypto'} Address
                                    <Show when={withdrawChain()?.id}>
                                        <span style={{ "font-weight": "normal", "color": "#a8a3c7", "margin-left": "6px", "font-size": "0.9em" }}>
                                            ({withdrawChain().id} Network)
                                        </span>
                                    </Show>
                                </label>
                                <div class='input withdraw-input' style={{
                                    "height": "45px", 
                                    "background": "rgba(139, 120, 221, 0.08)", 
                                    "border": "1px solid rgba(139, 120, 221, 0.2)", 
                                    "border-radius": "8px", 
                                    "padding": "0 12px",
                                    "display": "flex",
                                    "align-items": "center"
                                }}>
                                    <input
                                        type='text'
                                        class='white-placeholder'
                                        placeholder={`Enter your ${withdrawSymbol() || 'selected currency'} address`}
                                        value={withdrawAddressInput()}
                                        onInput={(e) => setWithdrawAddressInput(e.target.value)}
                                        style={{
                                            "background": "transparent", "border": "none", "outline": "none",
                                            "color": "white", "font-size": "13px", "font-weight": "400",
                                            "text-align": "left", "flex-grow": "1", "height": "100%"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            class='bevel-gold submit-withdraw-button' 
                            onClick={handleCryptoWithdraw} 
                            disabled={withdrawDollars() <= 0 || !withdrawAddressInput() || !withdrawChain()?.id}
                            style={{
                                "margin-top": "20px",
                                "height": "40px",
                                "border-radius": "6px",
                                "font-size": "14px",
                                "letter-spacing": "0.5px",
                                "transition": "all 0.2s ease",
                                "box-shadow": "0 4px 8px rgba(0,0,0,0.2)",
                                "width": "100%",
                                "max-width": "200px",
                                "margin-left": "auto",
                                "margin-right": "auto",
                                "display": "flex",
                                "align-items": "center",
                                "justify-content": "center",
                                "gap": "5px"
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            SUBMIT WITHDRAWAL
                        </button>
                    </>
                </Show>
              </div>
            </Show>
          </div>
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
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 1;
          backdrop-filter: blur(4px);
        }

        .image-error {
          display: none !important;
        }

        .modal.fadein {
          opacity: 1;
        }

        .wallet-modal-container {
          width: 100%;
          max-width: 550px;
          height: auto;
          max-height: 90vh;
          background: rgba(14, 11, 39, 0.95);
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 1px solid rgba(139, 120, 221, 0.2);
          backdrop-filter: blur(12px);
        }

        .header {
          width: 100%;
          min-height: 60px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          background: rgba(27, 23, 56, 0.6);
          justify-content: space-between;
          border-bottom: 1px solid rgba(139, 120, 221, 0.2);
        }

        .exit {
          width: 25px;
          height: 25px;
          background: rgba(139, 120, 221, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .exit:hover {
          background: rgba(139, 120, 221, 0.25);
          border-color: #8b78dd;
        }
        
        .exit svg {
          fill: #a8a3c7;
          transition: fill 0.3s ease;
        }

        .exit:hover svg {
          fill: #8b78dd;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-left: auto;
          margin-right: auto;
        }

        .tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: #a8a3c7;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
          border-radius: 6px 6px 0 0;
        }

        .tab:hover {
          color: #ffffff;
          background: rgba(139, 120, 221, 0.15);
        }

        .tab.active {
          color: #ffffff;
          background: rgba(139, 120, 221, 0.25);
          border-bottom: 2px solid #8b78dd;
        }

        .content-area {
          padding: 20px;
          overflow-y: auto;
          flex-grow: 1;
          background: rgba(27, 23, 56, 0.4);
        }
        
        /* Crypto Deposit Content */
        .crypto-deposit-content-wrapper {
          width: 100%;
          height: fit-content;
          display: flex;
          flex-direction: column;
        }

        .modal-section-header {
          display: flex;
          width: 100%;
          color: #a8a3c7;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 13px;
          font-weight: 600;
          gap: 8px;
          align-items: center;
          margin-bottom: 15px;
        }

        .modal-section-header .type {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
        }

        .bar {
          flex: 1;
          height: 1px;
          min-height: 1px;
          background: rgba(139, 120, 221, 0.3);
        }

        .withdraw-dropdowns {
          display: flex;
          gap: 12px;
        }

        .dropdown-wrapper {
          flex: 1;
          height: 45px;
          border-radius: 8px;
          background: rgba(139, 120, 221, 0.08);
          color: #a8a3c7;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          position: relative;
          padding: 0 12px;
          border: 1px solid rgba(139, 120, 221, 0.2);
          transition: all 0.3s ease;
        }

        .dropdown-wrapper:hover {
          background: rgba(139, 120, 221, 0.15);
          border-color: #8b78dd;
        }

        .dropdown-wrapper img.arrow {
          margin-left: auto;
          transition: transform 0.2s;
          filter: brightness(0) saturate(100%) invert(70%) sepia(15%) saturate(1148%) hue-rotate(248deg) brightness(91%) contrast(87%);
        }

        .dropdown-wrapper.active img.arrow {
          transform: rotate(180deg);
          filter: brightness(0) saturate(100%) invert(60%) sepia(30%) saturate(1500%) hue-rotate(248deg) brightness(106%) contrast(86%);
        }

        .dropdown-container.modal-dropdown-options {
          position: absolute;
          z-index: 100;
          display: none;
          top: calc(100% + 2px);
          left: 0;
          width: 100%;
          border-radius: 0px 0px 8px 8px;
          overflow: hidden;
          background: rgba(14, 11, 39, 0.95);
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-top: none;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
        }

        .dropdown-wrapper.active .dropdown-container.modal-dropdown-options {
          display: flex;
          flex-direction: column;
        }

        .dropdown-container .option {
          background: rgba(139, 120, 221, 0.08);
          min-height: 56px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
          border-bottom: 1px solid rgba(139, 120, 221, 0.15);
          font-size: 13px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dropdown-container .option:hover {
          background: rgba(139, 120, 221, 0.2);
          color: #8b78dd;
        }

        .dropdown-container .option:last-child {
          border-bottom: none;
        }

        .option-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .option-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .currency-name {
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
        }

        .currency-full-name {
          font-weight: 400;
          font-size: 12px;
          color: #a8a3c7;
          opacity: 0.8;
        }

        .network-badge {
          background: rgba(139, 120, 221, 0.2);
          color: #8b78dd;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .network-count {
          background: rgba(168, 163, 199, 0.2);
          color: #a8a3c7;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .network-fee {
          background: rgba(255, 138, 138, 0.2);
          color: #ff8a8a;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .input-label {
          color: #a8a3c7;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }

        .input {
          border: none;
          outline: none;
          white-space: nowrap;
          flex: 1 1 0;
          height: 45px;
          border-radius: 8px;
          border: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(139, 120, 221, 0.08);
          color: #a8a3c7;
          font-family: 'Geogrotesque Wide', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .input:hover {
          border-color: rgba(139, 120, 221, 0.4);
          background: rgba(139, 120, 221, 0.15);
        }

        .input input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          flex-grow: 1;
          height: 100%;
        }

        .copy {
          border: none;
          outline: none;
          padding: 0;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .copy:hover {
          background: rgba(139, 120, 221, 0.15);
        }

        .copy svg {
          fill: none;
          stroke: #a8a3c7;
          transition: all 0.3s ease;
        }

        .copy:hover svg {
          stroke: #8b78dd;
        }

        .copy .copy-success {
          stroke: #8b78dd;
          animation: checkmark-appear 0.3s ease-out;
        }

        @keyframes checkmark-appear {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .deposit-address-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(27, 23, 56, 0.6);
          border: 1px solid rgba(139, 120, 221, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .deposit-address-display:hover {
          border-color: rgba(139, 120, 221, 0.4);
          background: rgba(139, 120, 221, 0.08);
        }

        .address-text {
          color: #ffffff;
          font-weight: 400;
          word-break: break-all;
          margin-right: 10px;
          display: flex;
          flex-wrap: nowrap;
          width: 100%;
          overflow: hidden;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .address-highlight {
          color: #8b78dd;
          font-weight: 700;
          text-shadow: 0 0 2px rgba(139, 120, 221, 0.3);
          letter-spacing: 0.3px;
        }

        .deposit-qr-and-info {
          display: flex;
          align-items: stretch;
          gap: 25px;
          margin-top: 20px;
          background: rgba(27, 23, 56, 0.4);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(139, 120, 221, 0.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .qr-code-container {
          background: white;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .qr-code-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(140deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%);
          pointer-events: none;
        }

        .deposit-instructions-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          flex: 1;
        }

        .deposit-instruction-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .deposit-instruction-item:nth-child(1) { animation-delay: 0.1s; }
        .deposit-instruction-item:nth-child(2) { animation-delay: 0.2s; }
        .deposit-instruction-item:nth-child(3) { animation-delay: 0.3s; }

        .instruction-icon {
          width: 24px;
          height: 24px;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 120, 221, 0.15);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(139, 120, 221, 0.2);
        }

        .instruction-icon svg {
          width: 14px;
          height: 14px;
          stroke: #8b78dd;
        }

        .deposit-instruction-item p {
          color: #a8a3c7;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .deposit-instruction-item .gold {
          color: #8b78dd;
          font-weight: 600;
        }

        .deposit-warning-box {
          background: rgba(139, 120, 221, 0.1);
          border: 1px solid rgba(139, 120, 221, 0.3);
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .deposit-warning-box .disclaimer-text {
          text-align: center;
          color: #a8a3c7;
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .deposit-warning-box .disclaimer-text .gold {
          color: #8b78dd;
          font-weight: 700;
        }

        .red-text {
          color: #ff8a8a !important;
        }

        .text-center {
          text-align: center;
        }

        /* Crypto Withdraw Content */
        .crypto-withdraw-content-wrapper {
          width: 100%;
          height: fit-content;
          display: flex;
          flex-direction: column;
        }

        .withdraw-input-fields-container {
          background: rgba(27, 23, 56, 0.4);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(139, 120, 221, 0.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .withdraw-input {
          height: 45px;
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.2);
          border-radius: 8px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .withdraw-input:hover {
          border-color: rgba(139, 120, 221, 0.4);
          background: rgba(139, 120, 221, 0.15);
        }

        .withdraw-input input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          flex-grow: 1;
          height: 100%;
        }

        .submit-withdraw-button {
          height: 44px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 220px;
          margin: 20px auto 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #8b78dd, #6b5cb8);
          border: 1px solid rgba(139, 120, 221, 0.4);
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 120, 221, 0.25);
        }

        .submit-withdraw-button:hover {
          background: linear-gradient(135deg, #9d8de5, #7866c4);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 120, 221, 0.35);
        }

        .submit-withdraw-button:disabled {
          background: rgba(139, 120, 221, 0.2);
          border: 1px solid rgba(139, 120, 221, 0.1);
          color: #a8a3c7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .submit-withdraw-button svg {
          stroke: currentColor;
        }

        .white-placeholder::placeholder {
          color: rgba(168, 163, 199, 0.7);
          opacity: 1;
        }

        .white-placeholder::-moz-placeholder {
          color: rgba(168, 163, 199, 0.7);
          opacity: 1;
        }

        .white-placeholder:-ms-input-placeholder {
          color: rgba(168, 163, 199, 0.7);
        }

        .white-placeholder::-ms-input-placeholder {
          color: rgba(168, 163, 199, 0.7);
        }

        .white-placeholder::-webkit-input-placeholder {
          color: rgba(168, 163, 199, 0.7);
        }

        /* Custom scrollbar */
        .content-area::-webkit-scrollbar {
          width: 4px;
        }

        .content-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: rgba(139, 120, 221, 0.3);
          border-radius: 2px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 120, 221, 0.5);
        }

        /* Dropdown scrollbar */
        .dropdown-container.modal-dropdown-options::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-container.modal-dropdown-options::-webkit-scrollbar-track {
          background: rgba(139, 120, 221, 0.1);
          border-radius: 3px;
        }

        .dropdown-container.modal-dropdown-options::-webkit-scrollbar-thumb {
          background: rgba(139, 120, 221, 0.4);
          border-radius: 3px;
        }

        .dropdown-container.modal-dropdown-options::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 120, 221, 0.6);
        }

        /* Firefox scrollbar */
        .dropdown-container.modal-dropdown-options {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 120, 221, 0.4) rgba(139, 120, 221, 0.1);
        }

        /* Responsive adjustments */
        @media only screen and (max-width: 768px) {
          .wallet-modal-container {
            max-width: 95vw;
            max-height: 95vh;
          }
          .tabs {
            gap: 5px;
          }
          .tab {
            font-size: 14px;
            padding: 8px 15px;
          }
          .deposit-qr-and-info {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          .qr-code-container {
            margin-bottom: 0;
          }
          .deposit-warning-box .disclaimer-text {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}

export default WalletModal; 