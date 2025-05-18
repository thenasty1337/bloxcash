// /frontend/src/components/Admin/casemodal.jsx
import { createSignal, Show, For, createResource, onMount } from "solid-js";
import { authedAPI, createNotification } from "../../util/api";
import Loader from "../Loader/loader";

async function fetchCSGOItems() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/refs/heads/main/public/api/en/skins.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching CS:GO items:', error);
        return [];
    }
}

function CaseModal(props) {
    const [isLoading, setIsLoading] = createSignal(false);
    const [activeTab, setActiveTab] = createSignal('details');
    const [caseName, setCaseName] = createSignal(props.case?.name || '');
    const [caseSlug, setCaseSlug] = createSignal(props.case?.slug || '');
    const [caseImage, setCaseImage] = createSignal(props.case?.img || '');
    const [casePrice, setCasePrice] = createSignal(props.caseVersion?.price || 0);
    const [itemName, setItemName] = createSignal('');
    const [itemImage, setItemImage] = createSignal('');
    const [itemPrice, setItemPrice] = createSignal(0);
    const [itemProbability, setItemProbability] = createSignal(1);
    const [remainingProbability, setRemainingProbability] = createSignal(100);
    const [items, setItems] = createSignal(props.items || []);
    const [csgoItems, { refetch: refetchCSGOItems }] = createResource(fetchCSGOItems);
    const [filteredCSGOItems, setFilteredCSGOItems] = createSignal([]);
    const [searchQuery, setSearchQuery] = createSignal('');
    const [targetHouseEdge, setTargetHouseEdge] = createSignal(12); // Default 12% house edge
    
    // Version management
    const [versions, setVersions] = createSignal(props.case?.versions || []);
    const [selectedVersion, setSelectedVersion] = createSignal(props.caseVersion || null);
    const [versionName, setVersionName] = createSignal('');
    const [isEditingVersion, setIsEditingVersion] = createSignal(false);
    
    // Calculate the expected value and house edge
    const calculatedStats = () => {
        const currentItems = items();
        if (!currentItems || !currentItems.length) return { expectedValue: 0, houseEdge: 0, suggestedPrice: 0, totalProbability: 0, needsMoreItems: true };
        
        const TOTAL_RANGE = 100000; // Max range
        
        // Calculate total range coverage and expected value using range-based probability
        let totalRangeCovered = 0;
        const totalExpectedValue = currentItems.reduce((sum, item) => {
            if (!item.rangeFrom || !item.rangeTo) return sum;
            
            const rangeSize = item.rangeTo - item.rangeFrom + 1;
            totalRangeCovered += rangeSize;
            
            const price = Number(item.price) || 0;
            const probability = (rangeSize / TOTAL_RANGE) * 100;
            return sum + (price * (probability / 100));
        }, 0);
        
        // Calculate total probability as a percentage of the total range covered
        const totalProbability = (totalRangeCovered / TOTAL_RANGE) * 100;
        
        // Ensure we have valid numbers
        const currentPrice = Math.max(0, Number(casePrice()) || 0);
        
        // Calculate house edge only if we have a valid price
        let houseEdge = 0;
        if (currentPrice > 0 && totalExpectedValue > 0) {
            houseEdge = ((currentPrice - totalExpectedValue) / currentPrice) * 100;
            // Clamp to reasonable range to avoid UI issues
            houseEdge = Math.max(-100, Math.min(100, houseEdge));
        }
        
        // Calculate suggested price based on expected value and target house edge
        const suggestedPrice = Math.max(0.01, totalExpectedValue * (1 + targetHouseEdge() / 100));
        
        // Flag if ranges don't cover the full total range
        const needsMoreItems = totalRangeCovered < TOTAL_RANGE;
        
        return {
            expectedValue: totalExpectedValue,
            houseEdge: houseEdge,
            suggestedPrice: suggestedPrice,
            totalProbability: totalProbability,
            needsMoreItems: needsMoreItems,
            totalRange: TOTAL_RANGE
        };
    };

    const fetchRemainingProbability = async (versionId) => {
        if (!versionId) return;
        
        setIsLoading(true);
        try {
            const response = await authedAPI(`/admin/cases/versions/${versionId}/remaining-probability`, 'GET');
            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }
            setRemainingProbability(response.remainingProbability);
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to fetch remaining probability');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter CS:GO items based on search query
    const filterItems = (query) => {
        if (!csgoItems() || !Array.isArray(csgoItems())) return;
        
        setSearchQuery(query);
        
        // Only show results if query is at least 3 characters
        if (!query || query.length < 3) {
            setFilteredCSGOItems([]);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const filtered = csgoItems()
            .filter(item => item.name.toLowerCase().includes(lowerQuery))
            .slice(0, 10); // Limit to 10 results for performance
            
        setFilteredCSGOItems(filtered);
    };
    
    // Select a CS:GO item and populate form fields
    const selectCSGOItem = (item) => {
        setItemName(item.name);
        setItemImage(item.image);
        // Price can be set based on rarity or wear if available
        // For now, leave it for manual entry
        // Clear the search results
        setFilteredCSGOItems([]);
        setSearchQuery('');
    };

    // Function to fetch all versions for a case
    const fetchVersions = async (caseId) => {
        if (!caseId) return;
        
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases/${caseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const caseData = await res.json();
            
            if (caseData.versions) {
                setVersions(caseData.versions);
                // If we have a selected version, update it with fresh data
                if (selectedVersion()) {
                    const updatedVersion = caseData.versions.find(v => v.id === selectedVersion().id);
                    if (updatedVersion) {
                        setSelectedVersion(updatedVersion);
                        setItems(updatedVersion.items || []);
                        setCasePrice(updatedVersion.price);
                        setVersionName(updatedVersion.name);
                    }
                }
                // If we don't have a selected version but there's an active version, select it
                else {
                    const activeVersion = caseData.versions.find(v => v.isActive);
                    if (activeVersion) {
                        setSelectedVersion(activeVersion);
                        setItems(activeVersion.items || []);
                        setCasePrice(activeVersion.price);
                        setVersionName(activeVersion.name);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to fetch case versions');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to update a version
    const updateVersion = async (versionId, updateData) => {
        if (!versionId) return;
        
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases/versions/${versionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });
            
            const updatedVersion = await res.json();
            
            if (updatedVersion.error) {
                createNotification('error', 'Error', updatedVersion.error);
                return null;
            }
            
            createNotification('success', 'Success', 'Version updated successfully');
            
            // Refresh versions
            await fetchVersions(props.case?.id);
            
            return updatedVersion;
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to update version');
            return null;
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to toggle a version's active status
    const toggleVersionActive = async (version) => {
        const result = await updateVersion(version.id, {
            isActive: !version.isActive
        });
        
        if (result && result.isActive) {
            // If we activated a version, select it
            setSelectedVersion(result);
            setItems(result.items || []);
            setCasePrice(result.price);
            setVersionName(result.name);
            if (result.id) {
                fetchRemainingProbability(result.id);
            }
        }
    };
    
    // Function to select a version and load its items
    const selectVersion = (version) => {
        setSelectedVersion(version);
        setItems(version.items || []);
        setCasePrice(version.price);
        setVersionName(version.name);
        if (version.id) {
            fetchRemainingProbability(version.id);
        }
    };
    
    // Save edited version details
    const saveVersionDetails = async () => {
        if (!selectedVersion()?.id) return;
        
        const result = await updateVersion(selectedVersion().id, {
            name: versionName(),
            price: Number(casePrice())
        });
        
        if (result) {
            setIsEditingVersion(false);
        }
    };

    // Fetch versions when component mounts if editing an existing case
    if (props.case?.id) {
        fetchVersions(props.case.id);
    }

    // Fetch remaining probability when component mounts if editing an existing case version
    if (props.caseVersion?.id) {
        fetchRemainingProbability(props.caseVersion.id);
    }

    const saveCase = async () => {
        if (!caseName() || !caseSlug() || !caseImage()) {
            return createNotification('error', 'Error', 'Please fill in all required fields');
        }

        setIsLoading(true);
        try {
            const caseData = {
                name: caseName(),
                slug: caseSlug(),
                img: caseImage(),
            };
            
            console.log('Sending case data:', caseData); // Debug log
            
            let res;
            
            if (props.case?.id) {
                // Update existing case - use fetch directly with proper JSON stringification
                res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases/${props.case.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(caseData) // Explicitly stringify the data
                });
            } else {
                // Create new case - use fetch directly with proper JSON stringification
                res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(caseData) // Explicitly stringify the data
                });
            }
            
            const response = await res.json();

            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }

            createNotification('success', 'Success', props.case?.id ? 'Case updated successfully' : 'Case created successfully');
            
            if (props.onSave) {
                props.onSave(response);
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to save case');
        } finally {
            setIsLoading(false);
        }
    };

    const createVersion = async () => {
        if (!props.case?.id || casePrice() <= 0) {
            return createNotification('error', 'Error', 'Please enter a valid price');
        }

        setIsLoading(true);
        try {
            // Get version name - either from the versionName field if editing, or use the case name
            const vName = versionName() || props.case?.name || '';
            
            // Prepare data for version creation with proper types
            const versionData = {
                price: Number(casePrice()),
                name: vName,
                isActive: true // Make new versions active by default
            };
            
            console.log('Sending version data:', versionData); // Debug log
            
            // Use fetch directly to ensure proper body formatting
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases/${props.case.id}/versions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(versionData) // Explicitly stringify the data
            });
            
            const response = await res.json();

            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }
            
            // Refresh versions and select the new one
            await fetchVersions(props.case.id);

            createNotification('success', 'Success', 'New case version created successfully');
            
            if (props.onNewVersion) {
                props.onNewVersion(response);
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to create new version');
        } finally {
            setIsLoading(false);
        }
    };

    const addItem = async () => {
        if (!itemName() || !itemImage() || itemPrice() <= 0 || itemProbability() <= 0 || !selectedVersion()?.id) {
            return createNotification('error', 'Error', 'Please fill in all fields with valid values');
        }

        setIsLoading(true);
        try {
            // Ensure all values are correctly formatted for JSON
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/cases/versions/${selectedVersion().id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({

                    name: itemName(),
                    img: itemImage(),
                    price: parseFloat(itemPrice()),
                    probability: parseFloat(itemProbability())
                })
            });

            const response = await res.json();

            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }

            createNotification('success', 'Success', 'Item added successfully');
            setItemName('');
            setItemImage('');
            setItemPrice(0);
            setItemProbability(1);
            
            // Update items array
            setItems([...items(), response]);
            
            // Update remaining probability
            setRemainingProbability(remainingProbability() - itemProbability());
            
            if (props.onAddItem) {
                props.onAddItem(response);
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to add item');
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeItems = async () => {
        if (!selectedVersion()?.id) {
            return createNotification('error', 'Error', 'No active case version');
        }

        setIsLoading(true);
        try {
            const response = await authedAPI(`/admin/cases/versions/${selectedVersion().id}/normalize`, 'POST');

            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }

            createNotification('success', 'Success', 'Items normalized successfully');
            
            if (props.onNormalize) {
                props.onNormalize();
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to normalize items');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        setIsLoading(true);
        try {
            const response = await authedAPI(`/admin/cases/items/${itemId}`, 'DELETE');

            if (response.error) {
                createNotification('error', 'Error', response.error);
                return;
            }

            createNotification('success', 'Success', 'Item deleted successfully');
            
            // Remove item from array
            setItems(items().filter(item => item.id !== itemId));
            
            // Update remaining probability
            fetchRemainingProbability(selectedVersion().id);
            
            if (props.onDeleteItem) {
                props.onDeleteItem(itemId);
            }
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to delete item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2>{props.case?.id ? 'Edit Case' : 'Create New Case'}</h2>
                    <button class="close-btn" onClick={props.close}>✕</button>
                </div>

                <Show when={!isLoading()} fallback={<Loader />}>
                    <div class="modal-tabs">
                        <button 
                            class={`tab-btn ${activeTab() === 'details' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('details')}
                        >
                            Case Details
                        </button>
                        <Show when={props.case?.id}>
                            <button 
                                class={`tab-btn ${activeTab() === 'version' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('version')}
                            >
                                Version
                            </button>
                        </Show>
                        <Show when={props.caseVersion?.id}>
                            <button 
                                class={`tab-btn ${activeTab() === 'items' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('items')}
                            >
                                Items
                            </button>
                        </Show>
                    </div>

                    <div class="modal-content">
                        <Show when={activeTab() === 'details'}>
                            <div class="form-group">
                                <label>Case Name</label>
                                <input 
                                    type="text" 
                                    value={caseName()} 
                                    onInput={(e) => setCaseName(e.target.value)} 
                                    placeholder="Enter case name"
                                />
                            </div>
                            <div class="form-group">
                                <label>Slug</label>
                                <input 
                                    type="text" 
                                    value={caseSlug()} 
                                    onInput={(e) => setCaseSlug(e.target.value)} 
                                    placeholder="Enter case slug (URL friendly)"
                                />
                            </div>
                            <div class="form-group">
                                <label>Image URL</label>
                                <input 
                                    type="text" 
                                    value={caseImage()} 
                                    onInput={(e) => setCaseImage(e.target.value)} 
                                    placeholder="Enter image URL"
                                />
                            </div>
                            <div class="form-group preview">
                                <label>Preview</label>
                                <Show when={caseImage()}>
                                    <div class="image-preview">
                                        <img src={caseImage()} alt="Case preview" />
                                    </div>
                                </Show>
                            </div>
                            <div class="form-actions">
                                <button class="save-btn" onClick={saveCase}>
                                    {props.case?.id ? 'Update Case' : 'Create Case'}
                                </button>
                            </div>
                        </Show>

                        <Show when={activeTab() === 'version' && props.case?.id}>
                            {/* Create new version section */}
                            <div class="version-section">
                                <h3>Create New Version</h3>
                                <div class="form-group">
                                    <label>Version Name</label>
                                    <input 
                                        type="text" 
                                        value={versionName()} 
                                        onInput={(e) => setVersionName(e.target.value)} 
                                        placeholder="Enter version name (e.g. Case name v2)"
                                    />
                                </div>
                                <div class="form-group">
                                    <label>Case Price</label>
                                    <input 
                                        type="number" 
                                        value={casePrice()} 
                                        onInput={(e) => setCasePrice(parseFloat(e.target.value) || 0)} 
                                        placeholder="Enter case price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div class="form-actions">
                                    <button class="save-btn" onClick={createVersion}>
                                        Create New Version
                                    </button>
                                </div>
                            </div>
                            
                            {/* Existing versions section */}
                            <div class="version-section mt-6">
                                <h3>Version History</h3>
                                <Show when={versions().length > 0}>
                                    <div class="versions-list">
                                        <div class="version-header">
                                            <div class="version-header-cell">Status</div>
                                            <div class="version-header-cell">Name</div>
                                            <div class="version-header-cell">Price</div>
                                            <div class="version-header-cell">Items</div>
                                            <div class="version-header-cell">Created</div>
                                            <div class="version-header-cell">Actions</div>
                                        </div>
                                        <For each={versions()}>
                                            {(version) => (
                                                <div class={`version-row ${version.id === selectedVersion()?.id ? 'selected' : ''}`}>
                                                    <div class="version-cell">
                                                        <span class={version.isActive ? 'status active' : 'status inactive'}>
                                                            {version.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div class="version-cell">{version.name}</div>
                                                    <div class="version-cell">${parseFloat(version.price).toFixed(2)}</div>
                                                    <div class="version-cell">
                                                        {version.stats ? version.stats.itemCount : (version.items?.length || 0)} items
                                                        {version.stats && <span class="stats-note">Value: ${version.stats.totalValue.toFixed(2)}</span>}
                                                    </div>
                                                    <div class="version-cell">
                                                        {new Date(version.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div class="version-cell buttons">
                                                        <button 
                                                            class="select-btn" 
                                                            onClick={() => selectVersion(version)}
                                                            title="Select this version to manage its items"
                                                        >
                                                            Select
                                                        </button>
                                                        <button 
                                                            class={version.isActive ? 'deactivate-btn' : 'activate-btn'}
                                                            onClick={() => toggleVersionActive(version)}
                                                            title={version.isActive ? 'Deactivate this version' : 'Activate this version'}
                                                        >
                                                            {version.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button 
                                                            class="edit-btn"
                                                            onClick={() => {
                                                                setSelectedVersion(version);
                                                                setVersionName(version.name);
                                                                setCasePrice(version.price);
                                                                setIsEditingVersion(true);
                                                            }}
                                                            title="Edit version details"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                                <Show when={versions().length === 0}>
                                    <div class="no-versions">No versions found. Create a new version to get started.</div>
                                </Show>
                            </div>
                            
                            {/* Edit version modal */}
                            <Show when={isEditingVersion() && selectedVersion()}>
                                <div class="modal-overlay" onClick={() => setIsEditingVersion(false)}></div>
                                <div class="edit-version-modal" onclick={(e) => e.stopPropagation()}>
                                    <h3>Edit Version</h3>
                                    <div class="form-group">
                                        <label>Version Name</label>
                                        <input 
                                            type="text" 
                                            value={versionName()} 
                                            onInput={(e) => setVersionName(e.target.value)} 
                                            placeholder="Enter version name"
                                        />
                                    </div>
                                    <div class="form-group">
                                        <label>Case Price</label>
                                        <input 
                                            type="number" 
                                            value={casePrice()} 
                                            onInput={(e) => setCasePrice(parseFloat(e.target.value) || 0)} 
                                            placeholder="Enter case price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div class="modal-actions">
                                        <button class="cancel-btn" onClick={() => setIsEditingVersion(false)}>Cancel</button>
                                        <button class="save-btn" onClick={saveVersionDetails}>Save Changes</button>
                                    </div>
                                </div>
                            </Show>
                        </Show>

                        <Show when={activeTab() === 'items' && selectedVersion()?.id}>
                            {/* Section 1: Version Info & Controls */}
                            <div class="section version-section">
                                <div class="version-info-bar">
                                    <div class="version-info">
                                        <span class="version-label">Current Version:</span>
                                        <span class="version-name">{selectedVersion()?.name}</span>
                                        <span class="version-price">${parseFloat(selectedVersion()?.price).toFixed(2)}</span>
                                        <span class={selectedVersion()?.isActive ? 'version-status active' : 'version-status inactive'}>
                                            {selectedVersion()?.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <button class="change-version-btn" onClick={() => setActiveTab('version')} title="Change version">
                                        Change Version
                                    </button>
                                </div>
                                
                                <div class="remaining-probability">
                                    <span>Remaining Probability:</span>
                                    <span class="probability-value">{remainingProbability()}%</span>
                                    <button class="normalize-btn" onClick={normalizeItems}>
                                        Normalize Probabilities
                                    </button>
                                </div>
                            </div>
                            
                            {/* Section 2: Case Economics */}
                            <div class="section economics-section">
                                <div class="section-header">
                                    <h3>Case Economics</h3>
                                    <div class="section-header-actions">
                                        <span class="target-edge-label">Target House Edge: {targetHouseEdge()}%</span>
                                        <input 
                                            type="range" 
                                            min="5" 
                                            max="20" 
                                            step="0.5"
                                            value={targetHouseEdge()} 
                                            onInput={(e) => setTargetHouseEdge(parseFloat(e.target.value))}
                                            class="house-edge-slider"
                                        />
                                    </div>
                                </div>
                                
                                {/* Warning banner when probabilities don't add up to close to 100% */}
                                <Show when={calculatedStats().needsMoreItems}>
                                    <div class="probability-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="warning-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Incomplete probability distribution ({calculatedStats().totalProbability.toFixed(0)}% filled). Calculations are estimates based on current items.</span>
                                    </div>
                                </Show>
                                
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <div class="stat-icon">💰</div>
                                        <div class="stat-content">
                                            <span class="stat-label">Expected Value</span>
                                            <span class="stat-value">${calculatedStats().expectedValue.toFixed(2)}</span>
                                            <Show when={calculatedStats().needsMoreItems}>
                                                <span class="stat-note">(Based on {calculatedStats().totalProbability.toFixed(0)}% probability)</span>
                                                <span class="stat-projection">Projected: ${calculatedStats().scaledExpectedValue.toFixed(2)}</span>
                                            </Show>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item">
                                        <div class="stat-icon">📊</div>
                                        <div class="stat-content">
                                            <span class="stat-label">House Edge</span>
                                            <span class="stat-value" style={{
                                                color: calculatedStats().houseEdge < 10 ? '#ff5555' : 
                                                      calculatedStats().houseEdge > 15 ? '#ff9955' : '#55ff7f'
                                            }}>
                                                {calculatedStats().houseEdge.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item">
                                        <div class="stat-icon">💲</div>
                                        <div class="stat-content">
                                            <span class="stat-label">Suggested Price</span>
                                            <div class="flex items-center">
                                                <span class="stat-value">${calculatedStats().suggestedPrice.toFixed(2)}</span>
                                                <button 
                                                    class="apply-price-btn"
                                                    onClick={() => setCasePrice(parseFloat(calculatedStats().suggestedPrice.toFixed(2)))}
                                                    title="Apply this price to the case"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            <Show when={calculatedStats().needsMoreItems}>
                                                <span class="stat-note">Based on projected value with {targetHouseEdge()}% edge</span>
                                            </Show>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Add New Item Form */}
                            <div class="section item-form-section">
                                <div class="section-header">
                                    <h3>Add New Item</h3>
                                </div>
                                
                                <div class="two-column-form">
                                    {/* Left Column: Item Selector and Preview */}
                                    <div class="form-column">
                                        <div class="form-group">
                                            <label>CS:GO Item Selector</label>
                                            <div class="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search CS:GO items (min 3 characters)..." 
                                                    value={searchQuery()}
                                                    onInput={(e) => filterItems(e.target.value)}
                                                />
                                                <Show when={csgoItems.loading}>
                                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <div class="loading-spinner"></div>
                                                    </div>
                                                </Show>
                                                <Show when={filteredCSGOItems().length > 0}>
                                                    <div class="csgo-dropdown">
                                                        <div class="csgo-dropdown-header">
                                                            <span>{filteredCSGOItems().length} items found</span>
                                                        </div>
                                                        <div class="csgo-dropdown-items">
                                                            <For each={filteredCSGOItems()}>
                                                                {(item) => (
                                                                    <div 
                                                                        class="csgo-dropdown-item"
                                                                        onClick={() => selectCSGOItem(item)}
                                                                    >
                                                                        <div class="csgo-item-content">
                                                                            <img src={item.image} alt={item.name} class="csgo-item-image" />
                                                                            <div class="csgo-item-details">
                                                                                <span class="csgo-item-name">{item.name}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </For>
                                                        </div>
                                                    </div>
                                                </Show>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group preview">
                                            <label>Item Preview</label>
                                            <Show when={itemImage()}>
                                                <div class="image-preview">
                                                    <img src={itemImage()} alt="Item preview" />
                                                </div>
                                            </Show>
                                            <Show when={!itemImage()}>
                                                <div class="empty-preview">
                                                    <span>No image selected</span>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>
                                    
                                    {/* Right Column: Item Details */}
                                    <div class="form-column">
                                        <div class="form-group">
                                            <label>Item Name</label>
                                            <input 
                                                type="text" 
                                                value={itemName()} 
                                                onInput={(e) => setItemName(e.target.value)}
                                                placeholder="Enter item name"
                                            />
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Image URL</label>
                                            <input 
                                                type="text" 
                                                value={itemImage()} 
                                                onInput={(e) => setItemImage(e.target.value)}
                                                placeholder="Enter image URL"
                                            />
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Item Price</label>
                                            <div class="input-with-prefix">
                                                <span class="input-prefix">$</span>
                                                <input 
                                                    type="number"
                                                    value={itemPrice()} 
                                                    onInput={(e) => setItemPrice(parseFloat(e.target.value) || 0)} 
                                                    placeholder="Enter item price"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Item Probability</label>
                                            <div class="input-with-suffix">
                                                <input 
                                                    type="number" 
                                                    value={itemProbability()} 
                                                    onInput={(e) => setItemProbability(parseFloat(e.target.value) || 0)} 
                                                    placeholder="Enter probability percentage"
                                                    min="0.001"
                                                    max={remainingProbability()}
                                                    step="0.001"
                                                />
                                                <span class="input-suffix">%</span>
                                            </div>
                                            <span class="input-hint">Available: {remainingProbability()}%</span>
                                        </div>
                                        
                                      
                                        
                                        <div class="form-actions">
                                            <button class="add-item-btn" onClick={addItem}>
                                                <span class="btn-icon">+</span> Add Item to Case
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Items List */}
                            <div class="section items-list-section">
                                <div class="section-header">
                                    <h3>Case Items</h3>
                                    <div class="items-count">{items().length} items</div>
                                </div>
                                
                                <Show when={items().length > 0} fallback={
                                    <div class="empty-items-state">
                                        <div class="empty-icon">📦</div>
                                        <h4>No Items Added Yet</h4>
                                        <p>Add items to your case using the form above.</p>
                                    </div>
                                }>
                                    <div class="items-table">
                                        <div class="item-header">
                                            <span class="item-image">Image</span>
                                            <span class="item-name">Name</span>
                                            <span class="item-price">Price</span>
                                            <span class="item-probability">Probability</span>
                                            <span class="item-actions">Actions</span>
                                        </div>
                                        <div class="item-body">
                                            <For each={items()}>
                                                {(item) => (
                                                    <div class="item-row">
                                                        <span class="item-image">
                                                            <img src={item.img} alt={item.name} />
                                                        </span>
                                                        <span class="item-name">{item.name}</span>
                                                        <span class="item-price">
  {parseFloat(item.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
</span>

                                                        <span class="item-probability" style={{
                                                            color: ((item.rangeTo - item.rangeFrom + 1) / 100000 * 100) < 5 ? '#ff7070' :
                                                                  ((item.rangeTo - item.rangeFrom + 1) / 100000 * 100) > 30 ? '#70ff70' : 'inherit'
                                                        }}>
                                                            {((item.rangeTo - item.rangeFrom + 1) / 100000 * 100).toFixed(3)}%
                                                        </span>
                                                        <span class="item-actions">
                                                            <button 
                                                                class="delete-btn" 
                                                                onClick={() => deleteItem(item.id)}
                                                                title="Delete this item"
                                                            >
                                                                <span class="delete-icon">×</span>
                                                            </button>
                                                        </span>
                                                    </div>
                                                )}
                                            </For>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        </Show>
                    </div>
                </Show>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal {
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    background: #2E2A5A;
                    border-radius: 8px;
                    padding: 20px;
                    overflow-y: auto;
                    border: 1px solid #5A5499;
                    box-shadow: 0 0 20px rgba(173, 163, 239, 0.3);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #5A5499;
                    padding-bottom: 15px;
                }

                .modal-header h2 {
                    color: #ADA3EF;
                    font-size: 24px;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #ADA3EF;
                    font-size: 20px;
                    cursor: pointer;
                }

                .modal-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #5A5499;
                    padding-bottom: 10px;
                }

                .tab-btn {
                    background: rgba(90, 84, 153, 0.35);
                    border: none;
                    color: #ADA3EF;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .tab-btn.active {
                    background: #5A5499;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .item-name {
                    color: #ADA3EF;
                }

                .item-price {
                    color: #ADA3EF;
                }

                .form-row {
                    display: flex;
                    gap: 15px;
                }

                .form-group.half {
                    width: 50%;
                }

                label {
                    display: block;
                    color: #ADA3EF;
                    margin-bottom: 5px;
                    font-weight: bold;
                }

                input, select, textarea {
                    width: 100%;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #5A5499;
                    background: rgba(0, 0, 0, 0.2);
                    color: white;
                    font-family: inherit;
                }

                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: #ADA3EF;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .save-btn {
                    background: #5A5499;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .save-btn:hover {
                    background: #6A64A9;
                }

                .normalize-btn {
                    background: #42355f;
                    border: none;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background 0.3s;
                }

                .normalize-btn:hover {
                    background: #534375;
                }

                .remaining-probability {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    background: rgba(90, 84, 153, 0.15);
                    border-radius: 4px;
                    margin-top: 10px;
                    color: #ADA3EF;
                }
                
                .probability-value {
                    font-weight: bold;
                    color: white;
                }

                .image-preview {
                    margin-top: 10px;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 10px;
                    border-radius: 4px;
                    display: flex;
                    justify-content: center;
                }

                .image-preview img {
                    max-width: 100%;
                    max-height: 200px;
                    object-fit: contain;
                }

                /* Two-Column Form Layout */
                .two-column-form {
                    display: grid;
                    grid-template-columns: minmax(250px, 1fr) minmax(250px, 1fr);
                    gap: 20px;
                }
                
                @media (max-width: 768px) {
                    .two-column-form {
                        grid-template-columns: 1fr;
                    }
                }
                
                .form-column {
                    display: flex;
                    flex-direction: column;
                }
                
                /* Input with prefix/suffix styling */
                .input-with-prefix, .input-with-suffix {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .input-prefix {
                    position: absolute;
                    left: 10px;
                    color: #9990D5;
                    pointer-events: none;
                }
                
                .input-with-prefix input {
                    padding-left: 25px;
                }
                
                .input-suffix {
                    position: absolute;
                    right: 10px;
                    color: #9990D5;
                    pointer-events: none;
                }
                
                .input-with-suffix input {
                    padding-right: 25px;
                }
                
                .input-hint {
                    display: block;
                    font-size: 12px;
                    color: #9990D5;
                    margin-top: 4px;
                }
                
                /* Empty preview state */
                .empty-preview {
                    height: 150px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #5A5499;
                    font-style: italic;
                    border: 1px dashed rgba(90, 84, 153, 0.5);
                }
                
                /* Enhanced Items List */
                .items-count {
                    font-size: 13px;
                    color: #9990D5;
                    background: rgba(90, 84, 153, 0.3);
                    padding: 3px 8px;
                    border-radius: 12px;
                }
                
                .empty-items-state {
                    text-align: center;
                    padding: 30px 0;
                    color: #9990D5;
                }
                
                .empty-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                
                .empty-items-state h4 {
                    margin: 0 0 8px 0;
                    color: #ADA3EF;
                }
                
                .empty-items-state p {
                    margin: 0;
                    font-size: 14px;
                }
                
                .items-table {
                    border: 1px solid rgba(90, 84, 153, 0.4);
                    border-radius: 6px;
                    overflow: hidden;
                }
                
                .item-header, .item-row {
                    display: grid;
                    grid-template-columns: 80px 2fr 1fr 1fr 80px;
                    gap: 10px;
                    align-items: center;
                    padding: 8px 12px;
                }

                .item-header {
                    background: rgba(90, 84, 153, 0.5);
                    font-weight: bold;
                    color: white;
                    font-size: 13px;
                    padding: 10px 12px;
                }

                .item-body {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .item-row {
                    background: rgba(90, 84, 153, 0.15);
                    border-bottom: 1px solid rgba(90, 84, 153, 0.3);
                    transition: background 0.15s ease;
                }

                .item-row:hover {
                    background: rgba(90, 84, 153, 0.25);
                }
                
                .item-row:nth-child(even) {
                    background: rgba(90, 84, 153, 0.2);
                }
                
                .item-row:nth-child(even):hover {
                    background: rgba(90, 84, 153, 0.3);
                }

                .item-image img {
                    width: 50px;
                    height: 50px;
                    object-fit: contain;
                    border-radius: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 3px;
                }

                .add-item-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #5A5499;
                    border: none;
                    color: white;
                    padding: 10px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    margin-top: 10px;
                    transition: background 0.2s;
                }
                
                .add-item-btn:hover {
                    background: #6A64A9;
                }
                
                .btn-icon {
                    font-size: 16px;
                    font-weight: bold;
                }
                
                .delete-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(169, 62, 62, 0.7);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .delete-btn:hover {
                    background: #c44545;
                    transform: scale(1.1);
                }
                
                .delete-icon {
                    font-weight: bold;
                    line-height: 1;
                }
                
                .apply-price-btn {
                    background: #4c6a8c;
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-left: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background 0.2s;
                }
                
                .apply-price-btn:hover {
                    background: #5a7da3;
                }
                
                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(173, 163, 239, 0.3);
                    border-top: 2px solid #ADA3EF;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* House Edge Stats Styles */
                /* Section Styles */
                .section {
                    background: rgba(90, 84, 153, 0.2);
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(90, 84, 153, 0.4);
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.4);
                    padding-bottom: 10px;
                }
                
                .section-header h3 {
                    color: #ADA3EF;
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                
                .section-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .target-edge-label {
                    font-size: 13px;
                    color: #9990D5;
                }
                
                .house-edge-stats h3 {
                    color: #ADA3EF;
                    margin-bottom: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.4);
                    padding-bottom: 8px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }
                
                .stat-item {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 10px;
                    border-radius: 4px;
                }
                
                .stat-label {
                    display: block;
                    font-size: 12px;
                    color: #9990D5;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 16px;
                    font-weight: bold;
                    color: white;
                }
                
                .house-edge-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(90, 84, 153, 0.4);
                    outline: none;
                }
                
                .house-edge-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ADA3EF;
                    cursor: pointer;
                }
                
                .house-edge-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ADA3EF;
                    cursor: pointer;
                }
                
                .flex {
                    display: flex;
                }
                
                .items-center {
                    align-items: center;
                }
                
                .ml-2 {
                    margin-left: 0.5rem;
                }
                
                /* Probability Warning Styles */
                .probability-warning {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 120, 0, 0.15);
                    border: 1px solid rgba(255, 120, 0, 0.3);
                    color: #ffaa55;
                    padding: 8px 12px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    font-size: 13px;
                }
                
                .warning-icon {
                    width: 18px;
                    height: 18px;
                    margin-right: 8px;
                    flex-shrink: 0;
                    color: #ffaa55;
                }
                
                .stat-note {
                    display: block;
                    font-size: 11px;
                    color: #9183b7;
                    margin-top: 4px;
                    font-weight: normal;
                }
                
                .stat-projection {
                    display: block;
                    font-size: 13px;
                    color: #a6aaff;
                    margin-top: 6px;
                    font-weight: 500;
                }
                
                /* CSGO Dropdown Styles */
                .csgo-dropdown {
                    position: absolute;
                    z-index: 100;
                    width: 100%;
                    margin-top: 4px;
                    background: #222;
                    border: 1px solid #5A5499;
                    border-radius: 6px;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }
                
                .csgo-dropdown-header {
                    background: #111;
                    color: #ADA3EF;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    border-bottom: 1px solid #5A5499;
                    position: sticky;
                    top: 0;
                }
                
                .csgo-dropdown-items {
                    max-height: 300px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #5A5499 #222;
                }
                
                .csgo-dropdown-items::-webkit-scrollbar {
                    width: 8px;
                }
                
                .csgo-dropdown-items::-webkit-scrollbar-track {
                    background: #222;
                }
                
                .csgo-dropdown-items::-webkit-scrollbar-thumb {
                    background-color: #5A5499;
                    border-radius: 10px;
                }
                
                .csgo-dropdown-item {
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.3);
                }
                
                .csgo-dropdown-item:last-child {
                    border-bottom: none;
                }
                
                .csgo-dropdown-item:hover {
                    background: rgba(90, 84, 153, 0.4);
                }
                
                .csgo-item-content {
                    display: flex;
                    align-items: center;
                }
                
                .csgo-item-image {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                    margin-right: 12px;
                    border-radius: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 2px;
                }
                
                .csgo-item-details {
                    flex: 1;
                }
                
                .csgo-item-name {
                    font-weight: 500;
                    color: white;
                    font-size: 14px;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Version Management Styles */
                .version-section {
                    background: rgba(90, 84, 153, 0.1);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(90, 84, 153, 0.3);
                }
                
                .version-section h3 {
                    color: #ADA3EF;
                    font-size: 16px;
                    margin-bottom: 15px;
                    font-weight: bold;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.3);
                    padding-bottom: 8px;
                }
                
                .mt-6 {
                    margin-top: 1.5rem;
                }
                
                .versions-list {
                    border: 1px solid rgba(90, 84, 153, 0.3);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .version-header {
                    display: grid;
                    grid-template-columns: 100px 2fr 1fr 1fr 1fr 2fr;
                    background: rgba(90, 84, 153, 0.3);
                    font-weight: bold;
                    color: #ADA3EF;
                }
                
                .version-header-cell {
                    padding: 10px;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                
                .version-row {
                    display: grid;
                    grid-template-columns: 100px 2fr 1fr 1fr 1fr 2fr;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.2);
                    background: rgba(90, 84, 153, 0.1);
                    transition: background 0.2s;
                }
                
                .version-row:last-child {
                    border-bottom: none;
                }
                
                .version-row:hover {
                    background: rgba(90, 84, 153, 0.2);
                }
                
                .version-row.selected {
                    background: rgba(90, 84, 153, 0.25);
                    box-shadow: inset 0 0 0 2px rgba(173, 163, 239, 0.5);
                }
                
                .version-cell {
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                }
                
                .version-cell.buttons {
                    display: flex;
                    gap: 5px;
                    justify-content: flex-start;
                }
                
                .status {
                    font-size: 11px;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: 12px;
                }
                
                .status.active {
                    background-color: rgba(0, 200, 83, 0.2);
                    color: #43ff8b;
                    border: 1px solid rgba(0, 200, 83, 0.3);
                }
                
                .status.inactive {
                    background-color: rgba(200, 0, 0, 0.2);
                    color: #ff7b7b;
                    border: 1px solid rgba(200, 0, 0, 0.3);
                }
                
                .select-btn {
                    background: #42355f;
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .activate-btn {
                    background: rgba(0, 200, 83, 0.25);
                    border: 1px solid rgba(0, 200, 83, 0.4);
                    color: #43ff8b;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .deactivate-btn {
                    background: rgba(200, 0, 0, 0.25);
                    border: 1px solid rgba(200, 0, 0, 0.4);
                    color: #ff7b7b;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .edit-btn {
                    background: rgba(90, 84, 153, 0.25);
                    border: 1px solid rgba(90, 84, 153, 0.4);
                    color: #ADA3EF;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .no-versions {
                    color: #9990D5;
                    padding: 20px;
                    text-align: center;
                    background: rgba(90, 84, 153, 0.1);
                    border-radius: 4px;
                }
                
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100;
                }
                
                .edit-version-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #202030;
                    border-radius: 8px;
                    padding: 20px;
                    width: 90%;
                    max-width: 500px;
                    z-index: 101;
                    border: 1px solid #5A5499;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                }
                
                .edit-version-modal h3 {
                    color: #ADA3EF;
                    margin-bottom: 15px;
                    font-size: 18px;
                    border-bottom: 1px solid rgba(90, 84, 153, 0.3);
                    padding-bottom: 10px;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .cancel-btn {
                    background: rgba(130, 130, 150, 0.2);
                    border: 1px solid rgba(130, 130, 150, 0.3);
                    color: #bcbcc8;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                /* Version Info in Items Tab */
                .version-info-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(90, 84, 153, 0.15);
                    border-radius: 6px;
                    padding: 10px 15px;
                    margin-bottom: 15px;
                    border: 1px solid rgba(90, 84, 153, 0.3);
                }
                
                .version-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .version-label {
                    font-size: 12px;
                    color: #9990D5;
                }
                
                .version-name {
                    font-weight: bold;
                    color: white;
                }
                
                .version-price {
                    color: #ADA3EF;
                    font-weight: 500;
                }
                
                .version-status {
                    font-size: 11px;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-left: 8px;
                }
                
                .change-version-btn {
                    background: rgba(90, 84, 153, 0.25);
                    border: 1px solid rgba(90, 84, 153, 0.4);
                    color: #ADA3EF;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                
                .change-version-btn:hover {
                    background: rgba(90, 84, 153, 0.4);
                }
            `}</style>
        </div>
    );
}

export default CaseModal;