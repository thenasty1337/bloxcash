import { createSignal, Show } from "solid-js";
import { authedAPI, createNotification } from "../../util/api";
import Loader from "../Loader/loader";

function NewUserModal(props) {
  const [loading, setLoading] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal("USER");
  const [balance, setBalance] = createSignal(0);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (username().length < 3 || username().length > 20) {
      return createNotification("error", "Username must be between 3 and 20 characters");
    }

    if (password().length < 8) {
      return createNotification("error", "Password must be at least 8 characters");
    }

    if (email() && !email().includes("@")) {
      return createNotification("error", "Please enter a valid email address");
    }

    setLoading(true);
    
    try {
      const userData = {
        username: username(),
        password: password(),
        role: role(),
        balance: parseFloat(balance()) || 0
      };
      
      if (email()) {
        userData.email = email();
      }
      
      const response = await authedAPI("/admin/users", "POST", userData);
      
      if (response?.success) {
        createNotification("success", `User ${username()} created successfully!`);
        props.onSuccess(response.user);
        props.close();
      } else {
        const errorMessage = response?.error || "Failed to create user";
        createNotification("error", errorMessage === "USERNAME_TAKEN" ? "Username already taken" : errorMessage);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      createNotification("error", "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal" onClick={() => props?.close()}>
        <div class="user-container" onClick={(e) => e.stopPropagation()}>
          <Show when={!loading()} fallback={<Loader />}>
            <>
              <div className="user-header">
                <p className="close bevel-light" onClick={() => props?.close()}>
                  X
                </p>
                <h1>
                  <img src="/assets/icons/user-plus.svg" style={{ margin: "0 8px 0 0" }} />
                  CREATE NEW USER
                </h1>
              </div>

              <div className="user-content">
                <form onSubmit={handleCreateUser}>
                  <div class="form-group">
                    <label class="form-label">Username</label>
                    <div class="input-wrapper">
                      <input
                        class="input"
                        type="text"
                        value={username()}
                        onInput={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Password</label>
                    <div class="input-wrapper">
                      <input
                        class="input"
                        type="password"
                        value={password()}
                        onInput={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Email (Optional)</label>
                    <div class="input-wrapper">
                      <input
                        class="input"
                        type="email"
                        value={email()}
                        onInput={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Role</label>
                    <div class="input-wrapper">
                      <select
                        class="input"
                        value={role()}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="USER">User</option>
                        <option value="MOD">Moderator</option>
                        <option value="DEV">Developer</option>
                        <option value="ADMIN">Admin</option>
                        <option value="BOT">Bot</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Initial Balance</label>
                    <div class="input-wrapper">
                      <input
                        class="input"
                        type="number"
                        step="0.01"
                        value={balance()}
                        onInput={(e) => setBalance(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="submit" class="create-button">
                      Create User
                    </button>
                    <button
                      type="button"
                      class="cancel-button"
                      onClick={() => props?.close()}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          </Show>
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          z-index: 100;
          
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-container {
          width: 100%;
          max-width: 700px;
          min-height: 400px;
          background: #353067;

          border-radius: 8px;
          border: 1px solid #5A5499;
          
          animation: appear 0.3s ease;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .user-header {
          width: 100%;
          height: 70px;
          padding: 0 20px;

          border-bottom: 1px solid #5A5499;

          display: flex;
          align-items: center;
          gap: 10px;

          position: relative;
        }

        .user-header h1 {
          color: #FFF;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 17px;
          font-weight: 600;
          text-transform: uppercase;
          
          display: flex;
          align-items: center;
        }

        .close {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);

          width: 25px;
          height: 25px;
          border-radius: 3px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 700;
          color: #ADA3EF;
          cursor: pointer;
        }

        .user-content {
          padding: 30px 20px;
          width: 100%;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: #ADA3EF;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          font-family: Geogrotesque Wide, sans-serif;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          height: 45px;
          gap: 10px;
          padding: 8px 12px;

          border-radius: 5px;
          background: rgba(0, 0, 0, 0.15);

          width: 100%;
        }

        .input {
          width: 100%;
          height: 100%;
          background: unset;
          border: unset;
          outline: unset;

          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          color: white;
          font-size: 14px;
        }

        select.input {
          cursor: pointer;
          appearance: none;
          background: url('/assets/icons/dropdown-arrow.svg') no-repeat right center;
          padding-right: 20px;
        }

        option {
          background: rgba(90, 84, 153, 1);
          padding: 10px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          justify-content: flex-end;
        }

        .create-button, .cancel-button {
          padding: 0 20px;
          height: 40px;
          border: none;
          outline: none;
          border-radius: 5px;
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .create-button {
          background: #59E878;
          box-shadow: 0px 1px 0px 0px #339548, 0px -1px 0px 0px #88FFA2;
          color: white;
        }

        .create-button:hover {
          transform: translateY(-2px);
          box-shadow: 0px 3px 0px 0px #339548, 0px -1px 0px 0px #88FFA2;
        }

        .cancel-button {
          background: #5A5499;
          box-shadow: 0px 1px 0px 0px #413B70, 0px -1px 0px 0px #6E68B0;
          color: #ADA3EF;
        }

        .cancel-button:hover {
          transform: translateY(-2px);
          box-shadow: 0px 3px 0px 0px #413B70, 0px -1px 0px 0px #6E68B0;
        }
      `}</style>
    </>
  );
}

export default NewUserModal;
