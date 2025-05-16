import { createResource, createSignal, For, Show } from "solid-js";
import { authedAPI, createNotification } from "../../util/api";
import Loader from "../Loader/loader";
import AdminMFA from "../MFA/adminmfa";
import { useSearchParams } from "@solidjs/router";
import CaseModal from "./casemodal";

function AdminCases(props) {
    const [isLoading, setIsLoading] = createSignal(true);
    const [cases, setCases] = createSignal([]);
    const [modalType, setModalType] = createSignal('');
    const [selectedCase, setSelectedCase] = createSignal(null);
    const [selectedVersion, setSelectedVersion] = createSignal(null);
    const [selectedItems, setSelectedItems] = createSignal([]);

    const [params, setParams] = useSearchParams();
    const [casesResource, { mutate: mutateCases, refetch: refetchCases }] = createResource(fetchCases);

    async function fetchCases() {
        try {
            const cases = await authedAPI('/admin/cases', 'GET');
            if (cases.error && cases.error === '2FA_REQUIRED') {
                return mutateCases({ mfa: true });
            }

            setCases(cases || []);
            setIsLoading(false);
            return mutateCases(cases);
        } catch (e) {
            console.error(e);
            return mutateCases(null);
        }
    }

    const getCaseItems = (caseObj) => {
        if (!caseObj) return [];
        
        // Find active version
        const activeVersion = caseObj.versions.find(v => v.isActive);
        if (!activeVersion) return [];
        
        return activeVersion.items || [];
    };

    const openCreateModal = () => {
        setSelectedCase(null);
        setSelectedVersion(null);
        setSelectedItems([]);
        setModalType('create');
    };

    const openEditModal = (caseObj) => {
        setSelectedCase(caseObj);
        
        // Find active version - safely check if versions exists
        const activeVersion = caseObj?.versions?.length > 0 
            ? caseObj.versions.find(v => v.isActive) || caseObj.versions[0]
            : null;
            
        setSelectedVersion(activeVersion || null);
        
        // Get items for the active version
        setSelectedItems(activeVersion?.items || []);
        
        setModalType('edit');
    };

    const closeModal = () => {
        setModalType('');
    };

    const handleSaveCase = (savedCase) => {
        if (modalType() === 'create') {
            setCases([savedCase, ...cases()]);
            // Switch to edit mode with the new case
            setSelectedCase(savedCase);
            setModalType('edit');
        } else {
            // Update case in the list
            setCases(
                cases().map(c => c.id === savedCase.id ? { ...c, ...savedCase } : c)
            );
        }
    };

    const handleNewVersion = (newVersion) => {
        // Update case in the list
        setCases(
            cases().map(c => {
                if (c.id === selectedCase().id) {
                    const updatedCase = { ...c };
                    updatedCase.versions = updatedCase.versions.map(v => ({
                        ...v,
                        isActive: false
                    }));
                    updatedCase.versions.unshift({
                        ...newVersion,
                        isActive: true,
                        items: []
                    });
                    return updatedCase;
                }
                return c;
            })
        );
        
        // Update selected version
        setSelectedVersion(newVersion);
        setSelectedItems([]);
    };

    const handleAddItem = (newItem) => {
        // Update items
        setSelectedItems([...selectedItems(), newItem]);
        
        // Update case in the list
        setCases(
            cases().map(c => {
                if (c.id === selectedCase().id) {
                    const updatedCase = { ...c };
                    updatedCase.versions = updatedCase.versions.map(v => {
                        if (v.id === selectedVersion().id) {
                            return {
                                ...v,
                                items: [...(v.items || []), newItem]
                            };
                        }
                        return v;
                    });
                    return updatedCase;
                }
                return c;
            })
        );
    };

    const handleDeleteItem = (itemId) => {
        // Update items
        setSelectedItems(selectedItems().filter(item => item.id !== itemId));
        
        // Update case in the list
        setCases(
            cases().map(c => {
                if (c.id === selectedCase().id) {
                    const updatedCase = { ...c };
                    updatedCase.versions = updatedCase.versions.map(v => {
                        if (v.id === selectedVersion().id) {
                            return {
                                ...v,
                                items: (v.items || []).filter(item => item.id !== itemId)
                            };
                        }
                        return v;
                    });
                    return updatedCase;
                }
                return c;
            })
        );
    };

    const handleNormalize = () => {
        // Refresh cases
        refetchCases();
    };

    const deleteCase = async (caseId) => {
        if (!confirm('Are you sure you want to delete this case?')) return;
        
        setIsLoading(true);
        try {
            const response = await authedAPI(`/admin/cases/${caseId}`, 'DELETE');

            if (response.error) {
                createNotification('error', 'Error', response.error);
                setIsLoading(false);
                return;
            }

            createNotification('success', 'Success', 'Case deleted successfully');
            
            // Remove case from array
            setCases(cases().filter(c => c.id !== caseId));
            
        } catch (error) {
            console.error(error);
            createNotification('error', 'Error', 'Failed to delete case');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {modalType() && (
                <CaseModal 
                    case={selectedCase()} 
                    caseVersion={selectedVersion()}
                    items={selectedItems()}
                    close={closeModal}
                    onSave={handleSaveCase}
                    onNewVersion={handleNewVersion}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteItem}
                    onNormalize={handleNormalize}
                />
            )}

            {casesResource()?.mfa && (
                <AdminMFA refetch={refetchCases} />
            )}

            <div class="page-header">
                <h1>Case Management</h1>
                <button class="create-btn" onClick={openCreateModal}>Create New Case</button>
            </div>

            <Show when={!isLoading()} fallback={<Loader />}>
                <div class="cases-grid">
                    <For each={cases()}>
                        {(caseObj) => (
                            <div class="case-card">
                                <div class="case-image">
                                    <img src={caseObj.img} alt={caseObj.name} />
                                </div>
                                <div class="case-details">
                                    <h2>{caseObj.name}</h2>
                                    <p class="case-slug">/{caseObj.slug}</p>
                                    
                                    <Show when={caseObj.versions && caseObj.versions.length > 0}>
                                        <div class="case-stats">
                                            <div class="stat">
                                                <span class="stat-label">Price</span>
                                                <span class="stat-value">
                                                    {caseObj.versions.find(v => v.isActive)?.price || 'N/A'}
                                                </span>
                                            </div>
                                            <div class="stat">
                                                <span class="stat-label">Items</span>
                                                <span class="stat-value">
                                                    {getCaseItems(caseObj).length}
                                                </span>
                                            </div>
                                            <div class="stat">
                                                <span class="stat-label">Versions</span>
                                                <span class="stat-value">{caseObj.versions.length}</span>
                                            </div>
                                        </div>
                                    </Show>
                                </div>
                                <div class="case-actions">
                                    <button class="edit-btn" onClick={() => openEditModal(caseObj)}>Edit</button>
                                    <button class="delete-btn" onClick={() => deleteCase(caseObj.id)}>Delete</button>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </Show>

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .page-header h1 {
                    color: #ADA3EF;
                    font-size: 24px;
                    margin: 0;
                }

                .create-btn {
                    background: #5A5499;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .create-btn:hover {
                    background: #6A64A9;
                }

                .cases-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .case-card {
                    background: rgba(90, 84, 153, 0.15);
                    border-radius: 8px;
                    overflow: hidden;
                    transition: transform 0.3s, box-shadow 0.3s;
                    border: 1px solid rgba(90, 84, 153, 0.3);
                    display: flex;
                    flex-direction: column;
                }

                .case-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .case-image {
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                    position: relative;
                    background: rgba(0, 0, 0, 0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .case-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .case-details {
                    padding: 15px;
                    flex: 1;
                }

                .case-details h2 {
                    color: white;
                    margin: 0 0 5px 0;
                    font-size: 18px;
                }

                .case-slug {
                    color: #9F9AC8;
                    margin: 0 0 15px 0;
                    font-size: 14px;
                }

                .case-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 15px;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 4px;
                }

                .stat-label {
                    color: #9F9AC8;
                    font-size: 12px;
                    margin-bottom: 5px;
                }

                .stat-value {
                    color: #ADA3EF;
                    font-weight: bold;
                    font-size: 16px;
                }

                .case-actions {
                    display: flex;
                    padding: 15px;
                    gap: 10px;
                    background: rgba(0, 0, 0, 0.1);
                }

                .edit-btn, .delete-btn {
                    flex: 1;
                    padding: 8px 0;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .edit-btn {
                    background: #5A5499;
                    color: white;
                }

                .edit-btn:hover {
                    background: #6A64A9;
                }

                .delete-btn {
                    background: #a93e3e;
                    color: white;
                }

                .delete-btn:hover {
                    background: #c44545;
                }
            `}</style>
        </>
    );
}

export default AdminCases;
