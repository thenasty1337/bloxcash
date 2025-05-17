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
    <div class="placeholder-content">
      <form onSubmit={saveSettings}>
        <div class="form-group">
          <label class="form-label">API Login</label>
          <input
            type="text"
            name="api_login"
            value={formData().api_login}
            onInput={handleInputChange}
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">API Password</label>
          <input
            type="password"
            name="api_password"
            value={formData().api_password}
            onInput={handleInputChange}
            class="form-input"
            placeholder={settings().id ? "Leave blank to keep current password" : ""}
            required={!settings().id}
          />
          <p class="form-input-hint">Only fill this if you want to change the password.</p>
        </div>
        <div class="form-group">
          <label class="form-label">API Endpoint</label>
          <input
            type="text"
            name="endpoint"
            value={formData().endpoint}
            onInput={handleInputChange}
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">Callback URL</label>
          <input
            type="text"
            name="callback_url"
            value={formData().callback_url}
            onInput={handleInputChange}
            class="form-input"
            placeholder="https://yourdomain.com/api/spinshield/callback"
            required
          />
          <p class="form-input-hint">This URL is used by SpinShield to send game events to your platform.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Salt Key</label>
          <input
            type="text"
            name="salt_key"
            value={formData().salt_key}
            onInput={handleInputChange}
            class="form-input"
            required
          />
          <p class="form-input-hint">A unique key used for secure communication.</p>
        </div>
        <div class="form-checkbox-wrapper">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData().active}
            onInput={handleInputChange}
          />
          <label for="active" class="form-label" style="margin-bottom: 0;">
            Enable SpinShield Integration
          </label>
        </div>
        <div class="form-submit">
          <button
            type="submit"
            class="bevel-gold"
            disabled={loading()}
          >
            {loading() ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;
