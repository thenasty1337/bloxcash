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
  { name: 'Bitcoin', id: 'BTC', apiId: 'BTC', img: '/assets/icons/bitcoin.png' }, // apiId is what your backend expects for currency
  { name: 'Ethereum', id: 'ETH', apiId: 'ETH', img: '/assets/icons/ethereum.png' },
  { name: 'Litecoin', id: 'LTC', apiId: 'LTC', img: '/assets/icons/litecoin.png' },
  { name: 'BNB', id: 'BNB', apiId: 'BNB.BSC', img: '/assets/icons/bnb.png' }, // Example: apiId might differ
  { name: 'USDC', id: 'USDC', apiId: 'USDC', img: '/assets/icons/usdc.png' },
  { name: 'USDT', id: 'USDT', apiId: 'USDT.ERC20', img: '/assets/icons/usdt.png' },
  { name: 'Dogecoin', id: 'DOGE', apiId: 'DOGE', img: '/assets/icons/dogecoin.png' }
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
                <div class='modal-section-header' style={{"margin-bottom": "10px"}}>
                    <p class='type'>Deposit with Crypto</p>
                </div>
                
                <div class='withdraw-dropdowns'>
                  <div class={`dropdown-wrapper ${depositCurrencyDropdownOpen() ? 'active' : ''}`} 
                      onClick={(e) => { setDepositCurrencyDropdownOpen(!depositCurrencyDropdownOpen()); e.stopPropagation(); }}>
                      <p>Currency: </p>
                      <Show when={depositCurrencySymbol()} fallback={<p class='white bold'>Select</p>}>
                          <img src={depositCurrencyImg()} 
                              height='18' alt={depositCurrencySymbol()} onError={(e) => e.currentTarget.style.display = 'none'}/>
                          <p class='white bold'>{depositCurrencySymbol()}</p>
                          <Show when={getDisplayNetworkFromApiId(selectedDepositCurrencyApiId())}>
                              <span>({getDisplayNetworkFromApiId(selectedDepositCurrencyApiId())})</span>
                          </Show>
                      </Show>
                      <img class='arrow' src='/assets/icons/dropdownarrow.svg' alt=''/>
                      <div class='dropdown-container modal-dropdown-options' onClick={(e) => e.stopPropagation()}>
                          <For each={DEPOSIT_CRYPTO_METHODS}>{(method) =>
                              <p class='option' onClick={() => handleDepositCurrencySelect(method)}>
                                  <img src={method.img} 
                                      height='18' alt={method.id} onError={(e) => e.currentTarget.style.display = 'none'}/> 
                                  {method.id}
                              </p>
                          }</For>
                      </div>
                  </div>
                </div>

                { console.log("[WalletModal - Deposit] Rendering Address Section. Loading:", depositAddress.loading, "Address Value:", depositAddress(), "Selected API ID:", selectedDepositCurrencyApiId()) }
                <Show when={selectedDepositCurrencyApiId() && !depositAddress.loading && depositAddress()} 
                      fallback={
                        <Show when={selectedDepositCurrencyApiId() && depositAddress.loading} keyed>
                            <div style={{padding: '20px', textAlign: 'center'}}><Loader text={`Fetching ${depositCurrencySymbol() || selectedDepositCurrencyApiId()} address...`}/></div>
                        </Show>
                      }>
                    <div style={{"margin-top": "20px"}}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#59E878" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                </div>
                
                <Show when={!withdrawCryptoTypes.loading && withdrawCryptoTypes()} fallback={<Loader/>}>
                    <>
                        <div style={{
                            "background": "linear-gradient(140deg, rgba(73, 66, 119, 0.4) 0%, rgba(44, 41, 82, 0.4) 100%)",
                            "border-radius": "12px",
                            "padding": "18px",
                            "border": "1px solid rgba(75, 72, 135, 0.6)",
                            "margin-bottom": "20px"
                        }}>
                            <p style={{
                                "color": "#ADA3EF",
                                "font-size": "13px",
                                "font-weight": "600",
                                "margin-bottom": "12px"
                            }}>Select Currency & Network</p>
                            
                            <div class='withdraw-dropdowns'>
                                <div class={`dropdown-wrapper ${withdrawCurrencyDropdown() ? 'active' : ''}`} 
                                     onClick={(e) => { setWithdrawCurrencyDropdown(!withdrawCurrencyDropdown()); e.stopPropagation(); }}
                                     style={{
                                         "background": "#322F5F",
                                         "border": "1px solid #524893",
                                         "border-radius": "8px",
                                         "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
                                     }}>
                                    <p style={{"font-size": "13px"}}>Currency: </p>
                                    <Show when={withdrawSymbol()} fallback={<p class='white bold'>Select</p>}>
                                      <img src={`${import.meta.env.VITE_SERVER_URL}/public/cryptos/${withdrawSymbol()}.png`} height='18' alt={withdrawSymbol()}/>
                                      <p class='white bold'>{withdrawSymbol()}</p>
                                    </Show>
                                    <img class='arrow' src='/assets/icons/dropdownarrow.svg' alt=''/>
                                    <div class='dropdown-container modal-dropdown-options' onClick={(e) => e.stopPropagation()}
                                         style={{
                                             "box-shadow": "0 4px 12px rgba(0,0,0,0.2)",
                                             "border": "1px solid #524893",
                                             "border-radius": "0 0 8px 8px"
                                         }}>
                                        <For each={withdrawCryptoTypes()}>{(crypto) =>
                                            <p class='option' onClick={() => { changeWithdrawCrypto(crypto?.id); setWithdrawCurrencyDropdown(false); }}
                                              style={{"transition": "background 0.2s ease"}}>
                                                <img src={`${import.meta.env.VITE_SERVER_URL}/public/cryptos/${crypto.id}.png`} height='18' alt={crypto.id}/> {crypto?.id}
                                            </p>
                                        }</For>
                                    </div>
                                </div>

                                <div class={`dropdown-wrapper ${withdrawNetworkDropdown() ? 'active' : ''}`} 
                                     onClick={(e) => { setWithdrawNetworkDropdown(!withdrawNetworkDropdown()); e.stopPropagation(); }}
                                     style={{
                                         "background": "#322F5F",
                                         "border": "1px solid #524893",
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
                                             "box-shadow": "0 4px 12px rgba(0,0,0,0.2)",
                                             "border": "1px solid #524893",
                                             "border-radius": "0 0 8px 8px"
                                         }}>
                                        <For each={availableWithdrawChains()}>{(chainOpt) =>
                                            <p class='option' onClick={() => { setWithdrawChain(chainOpt); setWithdrawNetworkDropdown(false); }}
                                              style={{"transition": "background 0.2s ease"}}>
                                              {chainOpt?.id}
                                            </p>
                                        }</For>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount and Address Input Container */}
                        <div class='withdraw-input-fields-container' style={{
                            "background": "linear-gradient(140deg, #322F5F 0%, #2C2952 100%)",
                            "border-radius": "12px",
                            "padding": "20px",
                            "border": "1px solid #423B78",
                            "box-shadow": "0 4px 12px rgba(0,0,0,0.1)"
                        }}>
                            {/* Amount Input */}
                            <div>
                                <label class='input-label' style={{ "margin-bottom": "8px", "display": "block", "color": "#ADA3EF", "font-size": "14px", "font-weight": "600" }}>
                                    Amount in USD
                                </label>
                                <div class='input withdraw-input' style={{
                                    "height": "45px", 
                                    "background": "#383165", 
                                    "border": "1px solid #6258AB", 
                                    "border-radius": "6px", 
                                    "padding": "0 12px",
                                    "display": "flex",
                                    "align-items": "center"
                                }}>
                                    <div style={{ "color": "#ADA3EF", "font-size": "13px", "font-weight": "600" }}>$</div>
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
                                    <span style={{ "color": "#ADA3EF", "font-size": "13px", "font-weight": "600", "margin-left": "auto" }}>USD</span>
                                </div>
                                
                                <div style={{
                                    "display": "flex", 
                                    "justify-content": "space-between",
                                    "margin-top": "8px",
                                    "padding": "0 5px"
                                }}>
                                    <span style={{ "color": "#9489DB", "font-size": "12px" }}>
                                        <img src='/assets/icons/coin.svg' height='10' alt="Robux" style={{ "vertical-align": "middle", "margin-right": "3px" }} />
                                        {formatNumber(withdrawRobux())} Robux
                                    </span>
                                    <span style={{ "color": "#9489DB", "font-size": "12px" }}>
                                        Network fee: <span style={{"color": "white"}}>{formatNumber( ( (withdrawChain()?.fee || 0) * withdrawPrice() ) / (withdrawRates()?.usd || 3.5) * (withdrawRates()?.robux || 1000) )} <img src='/assets/icons/coin.svg' height='10' alt="Robux" style={{ "vertical-align": "middle", "margin-left": "2px" }} /></span>
                                    </span>
                                </div>
                            </div>

                            {/* Address Input */}
                            <div style={{ "margin-top": "20px" }}>
                                <label class='input-label' style={{ "margin-bottom": "8px", "display": "block", "color": "#ADA3EF", "font-size": "14px", "font-weight": "600" }}>
                                    Your {withdrawSymbol() || 'Crypto'} Address
                                    <Show when={withdrawChain()?.id}>
                                        <span style={{ "font-weight": "normal", "color": "#9489DB", "margin-left": "6px", "font-size": "0.9em" }}>
                                            ({withdrawChain().id} Network)
                                        </span>
                                    </Show>
                                </label>
                                <div class='input withdraw-input' style={{
                                    "height": "45px", 
                                    "background": "#383165", 
                                    "border": "1px solid #6258AB", 
                                    "border-radius": "6px", 
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
          background: rgba(24, 23, 47, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .modal.fadein {
          opacity: 1;
        }

        .wallet-modal-container {
          width: 100%;
          max-width: 550px; /* Slightly wider for withdraw info */
          height: auto; /* Adjusted height */
          max-height: 90vh;
          background: #2C2952;
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .header {
          width: 100%;
          min-height: 60px; /* Adjusted height */
          display: flex;
          align-items: center;
          padding: 0 20px;
          background: #322F5F;
          justify-content: space-between; /* Align items */
        }

        .exit {
          width: 25px;
          height: 25px;
          background: rgba(85, 76, 125, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }
        
        .exit svg {
            fill: #ADA3EF;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-left: auto; /* Pushes tabs to the right, leaving space for a title if needed */
          margin-right: auto; /* Centers the tabs if exit button is on one side */
        }

        .tab {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: #ADA3EF;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: border-color 0.3s, color 0.3s;
        }

        .tab:hover {
          color: #FFF;
        }

        .tab.active {
          color: #FFF;
          border-bottom: 2px solid #59E878; /* Gold color or theme accent */
        }
        
        .title { /* If we want a title like "Wallet" */
          color: #FFF;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .content-area {
          padding: 20px;
          overflow-y: auto;
          flex-grow: 1;
          background: #272248; /* Slightly different bg for content if desired */
        }
        
        /* Ensure responsive behavior if needed */
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
        }

        /* Styles from CryptoDeposit, adapted for modal */
        .crypto-deposit-content-wrapper { /* Wrapper for deposit content */
            width: 100%;
            height: fit-content;
            display: flex;
            flex-direction: column;
            /* padding: 25px 50px; /* Original padding, adjust if needed for modal */
        }

        .deposit-header {
            display: flex;
            width: 100%;
            color: #ADA3EF;
            font-family: 'Geogrotesque Wide', sans-serif;
            font-size: 13px;
            font-weight: 600;
            gap: 8px;
            align-items: center; /* Vertically align items */
        }

        .bar {
            flex: 1;
            height: 1px;
            min-height: 1px;
            background: #4B4887;
        }

        .type {
            margin-right: auto;
        }
        
        .deposit-header .white {
            color: #FFF;
        }

        .inputs {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            gap: 10px;
        }

        .input {
            border: unset;
            outline: unset;
            white-space: nowrap;
            flex: 1 1 0;
            height: 45px;
            border-radius: 3px;
            border: 1px solid #423B78;
            background: #2F2A54; /* Match content area or make slightly different */
            color: #ADA3EF;
            font-family: 'Geogrotesque Wide', sans-serif;
            font-size: 12px;
            font-weight: 700;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .input p {
            margin: 0; /* Reset margins */
        }

        .input input {
            background: unset;
            outline: unset;
            border: unset;
            width: 100%;
            height: 100%;
            text-align: center;
            color: #FFF;
            font-family: 'Geogrotesque Wide', sans-serif;
            font-size: 12px;
            font-weight: 700;
        }

        .info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #FFF;
            font-size: 12px;
        }

        .thin {
            font-weight: 400;
        }

        .copy {
            border: unset;
            outline: unset;
            padding: unset;
            background: unset;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .copy:hover {
            background: rgba(173, 163, 239, 0.1);
        }

        .copy svg {
            fill: none;
            stroke: #776EB0;
            transition: all .2s;
        }

        .copy:hover svg {
            stroke: #ADA3EF;
        }

        .copy .copy-success {
            stroke: #59E878;
            animation: checkmark-appear 0.3s ease-out;
        }

        @keyframes checkmark-appear {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }

        .conversions-container {
            display: flex;
            justify-content: center; /* Center QR and inputs */
            align-items: flex-start;
            position: relative;
            margin: 25px 0; /* Adjusted margin */
            padding: 10px 0;
            min-height: 132px;
            gap: 15px; /* Increased gap */
        }

        .conversions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-direction: column; /* Stack conversion inputs vertically */
        }

        .margin-top-15 {
            margin-top: 15px;
        }

        .conversions .input {
            max-width: 200px; /* Adjust width if needed */
            min-width: 150px;
        }

        .qr {
            /* position: absolute; */ /* Let it flow with flex */
            /* top: 0; */
            /* left: 0; */
            width: 132px;
            height: 132px;
        }

        .disclaimer {
            display: flex;
            width: 100%;
            flex-direction: column; /* Stack disclaimer and rate */
            gap: 15px; /* Add gap between text and rate box */
            align-items: center; /* Center items */
            margin-top: 20px;
        }

        .disclaimer-text {
            max-width: 90%; /* Allow more width in modal */
            text-align: center; /* Center text */
            color: #ADA3EF;
            font-size: 12px;
            font-weight: 700;
        }

        .rate {
            width: 300px; /* Slightly smaller for modal */
            height: 60px;
            border-radius: 7px;
            background: linear-gradient(59deg, #6159B0 0%, rgba(82, 72, 159, 0.52) 12.49%, rgba(76, 66, 152, 0.32) 16.42%, rgba(67, 55, 141, 0.00) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px; /* Adjusted gap */
            color: #FFF;
            font-size: 16px;
            font-weight: 700;
            position: relative; /* Change from absolute */
            /* right: 50px; */ /* Remove absolute positioning */
            /* bottom: 40px; */
            margin-top: 10px; /* Add some margin */
        }

        .swords {
            width: 100%;
            height: 100%;
            position: absolute !important;
            z-index: 0;
            opacity: 0.1;
            background-image: url("/assets/art/rainswords.png");
            background-position: center;
            background-size: cover;
            border-radius: 8px;
        }

        .rate .coin {
            position: absolute;
            left: -30px; /* Adjust position */
            z-index: 10;
        }
        
        /* Responsive adjustments for modal content if necessary */
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
          .conversions-container {
            flex-direction: column; /* Stack QR and inputs on small screens */
            align-items: center;
          }
          .conversions {
            flex-direction: column; /* Already column, ensure consistency */
          }
          .qr {
            margin-bottom: 15px; /* Add space below QR code when stacked */
          }
          .disclaimer-text {
            max-width: 100%;
          }
          .rate {
            width: 90%;
            font-size: 14px;
          }
          .rate .coin {
            left: -20px;
            height: 60px;
            width: auto;
          }
        }

        /* Withdraw content specific styles */
        .crypto-withdraw-content-wrapper {
            width: 100%;
            height: fit-content;
            display: flex;
            flex-direction: column;
        }
        .modal-section-header { /* Common style for headers in modal sections */
            display: flex; width: 100%; color: #ADA3EF;
            font-family: 'Geogrotesque Wide', sans-serif; font-size: 13px; font-weight: 600;
            gap: 8px; align-items: center;
        }
        .modal-section-header .white { color: #FFF; }
        .withdraw-dropdowns {
            display: flex; gap: 12px;
        }
        .dropdown-wrapper {
            flex: 1; height: 45px; border-radius: 5px 5px 0 0; background: rgba(82, 72, 155, 0.41);
            color: #ADA3EF; font-family: 'Geogrotesque Wide', sans-serif; font-size: 14px; font-weight: 600;
            display: flex; align-items: center; gap: 8px; cursor: pointer; position: relative; padding: 0 12px;
        }
        .dropdown-wrapper img.arrow { margin-left: auto; transition: transform 0.2s; }
        .dropdown-wrapper.active img.arrow { transform: rotate(180deg); }
        .dropdown-wrapper .dropdown-container.modal-dropdown-options {
            position: absolute; z-index: 100; display: none; top: 45px; left: 0; width: 100%;
            border-radius: 0px 0px 5px 5px; overflow: hidden; background: #3A336D; /* Darker bg for options */
            max-height: 200px; overflow-y: auto; 
        }
        .dropdown-wrapper.active .dropdown-container.modal-dropdown-options { display: flex; flex-direction: column; }
        .dropdown-container .option {
            background: #473E83; height: 40px; line-height: 40px; padding: 0 16px;
            display: flex; align-items: center; gap: 8px; color: #FFF; /* White text for options */
            border-bottom: 1px solid #3A336D; /* Separator */
        }
        .dropdown-container .option:hover { background: #524893; }
        .dropdown-container .option:last-child { border-bottom: none; }
        .dropdown-container .option img { border-radius: 3px; /* if crypto icons need it */ }

        .modal-inputs-flex-column .input { flex-basis: 100%; } /* For address input to take full width */
        .withdraw-address-input input.thin {
             text-align: left; padding-left: 10px; /* Align placeholder/text left */
        }
        .input.withdraw-address-input {
            border: 1px dashed #6258AB; background: #383165;
        }
        .withdraw-conversions-container { margin: 20px 0; }
        .withdraw-rate-box { /* Similar to deposit .rate but can be adjusted */
            width: 270px; height: 45px; margin: 0 auto 20px auto; /* Centered */
             /* ... other .rate styles if shared ... */
        }
        .withdraw-conversions .input { max-width: 180px; }
        .submit-withdraw-button {
            width: 200px; height: 40px; margin: 20px auto; display: block; /* Centered */
            font-size: 14px;
        }
        .submit-withdraw-button:disabled { 
            background: #555; border: 1px solid #444; color: #888; cursor: not-allowed; 
            box-shadow: unset;
        }
        .disclaimer.withdraw-disclaimer {
            border-radius: 8px; background: rgba(252, 163, 30, 0.12);
            padding: 12px 18px; margin-top: 15px; margin-bottom: 20px;
            text-align: center; font-size: 13px;
        }
        .disclaimer.withdraw-disclaimer .white { font-weight: bold; color: #FFF; }
        .disclaimer.withdraw-disclaimer img { vertical-align: middle; margin: 0 2px; }

        .past-withdrawals-section { margin-top: 30px; }
        .section-title { color: #FFF; font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 5px; }
        .no-transactions-text { text-align: center; color: #ADA3EF; margin-top: 15px; }
        .transactions-list { 
            display: flex; flex-direction: column; gap: 10px; 
            max-height: 300px; overflow-y: auto; padding-right: 5px; /* For scrollbar */
        }
        .modal-section-header .type { color: #FFF; font-size: 18px; }
        .input-label { color: #ADA3EF; font-size: 12px; font-weight: 600; margin-bottom: 6px; display: block; }
        .input-label.text-center { text-align: center; }
        .text-center { text-align: center; }
        .small-text { font-size: 11px; opacity: 0.8; }
        .bold-text { font-weight: bold; }
        .red-text { color: #FC4747; }
        .deposit-address-display { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #272248; border: 1px solid #423B78; border-radius: 3px; }
        .address-text { 
            color: #FFF; 
            font-weight: 400; 
            word-break: break-all; 
            margin-right: 10px;
            display: flex;
            flex-wrap: nowrap;
            width: 100%;
            overflow: hidden;
        }
        
        .address-highlight {
            color: #FFC107;
            font-weight: 700;
            text-shadow: 0 0 1px rgba(255, 193, 7, 0.2);
            letter-spacing: 0.5px;
        }

        .deposit-qr-and-info {
            display: flex;
            align-items: stretch;
            gap: 25px;
            margin-top: 20px;
            background: linear-gradient(140deg, #322F5F 0%, #2C2952 100%);
            border-radius: 12px;
            padding: 18px;
            border: 1px solid #423B78;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .qr-code-container {
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
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
        
        .qr-code-container .qr {
            border: none;
            border-radius: 0;
        }
        
        .deposit-instructions-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 14px;
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
            background: rgba(173, 163, 239, 0.1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.1);
        }
        
        .instruction-icon svg {
            width: 14px;
            height: 14px;
        }
        
        .deposit-instruction-item p {
            color: #ADA3EF;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
        }
        
        .deposit-instruction-item .gold {
            color: #FFC107;
            font-weight: 600;
        }

        .deposit-warning-box { background: rgba(252, 71, 71, 0.1); border: 1px solid rgba(252, 71, 71, 0.3); padding: 15px; border-radius: 5px; margin-top: 15px; }
        .deposit-warning-box .disclaimer-text .gold { color: #FFC107; }
        .dropdown-wrapper { background: #383165; /* ... other styles */ }
        .dropdown-wrapper.active .dropdown-container.modal-dropdown-options { border: 1px solid #4B4887; /* ... */ }

        /* Styles for Dropdowns (inspired by withdraw, ensure consistency) */
        .input-label {
            color: #ADA3EF; font-size: 12px; font-weight: 600; margin-bottom: 6px; display: block;
        }
        .dropdown-wrapper {
            flex: 1; /* For use in flex containers if needed */
            height: 45px;
            border-radius: 5px; /* Rounded corners for the whole selector */
            background: #383165; /* Match withdraw dropdown bg */
            color: #ADA3EF;
            font-family: 'Geogrotesque Wide', sans-serif;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between; /* Pushes arrow to the right */
            gap: 8px;
            cursor: pointer;
            position: relative;
            padding: 0 12px;
            border: 1px solid #4B4887; /* Consistent border */
        }
        .selected-currency-display {
            display: flex;
            align-items: center;
            gap: 8px;
            overflow: hidden; /* Prevent text overflow */
            white-space: nowrap;
        }
        .currency-icon {
            width: 18px; height: 18px; /* Explicit size */
            object-fit: contain;
        }
        .currency-symbol-text.white.bold { color: #FFF; font-weight: 700; }
        .currency-network-text {
            font-size: 0.85em;
            color: #9489DB; /* Muted network color */
            margin-left: 4px;
        }
        .placeholder-text { color: #ADA3EF; }

        .dropdown-wrapper img.arrow {
            margin-left: auto; /* Keeps arrow to the far right if selected display shrinks */
            transition: transform 0.2s;
        }
        .dropdown-wrapper.active img.arrow { transform: rotate(180deg); }

        .dropdown-container.modal-dropdown-options {
            position: absolute;
            z-index: 100;
            display: none;
            top: calc(100% + 2px); /* Position below the wrapper */
            left: 0;
            width: 100%;
            border-radius: 0px 0px 5px 5px;
            overflow: hidden;
            background: #3A336D; /* Darker bg for options */
            border: 1px solid #4B4887;
            border-top: none; /* Avoid double border with wrapper */
            max-height: 200px; 
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .dropdown-wrapper.active .dropdown-container.modal-dropdown-options { display: flex; flex-direction: column; }
        
        .dropdown-container .option {
            background: #473E83; /* Option background */
            height: 40px;
            padding: 0 12px; /* Consistent padding */
            display: flex;
            align-items: center;
            gap: 8px;
            color: #FFF; 
            border-bottom: 1px solid #3A336D; 
            white-space: nowrap;
            font-size: 13px; /* Slightly smaller for options list */
        }
        .dropdown-container .option:hover { background: #524893; }
        .dropdown-container .option:last-child { border-bottom: none; }
        .dropdown-container .option .currency-name-text.muted {
            color: #B0AACF; /* Lighter than symbol, for name */
            font-size: 0.9em;
            margin-left: 4px;
        }
        .dropdown-container .option .currency-network-text-option.muted {
             color: #9489DB; font-size: 0.85em; margin-left: auto; /* Push to right */
        }

        /* Withdraw section styles */
        .withdraw-dropdowns {
            display: flex;
            gap: 12px;
        }

        .withdraw-converter {
            display: flex;
            flex-direction: column;
            margin: 20px 0;
            gap: 20px;
        }

        .withdraw-rate-info {
            display: flex;
            justify-content: center;
        }
        
        .withdraw-amounts {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .input.usd-input {
            background: #383165;
            height: 55px;
            border-radius: 8px;
            border: 1px solid #6258AB;
            padding: 0 15px;
            font-size: 14px;
        }
        
        .input.usd-input p {
            color: #ADA3EF;
            font-weight: 600;
        }
        
        .input.usd-input input {
            color: white;
            font-size: 16px;
            font-weight: 700;
            text-align: right;
        }
        
        .withdraw-other-amounts {
            display: flex;
            gap: 10px;
            justify-content: space-between;
        }
        
        .input.robux-input,
        .input.crypto-input {
            flex: 1;
            height: 45px;
            background: #322F5F;
            border-radius: 6px;
        }
        
        .input.robux-input input,
        .input.crypto-input input {
            text-align: right;
            font-size: 14px;
        }

        .white-placeholder::placeholder {
          color: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        
        /* For Firefox */
        .white-placeholder::-moz-placeholder {
          color: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        
        /* For Internet Explorer */
        .white-placeholder:-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* For Edge */
        .white-placeholder::-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* For WebKit browsers like Chrome and Safari */
        .white-placeholder::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </>
  );
}

export default WalletModal; 