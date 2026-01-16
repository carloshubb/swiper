import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * IndexedDB Service for Local Interaction Storage
 * 
 * Stores user interactions locally in the browser for:
 * - Fast, responsive UI
 * - Offline support
 * - Batch synchronization with backend
 */
@Injectable({
    providedIn: 'root'
})
export class IndexedDbService {
    private dbName = 'RatingSwiperDB';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    // Store names
    private readonly INTERACTIONS_STORE = 'interactions';
    private readonly SYNC_STATUS_STORE = 'sync_status';

    // Observables for reactive updates
    private interactionCount$ = new BehaviorSubject<number>(0);
    private syncPending$ = new BehaviorSubject<number>(0);

    constructor() {
        this.initDatabase();
    }

    /**
     * Initialize IndexedDB
     */
    private async initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('[IndexedDB] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[IndexedDB] Database initialized successfully');
                this.updateCounters();
                resolve();
            };

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;

                // Create interactions store
                if (!db.objectStoreNames.contains(this.INTERACTIONS_STORE)) {
                    const interactionsStore = db.createObjectStore(this.INTERACTIONS_STORE, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    interactionsStore.createIndex('user_id', 'user_id', { unique: false });
                    interactionsStore.createIndex('image_id', 'image_id', { unique: false });
                    interactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    interactionsStore.createIndex('synced', 'synced', { unique: false });
                    interactionsStore.createIndex('dataset_version', 'dataset_version', { unique: false });
                }

                // Create sync status store
                if (!db.objectStoreNames.contains(this.SYNC_STATUS_STORE)) {
                    db.createObjectStore(this.SYNC_STATUS_STORE, { keyPath: 'key' });
                }

                console.log('[IndexedDB] Database schema created/updated');
            };
        });
    }

    /**
     * Migrate old boolean synced values to 0/1 numbers
     */
    async migrateBooleanToNumber(): Promise<number> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.INTERACTIONS_STORE], 'readwrite');
            const store = transaction.objectStore(this.INTERACTIONS_STORE);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const allRecords = getAllRequest.result;
                let migrated = 0;

                allRecords.forEach(record => {
                    // Check if synced is boolean
                    if (typeof record.synced === 'boolean') {
                        record.synced = record.synced ? 1 : 0;
                        store.put(record);
                        migrated++;
                    }
                });

                transaction.oncomplete = () => {
                    console.log(`[IndexedDB] Migrated ${migrated} records from boolean to 0/1`);
                    this.updateCounters();
                    resolve(migrated);
                };

                transaction.onerror = () => {
                    console.error('[IndexedDB] Migration failed:', transaction.error);
                    reject(transaction.error);
                };
            };

            getAllRequest.onerror = () => {
                console.error('[IndexedDB] Failed to get records for migration:', getAllRequest.error);
                reject(getAllRequest.error);
            };
        });
    }

    /**
     * Store interaction locally
     */
    async storeInteraction(interaction: {
        user_id: string;
        image_id: string;
        action: string;
        timestamp: string;
        dataset_version?: string;
        title_variant_id?: string;
    }): Promise<number> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.INTERACTIONS_STORE], 'readwrite');
            const store = transaction.objectStore(this.INTERACTIONS_STORE);

            const data = {
                ...interaction,
                synced: 0, // 0 = not synced, 1 = synced (for proper IndexedDB querying)
                created_at: new Date().toISOString()
            };

            const request = store.add(data);

            request.onsuccess = () => {
                console.log('[IndexedDB] Interaction stored:', request.result);
                this.updateCounters();
                resolve(request.result as number);
            };

            request.onerror = () => {
                console.error('[IndexedDB] Failed to store interaction:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all interactions (optionally filter by synced status)
     */
    async getAllInteractions(syncedOnly?: boolean): Promise<any[]> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.INTERACTIONS_STORE], 'readonly');
            const store = transaction.objectStore(this.INTERACTIONS_STORE);

            let request: IDBRequest;
            if (syncedOnly !== undefined) {
                const index = store.index('synced');
                request = index.getAll(IDBKeyRange.only(syncedOnly ? 1 : 0));
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('[IndexedDB] Failed to get interactions:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get unsynced interactions for backend reconciliation
     */
    async getUnsyncedInteractions(): Promise<any[]> {
        return this.getAllInteractions(false);
    }

    /**
     * Mark interactions as synced
     */
    async markAsSynced(ids: number[]): Promise<void> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.INTERACTIONS_STORE], 'readwrite');
            const store = transaction.objectStore(this.INTERACTIONS_STORE);

            let completed = 0;

            ids.forEach(id => {
                const getRequest = store.get(id);

                getRequest.onsuccess = () => {
                    const record = getRequest.result;
                    if (record) {
                        record.synced = 1; // Mark as synced with number 1
                        record.synced_at = new Date().toISOString();

                        const updateRequest = store.put(record);
                        updateRequest.onsuccess = () => {
                            completed++;
                            if (completed === ids.length) {
                                console.log(`[IndexedDB] Marked ${ids.length} interactions as synced`);
                                this.updateCounters();
                                resolve();
                            }
                        };
                    } else {
                        completed++;
                        if (completed === ids.length) {
                            resolve();
                        }
                    }
                };
            });

            if (ids.length === 0) {
                resolve();
            }
        });
    }

    /**
     * Get interaction statistics by image_id
     */
    async getImageStats(datasetVersion?: string): Promise<Map<string, any>> {
        const interactions = await this.getAllInteractions();

        const stats = new Map<string, any>();

        interactions.forEach(interaction => {
            // Filter by dataset version if specified
            if (datasetVersion && interaction.dataset_version !== datasetVersion) {
                return;
            }

            const imageId = interaction.image_id;

            if (!stats.has(imageId)) {
                stats.set(imageId, {
                    image_id: imageId,
                    likes: 0,
                    dislikes: 0,
                    superlikes: 0,
                    total: 0
                });
            }

            const stat = stats.get(imageId);
            stat.total++;

            const action = interaction.action.toLowerCase();
            if (action === 'like') {
                stat.likes++;
            } else if (action === 'dislike') {
                stat.dislikes++;
            } else if (action === 'superlike') {
                stat.superlikes++;
            }
        });

        return stats;
    }

    /**
     * Clear all synced interactions (cleanup)
     */
    async clearSyncedInteractions(): Promise<number> {
        if (!this.db) {
            await this.initDatabase();
        }

        const synced = await this.getAllInteractions(true);

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.INTERACTIONS_STORE], 'readwrite');
            const store = transaction.objectStore(this.INTERACTIONS_STORE);

            let deleted = 0;

            synced.forEach(record => {
                const request = store.delete(record.id);
                request.onsuccess = () => {
                    deleted++;
                    if (deleted === synced.length) {
                        console.log(`[IndexedDB] Cleared ${deleted} synced interactions`);
                        this.updateCounters();
                        resolve(deleted);
                    }
                };
            });

            if (synced.length === 0) {
                resolve(0);
            }
        });
    }

    /**
     * Get total interaction count
     */
    async getInteractionCount(): Promise<number> {
        const interactions = await this.getAllInteractions();
        return interactions.length;
    }

    /**
     * Get unsynced interaction count
     */
    async getUnsyncedCount(): Promise<number> {
        const unsynced = await this.getUnsyncedInteractions();
        return unsynced.length;
    }

    /**
     * Update reactive counters
     */
    private async updateCounters(): Promise<void> {
        const total = await this.getInteractionCount();
        const pending = await this.getUnsyncedCount();

        this.interactionCount$.next(total);
        this.syncPending$.next(pending);
    }

    /**
     * Observable for total interaction count
     */
    getInteractionCount$(): Observable<number> {
        return this.interactionCount$.asObservable();
    }

    /**
     * Observable for pending sync count
     */
    getSyncPendingCount$(): Observable<number> {
        return this.syncPending$.asObservable();
    }

    /**
     * Store sync status
     */
    async setSyncStatus(key: string, value: any): Promise<void> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.SYNC_STATUS_STORE], 'readwrite');
            const store = transaction.objectStore(this.SYNC_STATUS_STORE);

            const request = store.put({ key, value, updated_at: new Date().toISOString() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get sync status
     */
    async getSyncStatus(key: string): Promise<any> {
        if (!this.db) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.SYNC_STATUS_STORE], 'readonly');
            const store = transaction.objectStore(this.SYNC_STATUS_STORE);

            const request = store.get(key);

            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }
}
