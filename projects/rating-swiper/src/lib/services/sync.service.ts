import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IndexedDbService } from './indexed-db.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Sync Service for Backend Reconciliation
 * 
 * Implements "Method A" - authoritative backend sync that happens:
 * - Every 200 interactions
 * - On session end
 * - When train button is clicked
 */
@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private get apiUrl(): string {
        let url = localStorage.getItem('sw_api_url') || environment.apiUrl;
        if (url.includes('localhost')) {
            url = url.replace('localhost', '127.0.0.1');
        }
        return url;
    }
    private syncThreshold = 200; // Sync every 200 interactions
    private lastSyncCount = 0;

    private syncing$ = new BehaviorSubject<boolean>(false);
    private lastSyncTime$ = new BehaviorSubject<Date | null>(null);

    constructor(
        private http: HttpClient,
        private indexedDb: IndexedDbService
    ) {
        // Auto-sync on threshold
        this.indexedDb.getSyncPendingCount$().subscribe(count => {
            if (count >= this.syncThreshold && count > this.lastSyncCount) {
                console.log(`[SYNC] Threshold reached: ${count} >= ${this.syncThreshold}`);
                this.syncToBackend('threshold');
            }
        });
    }

    /**
     * Sync unsynced interactions to backend
     */
    async syncToBackend(trigger: 'threshold' | 'session_end' | 'train' | 'manual'): Promise<{ success: boolean, synced: number }> {
        if (this.syncing$.value) {
            console.log('[SYNC] Already syncing, skipping...');
            return { success: false, synced: 0 };
        }

        try {
            this.syncing$.next(true);

            const unsynced = await this.indexedDb.getUnsyncedInteractions();

            if (unsynced.length === 0) {
                console.log('[SYNC] No unsynced interactions to sync');
                this.syncing$.next(false);
                return { success: true, synced: 0 };
            }

            console.log(`[SYNC] Syncing ${unsynced.length} interactions to backend (trigger: ${trigger})`);

            // Batch send to backend
            const batch = unsynced.map(interaction => ({
                user_id: interaction.user_id,
                image_id: interaction.image_id,
                action: interaction.action,
                timestamp: interaction.timestamp,
                dataset_version: interaction.dataset_version,
                title_variant_id: interaction.title_variant_id
            }));

            // Send to backend batch endpoint
            await this.http.post(`${this.apiUrl}/interactions/batch`, { interactions: batch }).toPromise();

            // Mark as synced
            const ids = unsynced.map(i => i.id);
            await this.indexedDb.markAsSynced(ids);

            this.lastSyncCount = await this.indexedDb.getUnsyncedCount();
            this.lastSyncTime$.next(new Date());

            console.log(`[SYNC] Successfully synced ${unsynced.length} interactions`);

            // Cleanup old synced records (optional, keep last 1000)
            const totalCount = await this.indexedDb.getInteractionCount();
            if (totalCount > 1000) {
                await this.indexedDb.clearSyncedInteractions();
            }

            this.syncing$.next(false);
            return { success: true, synced: unsynced.length };

        } catch (error) {
            console.error('[SYNC] Failed to sync to backend:', error);
            this.syncing$.next(false);
            return { success: false, synced: 0 };
        }
    }

    /**
     * Force immediate sync (for session end or train)
     */
    async forceSyncNow(trigger: 'session_end' | 'train' | 'manual'): Promise<boolean> {
        const result = await this.syncToBackend(trigger);
        return result.success;
    }

    /**
     * Observable to check if sync is in progress
     */
    isSyncing$(): Observable<boolean> {
        return this.syncing$.asObservable();
    }

    /**
     * Observable for last sync time
     */
    getLastSyncTime$(): Observable<Date | null> {
        return this.lastSyncTime$.asObservable();
    }

    /**
     * Get sync threshold
     */
    getSyncThreshold(): number {
        return this.syncThreshold;
    }

    /**
     * Set sync threshold (for testing or config)
     */
    setSyncThreshold(threshold: number): void {
        this.syncThreshold = threshold;
    }
}
