import { createSignal, createEffect, Show } from "solid-js";

// Modal component for editing games
const GameEditModal = (props) => {
  const { show, onClose, game, loading, onChange, onSubmit } = props;
  
  if (!show) return null;
  
  return (
    <div class="modal-backdrop">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Edit Game: {game.game_name}</h2>
          <button class="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div class="modal-body">
          <form onSubmit={onSubmit} class="modal-form">
            <div class="form-group">
              <label class="form-label">Game Name</label>
              <input 
                type="text" 
                name="game_name" 
                value={game.game_name} 
                onInput={onChange}
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Provider</label>
              <input 
                type="text" 
                name="provider" 
                value={game.provider} 
                onInput={onChange}
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Provider Name</label>
              <input 
                type="text" 
                name="provider_name" 
                value={game.provider_name || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Type</label>
              <input 
                type="text" 
                name="type" 
                value={game.type} 
                onInput={onChange}
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Category</label>
              <input 
                type="text" 
                name="category" 
                value={game.category} 
                onInput={onChange}
                class="form-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Subcategory</label>
              <input 
                type="text" 
                name="subcategory" 
                value={game.subcategory || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">RTP (%)</label>
              <input 
                type="text" 
                name="rtp" 
                value={game.rtp} 
                onInput={onChange}
                class="form-input"
                placeholder="Example: 96.5"
              />
            </div>
          
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input 
                type="text" 
                name="image_url" 
                value={game.image_url || ''} 
                onInput={onChange}
                class="form-input"
              />
              {game.image_url && <img src={game.image_url} alt="Game" class="preview-image" />}
            </div>
            
            <div class="form-group">
              <label class="form-label">Square Image URL</label>
              <input 
                type="text" 
                name="image_square" 
                value={game.image_square || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Portrait Image URL</label>
              <input 
                type="text" 
                name="image_portrait" 
                value={game.image_portrait || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Long Image URL</label>
              <input 
                type="text" 
                name="image_long" 
                value={game.image_long || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Source</label>
              <input 
                type="text" 
                name="source" 
                value={game.source || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">System</label>
              <input 
                type="text" 
                name="system" 
                value={game.system || ''} 
                onInput={onChange}
                class="form-input"
              />
            </div>
            
            <div class="form-group full-width">
              <label class="form-label">Game Features</label>
              <div class="checkbox-group">
                <div class="form-checkbox-wrapper">
                  <input 
                    id="is_new" 
                    name="is_new" 
                    type="checkbox" 
                    checked={game.is_new === 1 || game.is_new === true} 
                    onChange={onChange} 
                  />
                  <label for="is_new">New Game</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="is_mobile" 
                    name="is_mobile" 
                    type="checkbox" 
                    checked={game.is_mobile === 1 || game.is_mobile === true} 
                    onChange={onChange} 
                  />
                  <label for="is_mobile">Mobile Supported</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="freerounds_supported" 
                    name="freerounds_supported" 
                    type="checkbox" 
                    checked={game.freerounds_supported === 1 || game.freerounds_supported === true} 
                    onChange={onChange} 
                  />
                  <label for="freerounds_supported">Free Rounds Supported</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="featurebuy_supported" 
                    name="featurebuy_supported" 
                    type="checkbox" 
                    checked={game.featurebuy_supported === 1 || game.featurebuy_supported === true} 
                    onChange={onChange} 
                  />
                  <label for="featurebuy_supported">Feature Buy Supported</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="has_jackpot" 
                    name="has_jackpot" 
                    type="checkbox" 
                    checked={game.has_jackpot === 1 || game.has_jackpot === true} 
                    onChange={onChange} 
                  />
                  <label for="has_jackpot">Has Jackpot</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="play_for_fun_supported" 
                    name="play_for_fun_supported" 
                    type="checkbox" 
                    checked={game.play_for_fun_supported === 1 || game.play_for_fun_supported === true} 
                    onChange={onChange} 
                  />
                  <label for="play_for_fun_supported">Play For Fun Supported</label>
                </div>
                
                <div class="form-checkbox-wrapper">
                  <input 
                    id="active" 
                    name="active" 
                    type="checkbox" 
                    checked={game.active === 1 || game.active === true} 
                    onChange={onChange} 
                  />
                  <label for="active">Active</label>
                </div>
              </div>
            </div>
            
            <div class="modal-footer full-width">
              <button type="button" class="bevel-button cancel" onClick={(e) => {
                e.preventDefault();
                // Force close even if loading to prevent getting stuck
                onClose();
              }}>Cancel</button>
              <button type="submit" class="bevel-button" 
                onClick={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  if (!onSubmit) return;
                  onSubmit(e); // Manually call onSubmit function
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span class="modal-spinner spinner"></span>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameEditModal;
