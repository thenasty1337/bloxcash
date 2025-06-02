import {createSignal, onCleanup, Show} from "solid-js";
import {A, useSearchParams} from "@solidjs/router";
import {api, authedAPI, createNotification, fetchUser} from "../../util/api";
import {useUser} from "../../contexts/usercontextprovider";
import Toggle from "../Toggle/toggle";
import "./signin.css";

function SignIn(props) {
    const [searchParams, setSearchParams] = useSearchParams()
    const [agree, setAgree] = createSignal(false)
    const [mode, setMode] = createSignal(searchParams.mode === 'signup' ? 1 : 0)

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

    // Close modal on Escape key
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            close()
        }
    }

    onCleanup(() => {
        document.removeEventListener('keydown', handleKeyDown)
    })

    document.addEventListener('keydown', handleKeyDown)

    return (
        <div class='modal' onClick={() => close()}>
            <div class='signin-container' onClick={(e) => e.stopPropagation()}>
                <button class='close' onClick={() => close()} aria-label="Close modal">
                    ×
                </button>

                <div class='content'>
                    <h2>{mode() === 0 ? 'SIGN IN' : 'SIGN UP'}</h2>
                    <h1>WELCOME TO <span class='gold'>BLOXCLASH</span></h1>

                    <div class='bar'></div>

                    <div class='options'>
                        <button 
                            class={`option ${mode() === 0 ? 'active' : ''}`} 
                            onClick={() => setMode(0)}
                            type="button"
                        >
                            LOGIN
                        </button>
                        <button 
                            class={`option ${mode() === 1 ? 'active' : ''}`} 
                            onClick={() => setMode(1)}
                            type="button"
                        >
                            SIGN UP
                        </button>
                    </div>

                    <form class='form-container' onSubmit={handleAuthSubmit}>
                        <Show when={mode() === 1}>
                            <div class='input-group'>
                                <label class='label' for="username">USERNAME</label>
                                <input
                                    id="username"
                                    type='text'
                                    placeholder='Enter your username'
                                    class='credentials'
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)}
                                    required={mode() === 1}
                                    autocomplete="username"
                                />
                            </div>
                        </Show>

                        <div class='input-group'>
                            <label class='label' for="email">EMAIL</label>
                            <input
                                id="email"
                                type='email'
                                placeholder='Enter your email'
                                class='credentials'
                                value={email()}
                                onInput={(e) => setEmail(e.target.value)}
                                required
                                autocomplete="email"
                            />
                        </div>

                        <div class='input-group'>
                            <label class='label' for="password">PASSWORD</label>
                            <input
                                id="password"
                                type='password'
                                placeholder='Enter your password'
                                class='credentials'
                                value={password()}
                                onInput={(e) => setPassword(e.target.value)}
                                required
                                autocomplete={mode() === 0 ? "current-password" : "new-password"}
                            />
                        </div>

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

                        <button 
                            type='submit' 
                            disabled={isLoading()} 
                            class={`signin ${isLoading() ? 'loading' : ''}`}
                        >
                            {isLoading() ? 'Processing...' : (mode() === 0 ? 'SIGN IN' : 'SIGN UP')}
                        </button>
                    </form>

                    <div class='art'>
                        <p class='confirm'>
                            By accessing <span class='bold'>BloxClash</span>, I attest that I am at least 18 years old and have read the <A href='/docs/tos' class='white bold strip'>Terms & Conditions.</A>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn