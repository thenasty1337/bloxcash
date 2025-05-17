import { createSignal, createEffect } from "solid-js";

const SettingsTab = (props) => {
  const { 
    formData, 
    settings, 
    loading, 
    handleInputChange, 
    saveSettings 
  } = props;

  return (
    <div class="games-container-in">
      <div class="games-header">
        <h2 class="games-title">SpinShield Settings</h2>
      </div>
      
      <div class="filters-container" style="padding-bottom: 20px;">
        <form onSubmit={saveSettings}>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="filter-group">
              <label class="filter-label">API Login</label>
              <input
                type="text"
                name="api_login"
                value={formData().api_login}
                onInput={handleInputChange}
                class="filter-select"
                required
              />
            </div>
            
            <div class="filter-group">
              <label class="filter-label">API Password</label>
              <input
                type="password"
                name="api_password"
                value={formData().api_password}
                onInput={handleInputChange}
                class="filter-select"
                placeholder={settings().id ? "Leave blank to keep current password" : ""}
                required={!settings().id}
              />
              <p style="color: #ADA3EF; font-size: 12px; margin-top: 5px;">Only fill this if you want to change the password.</p>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">API Endpoint</label>
              <input
                type="text"
                name="endpoint"
                value={formData().endpoint}
                onInput={handleInputChange}
                class="filter-select"
                required
              />
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Callback URL</label>
              <input
                type="text"
                name="callback_url"
                value={formData().callback_url}
                onInput={handleInputChange}
                class="filter-select"
                placeholder="https://yourdomain.com/api/spinshield/callback"
                required
              />
              <p style="color: #ADA3EF; font-size: 12px; margin-top: 5px;">This URL is used by SpinShield to send game events to your platform.</p>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Salt Key</label>
              <input
                type="text"
                name="salt_key"
                value={formData().salt_key}
                onInput={handleInputChange}
                class="filter-select"
                required
              />
              <p style="color: #ADA3EF; font-size: 12px; margin-top: 5px;">A unique key used for secure communication.</p>
            </div>
            
            <div class="filter-group">
              <div style="display: flex; align-items: center; gap: 10px; margin-top: 20px;">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData().active}
                  onInput={handleInputChange}
                />
                <label for="active" style="color: #ADA3EF; font-weight: 600; margin-bottom: 0;">
                  Enable SpinShield Integration
                </label>
              </div>
            </div>
            
            <div class="filter-group">
              <button
                type="submit"
                class="bevel-button"
                style="margin-top: 20px; padding: 10px 20px;"
                disabled={loading()}
              >
                {loading() ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsTab;
