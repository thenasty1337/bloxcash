import {createSignal, onCleanup, Show} from "solid-js";
import {A, useSearchParams} from "@solidjs/router";
import {api, authedAPI, createNotification, fetchUser} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Toggle from "../Toggle/toggle";

function SignIn(props) {

    const [searchParams, setSearchParams] = useSearchParams()
    const [agree, setAgree] = createSignal(false)
    const [mode, setMode] = createSignal(0)

    const [username, setUsername] = createSignal('')
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [rememberMe, setRememberMe] = createSignal(false)

    const [user, { mutateUser }] = useUser()

    const [isLoading, setIsLoading] = createSignal(false)

    async function handleAuthSubmit(e) {
        e.preventDefault()
        
        // Check for ToS agreement ONLY if in Signup mode
        if (mode() === 1 && !agree()) {
            return createNotification('error', 'You must agree to the Terms of Service to sign up.')
        }
        
        setIsLoading(true)

        const endpoint = mode() === 0 ? '/auth/login' : '/auth/signup';
        const payload = mode() === 0 
            ? { email: email(), password: password() } 
            : { username: username(), email: email(), password: password() };

        try {
            let data = await api(endpoint, 'POST', JSON.stringify(payload), true)

            if (data?.error) {
                createNotification('error', data.message || 'An error occurred.')
            } else if (data?.user) {
                createNotification('success', mode() === 0 ? 'Successfully logged in!' : 'Successfully signed up!')
                await fetchUser(mutateUser)
                if (props.close) props.close();
            } else {
                createNotification('error', 'An unexpected error occurred.')
            }
        } catch (e) {
            console.error("Auth Error:", e);
            createNotification('error', 'Failed to connect to server.')
        } finally {
            setIsLoading(false)
        }
    }

    function close() {
        setSearchParams({ modal: null })
    }

    return (
        <>
            <div class='modal' onClick={() => close()}>
                <div class='signin-container' onClick={(e) => e.stopPropagation()}>
                    <p class='close bevel' onClick={() => close()}>X</p>

                    <div class='content'>
                        <h2>{mode() === 0 ? 'SIGN IN' : 'SIGN UP'}</h2>
                        <h1>WELCOME TO <span class='gold'>BLOXCLASH</span></h1>

                        <div class='bar'/>

                        <div class='options'>
                            <button class={'bevel option ' + (mode() === 0 ? 'active' : '')} onClick={() => setMode(0)}>LOGIN</button>
                            <button class={'bevel option ' + (mode() === 1 ? 'active' : '')} onClick={() => setMode(1)}>SIGN UP</button>
                        </div>

                        <form class='w-full flex flex-col items-center gap-3 z-10 mt-4' onSubmit={handleAuthSubmit}>
                            <Show when={mode() === 1}>
                                <p class='label'>USERNAME</p>
                                <input
                                    type='text'
                                    placeholder='Enter your username'
                                    class='credentials'
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)}
                                    required={mode() === 1}
                                />
                            </Show>

                            <p class='label'>EMAIL</p>
                            <input
                                type='email'
                                placeholder='Enter your email'
                                class='credentials'
                                value={email()}
                                onInput={(e) => setEmail(e.target.value)}
                                required
                            />

                            <p class='label'>PASSWORD</p>
                            <input
                                type='password'
                                placeholder='Enter your password'
                                class='credentials'
                                value={password()}
                                onInput={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Show when={mode() === 0}>
                                <div class='tos'>
                                    <Toggle active={rememberMe()} toggle={() => setRememberMe(!rememberMe())}/>
                                    <p>Remember Me</p>
                                </div>
                            </Show>

                            <Show when={mode() === 1}>
                                <div class='tos'>
                                    <Toggle active={agree()} toggle={() => setAgree(!agree())}/>
                                    <p>By checking this box you agree to our <A href='/docs/tos' class='white bold strip'>Terms & Conditions</A></p>
                                </div>
                            </Show>

                            <button type='submit' disabled={isLoading()} class='bevel-gold signin'>
                                {isLoading() ? 'Processing...' : (mode() === 0 ? 'SIGN IN' : 'SIGN UP')}
                            </button>
                        </form>
                    </div>

                    <div class='art'>
                        <img src='/assets/art/signintop.png' alt='' draggable={false}/>

                        <p class='confirm'>
                            By accessing <span class='bold'>BloxClash</span>, I attest that I am at least 18 years old and have read the <A href='/docs/tos' class='white bold strip'>Terms & Conditions.</A>
                        </p>
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
                  cubic-bezier(0,1,0,1);
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  
                  z-index: 1000;
                }
                
                .signin-container {
                  max-width: 930px;
                  max-height: 630px;
                  
                  height: 100%;
                  width: 100%;

                  background: #2C2952;
                  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                  border-radius: 15px;
                  
                  display: flex;
                  transition: max-height .3s;
                  position: relative;

                  overflow: hidden;
                }

                .captcha-container {
                  max-width: 450px;
                  color: white;

                  width: 100%;

                  background: #2C2952;
                  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                  border-radius: 15px;

                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  font-weight: 700;
                  padding: 25px 0;
                  gap: 25px;
                  
                  transition: max-height .3s;
                  position: relative;

                  overflow: hidden;
                }
                
                .close {
                  position: absolute;
                  top: 15px;
                  left: 15px;

                  width: 26px;
                  height: 26px;
                  
                  background: #4E4A8D;
                  box-shadow: 0px -1px 0px #5F5AA7, 0px 1px 0px #272548;
                  border-radius: 3px;
                  
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  font-weight: 700;
                  color: #ADA3EF;
                  cursor: pointer;
                }
                
                h1 {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 32px;
                  color: #FFFFFF;
                }
                
                .gold {
                  background: linear-gradient(53.13deg, #FF9900 54.58%, #F9AC39 69.11%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  text-fill-color: transparent;
                }
                
                .content {
                  width: 100%;
                  
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  
                  padding: 25px 0 0 0;
                }
                
                h2 {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 22px;
                  color: #ADA3EF;
                }
                
                .bar {
                  width: 386px;
                  height: 1px;
                  
                  margin: 10px 0 20px 0;
                  
                  background: linear-gradient(53.13deg, #FF9900 54.58%, #F9AC39 69.11%), linear-gradient(90deg, #7435FA 0%, #435DE8 163.22%);
                  transform: matrix(1, 0, 0, -1, 0, 0);
                }
                
                .options {
                  width: 386px;
                  display: flex;
                  gap: 12px;
                  margin-bottom: 5px;
                }
                
                .option {
                  flex: 1;
                  height: 34px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;

                  display: flex;
                  align-items: center;
                  justify-content: center;
                  
                  color: #ADA3EF;
                  cursor: pointer;

                  outline: unset;
                  border: unset;
                }
                
                .option.active {
                  background: conic-gradient(from 180deg at 50% 50%, #FFDC18 -0.3deg, #B17818 72.1deg, rgba(156, 99, 15, 0.611382) 139.9deg, rgba(126, 80, 12, 0.492874) 180.52deg, rgba(102, 65, 10, 0.61) 215.31deg, #B17818 288.37deg, #FFDC18 359.62deg, #FFDC18 359.7deg, #B17818 432.1deg);
                  border-radius: 3px;
                  
                  position: relative;

                  color: #FCA31E;
                  overflow: hidden;
                  z-index: 0;
                }
                
                .option.active:before {
                  position: absolute;
                  content: '';
                  
                  width: calc(100% - 2px);
                  height: calc(100% - 2px);
                  
                  top: 1px;
                  left: 1px;
                  
                  background: linear-gradient(0deg, rgba(255, 190, 24, 0.25), rgba(255, 190, 24, 0.25)), linear-gradient(252.77deg, #1A0E33 -27.53%, #423C7A 175.86%);
                  z-index: -1;
                }
                
                .label {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  text-align: left;
                  color: #ADA3EF;
                  
                  margin: 20px 0 10px 0;
                }
                
                .credentials {
                  width: 386px;
                  height: 50px;

                  outline: unset;
                  border: unset;
                  
                  background: #28244A;
                  border: 1px solid #3E3771;
                  border-radius: 3px;
                  
                  padding: 0 12px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 13px;
                  color: #8C87C1;
                }
                
                .tos {
                  margin: 20px 0 0px 0;
                  display: flex;
                  gap: 8px;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  color: #ADA3EF;
                }
                
                .signin {
                  width: 194px;
                  height: 39px;
                  
                  margin: 35px 0;
                  
                  outline: unset;
                  border: unset;

                  font-family: 'Geogrotesque Wide';
                  font-weight: 700;
                  font-size: 14px;
                  color: #FFFFFF;
                  
                  cursor: pointer;
                }
                
                .disclaimer {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 13px;
                  text-align: center;
                  
                  margin-top: auto;
                  padding: 15px 20px;
                  color: #8C87C1;
                  
                  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(277.6deg, rgba(97, 89, 176, 0.15) 6.63%, rgba(67, 55, 141, 0.15) 87.07%);
                  border-radius: 0px 0px 0px 15px;
                }
                
                .art {
                  width: 100%;
                  max-width: 368px;

                  background: radial-gradient(116.93% 83% at 51.64% 17%, rgba(252, 164, 33, 0.3) 0%, rgba(0, 0, 0, 0) 100%);

                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: space-between;
                  
                  padding: 25px 15px 15px 15px;
                  
                  position: relative;
                }
                
                .art > * {
                  position: relative;
                  z-index: 1;
                }

                .art:before {
                  height: 100%;
                  width: 100%;

                  content: '';
                  position: absolute;

                  top: 0;
                  left: 0;
                  margin: 0 auto;

                  background: linear-gradient(358.31deg, #302E5B -15.59%, rgba(48, 45, 90, 0.729277) -5.79%, rgba(47, 44, 89, 0.526186) 1.03%, rgba(46, 43, 86, 0) 97.03%);
                  border-radius: 0px 15px 15px 0px;
                }

                .art:after {
                  height: 100%;
                  width: 100%;

                  content: '';
                  position: absolute;

                  top: 0;
                  left: 0;

                  mix-blend-mode: luminosity;
                  opacity: 0.48;
                  background-image: url("/assets/art/login.png");
                  border-radius: 0px 15px 15px 0px;
                }
                
                .confirm {
                  font-family: 'Geogrotesque Wide';
                  font-weight: 400;
                  font-size: 14px;
                  color: #ADA3EF;
                  
                  text-align: center;
                  background: linear-gradient(277.6deg, rgba(97, 89, 176, 0.15) 6.63%, rgba(67, 55, 141, 0.15) 87.07%);
                  border-radius: 7px;
                  
                  padding: 12px;
                }
                
                h1, h2 {
                  margin: unset;
                }
                
                iframe {
                  display: block;
                  margin: unset;
                  padding: unset;
                  border: none;
                }
            `}</style>
        </>
    )
}

export default SignIn