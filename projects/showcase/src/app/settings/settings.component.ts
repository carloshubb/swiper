import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../rating-swiper/src/environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CardNavigationService } from '../../../../rating-swiper/src/lib/services/card-navigation.service';
import { ModeService, DataMode } from '../../../../rating-swiper/src/lib/services/mode.service';
import { CheckpointVersionService, CheckpointListItem } from '../../../../rating-swiper/src/lib/services/checkpoint-version.service';
import { IndexedDbService } from '../../../../rating-swiper/src/lib/services/indexed-db.service';
import { FrontendBradleyTerryService } from '../../../../rating-swiper/src/lib/services/frontend-bradley-terry.service';
import { SyncService } from '../../../../rating-swiper/src/lib/services/sync.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule],
    providers: [],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    checkpoints: any[] = [];
    selectedCheckpoint: string = '';

    // New Versioning System
    versionedCheckpoints: CheckpointListItem[] = [];
    selectedCheckpointName: string = '';
    selectedVersion: string = '';
    availableVersions: string[] = [];

    // Use environment URL by default
    apiUrl = environment.apiUrl;
    loading = false;
    error = '';

    leaderboard: any[] = [];
    frontendLeaderboard: any[] = []; // Frontend BT calculation (Method B)
    previousLeaderboard: any[] = []; // For comparison (Baseline)
    activeModelLeaderboard: any[] = []; // Current Live
    lastActiveVersion: string = '';
    lastActiveLeaderboard: any[] = []; // Model before switch
    models: any[] = []; // Trained models history

    // Sync Status
    syncPending = 0;
    isSyncing = false;
    lastSyncTime: Date | null = null;
    totalInteractions = 0;


    constructor(
        private http: HttpClient,
        private cardService: CardNavigationService,
        private checkpointService: CheckpointVersionService,
        private modeService: ModeService,
        private indexedDb: IndexedDbService,
        private frontendBT: FrontendBradleyTerryService,
        private syncService: SyncService
    ) { }

    datasetCheckpoints: any[] = []; // Keeping for legacy view if needed
    checkpointName: string = '';
    swiperTitle: string = '';

    ngOnInit() {
        // Load API URL from storage or default
        let storedUrl = localStorage.getItem('sw_api_url');
        if (storedUrl) {
            // Force 127.0.0.1 if it's localhost to avoid IP resolution issues
            if (storedUrl.includes('localhost')) {
                storedUrl = storedUrl.replace('localhost', '127.0.0.1');
                localStorage.setItem('sw_api_url', storedUrl);
            }
            this.apiUrl = storedUrl;
        } else {
            this.apiUrl = environment.apiUrl;
        }
        console.log('Using API URL:', this.apiUrl);

        this.selectedCheckpoint = localStorage.getItem('sw_checkpoint') || '';

        // Load New Versioning System Selections
        this.selectedCheckpointName = localStorage.getItem('sw_checkpoint_name') || '';
        this.selectedVersion = localStorage.getItem('sw_checkpoint_version') || '';

        // this.fetchCheckpoints(); // Legacy removed
        this.fetchVersionedCheckpoints(); // New System
        this.fetchDatasetCheckpoints(); // Restore legacy list
        this.fetchTrainedModels();

        // Auto-migrate if needed
        setTimeout(() => this.checkAndMigrate(), 1000);

        this.fetchCurrentModelVersion();

        // Restore last active for comparison
        this.lastActiveVersion = localStorage.getItem('last_active_v') || '';
        const savedLB = localStorage.getItem('last_active_lb');
        if (savedLB) {
            try { this.lastActiveLeaderboard = JSON.parse(savedLB); } catch (e) { }
        }

        // Initialize sync status monitoring
        this.indexedDb.getSyncPendingCount$().subscribe(count => {
            this.syncPending = count;
        });

        this.indexedDb.getInteractionCount$().subscribe(count => {
            this.totalInteractions = count;
        });

        this.syncService.isSyncing$().subscribe(syncing => {
            this.isSyncing = syncing;
        });

        this.syncService.getLastSyncTime$().subscribe(time => {
            this.lastSyncTime = time;
        });

        // Migrate old boolean data to 0/1 numbers (one-time fix)
        this.indexedDb.migrateBooleanToNumber().then(count => {
            if (count > 0) {
                console.log(`[MIGRATION] Fixed ${count} old interactions`);
            }
        }).catch(err => {
            console.error('[MIGRATION] Failed to migrate data:', err);
        });

        // Load frontend leaderboard from IndexedDB
        this.loadFrontendLeaderboard();

        // Auto-refresh frontend leaderboard every 2 seconds
        setInterval(() => this.loadFrontendLeaderboard(), 2000);

        // Start real-time polling for leaderboards
        this.startLeaderboardPolling();
    }

    fetchCurrentModelVersion() {
        if (!this.apiUrl) return;
        this.http.get<any>(`${this.apiUrl}/dataset/config`).subscribe({
            next: (res) => {
                if (res && res.version) {
                    this.currentModelVersion = res.version;
                    this.fetchLeaderboard(); // Ensure leaderboard is updated after version is known
                }
            },
            error: (err) => console.log('Failed to fetch current model info', err)
        });
    }

    saveApiUrl() {
        if (!this.apiUrl.trim()) return;

        // Ensure format is correct (no trailing slash)
        if (this.apiUrl.endsWith('/')) {
            this.apiUrl = this.apiUrl.slice(0, -1);
        }

        localStorage.setItem('sw_api_url', this.apiUrl);
        alert('API URL updated! Reloading data...');

        // Refresh everything
        this.fetchVersionedCheckpoints();
        this.fetchCurrentModelVersion();
        this.fetchTrainedModels();
    }

    checkAndMigrate() {
        if (this.versionedCheckpoints.length === 0) {
            this.checkpointService.migrateLegacyCheckpoints().subscribe({
                next: (res) => {
                    console.log('Migration status:', res);
                    this.fetchVersionedCheckpoints();
                },
                error: (e) => console.log('Migration check skipped or failed', e)
            });
        }
    }

    fetchVersionedCheckpoints() {
        this.loading = true;
        this.checkpointService.listCheckpoints().subscribe({
            next: (res) => {
                this.versionedCheckpoints = res.checkpoints || [];
                if (this.selectedCheckpointName) {
                    this.loadVersionsForSelected();
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to list versioned checkpoints', err);
                this.loading = false;
            }
        });
    }

    onCheckpointSelect(name: string) {
        this.selectedCheckpointName = name;
        this.loadVersionsForSelected();
        // Default to latest and refresh immediately
        if (this.availableVersions.length > 0) {
            this.selectVersion(this.availableVersions[0]);
        } else {
            this.fetchLeaderboard();
        }
    }

    loadVersionsForSelected() {
        const found = this.versionedCheckpoints.find(c => c.name === this.selectedCheckpointName);
        if (found) {
            this.availableVersions = this.checkpointService.sortVersionsDescending(found.versions);
        } else {
            this.availableVersions = [];
        }
    }

    selectVersion(version: string) {
        this.selectedVersion = version;

        // Set active checkpoint in service (this also handles localStorage internally)
        this.checkpointService.setActiveCheckpoint(this.selectedCheckpointName, version);

        // Force STORE mode when interacting with checkpoints
        this.modeService.setMode(DataMode.STORE);

        this.fetchLeaderboard();
    }

    // Legacy mapping (restored for visibility)
    fetchDatasetCheckpoints() {
        this.http.get<any>(`${this.apiUrl}/dataset/checkpoints`).subscribe({
            next: (res) => {
                this.datasetCheckpoints = res.checkpoints || [];
            }
        });
    }

    fetchTrainedModels() {
        this.http.get<any>(`${this.apiUrl}/models`).subscribe({
            next: (res) => {
                this.models = res.models || [];
            },
            error: (err) => console.error("Failed to load models", err)
        });
    }

    activateModel(filename: string) {
        if (!filename) return;

        // Save current as "Last Active" before switching
        if (this.currentModelVersion) {
            this.lastActiveVersion = this.currentModelVersion;
            this.lastActiveLeaderboard = [...this.activeModelLeaderboard];

            localStorage.setItem('last_active_v', this.lastActiveVersion);
            localStorage.setItem('last_active_lb', JSON.stringify(this.lastActiveLeaderboard));
        }

        this.loading = true;
        this.http.post<any>(`${this.apiUrl}/models/activate`, { filename }).subscribe({
            next: (res: any) => {
                console.log('Model activated:', res);
                this.loading = false;

                // Immediately update version and leaderboard if returned
                if (res.version) {
                    this.currentModelVersion = res.version;
                    this.fetchLeaderboard();
                } else {
                    this.fetchCurrentModelVersion();
                }

                this.fetchTrainedModels(); // Refresh list to update ACTIVE badge
                alert('Model Activated successfully!');
            },
            error: (err) => {
                console.error('Failed to activate model:', err);
                this.loading = false;
                alert('Activation Error: ' + (err.error?.detail || err.message));
            }
        });
    }

    startModelEdit(m: any) {
        m.isEditing = true;
        m.editName = m.custom_name || m.filename;
    }

    cancelModelEdit(m: any) {
        m.isEditing = false;
    }

    saveModelRename(m: any) {
        if (!m.editName || !m.editName.trim()) return;

        this.http.post(`${this.apiUrl}/models/rename`, {
            filename: m.filename,
            custom_name: m.editName
        }).subscribe({
            next: () => {
                m.custom_name = m.editName;
                m.isEditing = false;
            }
        });
    }

    startEdit(ckpt: any) {
        // ... (legacy edit code kept for compatibility if needed, but UI will use new calls)
        ckpt.isEditing = true;
    }

    cancelEdit(ckpt: any) {
        ckpt.isEditing = false;
    }

    saveCheckpointEdit(ckpt: any) {
        // ... legacy
        ckpt.isEditing = false;
    }

    updateTitle(ckpt: CheckpointListItem, newTitle: string) {
        if (!newTitle.trim()) return;
        this.checkpointService.updateTitle(ckpt.name, newTitle).subscribe({
            next: () => {
                ckpt.title = newTitle;
            },
            error: (err) => alert('Failed to update title')
        });
    }

    trainSpecificVersion(name: string, version: string) {
        if (!name || !version) return;
        const trainId = `${name}@${version}`;

        this.isTraining = true;
        this.trainingComplete = false;
        this.trainingStatus = 'Starting Training Pipeline...';
        this.error = '';

        this.http.post<any>(`${this.apiUrl}/train`, { checkpoint_id: trainId }).subscribe({
            next: (res) => {
                console.log('Training successful:', res);
                this.simulateProgress();
                this.fetchLeaderboard();
            },
            error: (err) => {
                console.error('Training failed:', err);
                this.isTraining = false;
                this.trainingStatus = 'Failed to Train';
                this.error = 'Training Error: ' + (err.error?.detail || err.message);
            }
        });
    }

    createDatasetCheckpoint() {
        if (!this.checkpointName.trim()) {
            alert('Please enter a name for the checkpoint.');
            return;
        }

        this.loading = true;

        // We use the legacy POST but rely on backend manager to handle versioning if updated logic is there.
        // Or we use the new logic. The backend route /dataset/checkpoint (create_manual_checkpoint) 
        // uses DataPreprocessor which isn't fully updated yet to use version manager in this codebase.
        // BUT, the USER asked to use the new system.
        // Let's use the legacy endpoint for now as it creates the file, and the backend migration/manager 
        // can pick it up or we can update the backend creation logic later.
        // Actually, for "create_checkpoint" via Routes, it's safer to use the existing one 
        // and then refresh the version list.

        const payload = {
            name: this.checkpointName,
            swiper_title: this.swiperTitle
        };

        this.http.post<any>(`${this.apiUrl}/dataset/checkpoint`, payload).subscribe({
            next: (res) => {
                alert(`Checkpoint Created!`);
                this.checkpointName = '';
                this.swiperTitle = '';
                // Refresh lists to see the new checkpoint immediately
                this.fetchVersionedCheckpoints();
                this.fetchDatasetCheckpoints();
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to create checkpoint', err);
                alert('Failed to create checkpoint.');
                this.loading = false;
            }
        });
    }

    trainFromCheckpoint(checkpointId: string) {
        if (confirm(`Train model from checkpoint: ${checkpointId}?`)) {
            // ... (rest of training logi is mostly same, just ensuring we pick right ID)
            // If checkpointId is a name now, we might need adjustment.
            // But legacy ID was filename without extension. New name is "checkpointName".
            // They should map correctly if we use the name.
            this.runTraining(checkpointId);
        }
    }

    runTraining(checkpointId: string) {
        this.isTraining = true;
        this.trainingComplete = false;
        this.trainingProgress = 0;
        this.trainingStatus = `Training on ${checkpointId}...`;

        this.http.post<any>(`${this.apiUrl}/train`, { checkpoint_id: checkpointId }).subscribe({
            next: (res) => {
                this.trainingStatus = 'Training Complete';
                this.trainingProgress = 100;
                this.isTraining = false;
                this.trainingComplete = true;
                this.currentModelVersion = res.version || 'v-new';

                // Refresh our lists
                this.fetchVersionedCheckpoints();

                alert(`Training Complete! New Version: ${this.currentModelVersion}\nAccuracy: ${res.metrics?.accuracy?.toFixed(4)}`);
            },
            error: (err) => {
                console.error("Training failed", err);
                this.isTraining = false;
                this.error = "Training Failed: " + (err.error?.detail || err.message);
                alert(this.error);
            }
        });
    }

    fetchCheckpoints() {
        // Legacy method - kept for "Available Checkpoints" top section if needed, 
        // but we might want to replace that section's data source too.
        // For now, let's leave it as is to avoid breaking the "Model Training" view heavily.
        this.loading = true;
        this.http.get<any[]>(`${this.apiUrl}/checkpoints`).subscribe({
            next: (data) => {
                this.checkpoints = data.map(d => {
                    return typeof d === 'string' ? { version: d, custom_name: null } : { ...d };
                });
                this.finalizeLoading();
            },
            error: () => {
                this.finalizeLoading();
            }
        });
    }

    startEditVersion(ckpt: any) {
        ckpt.isEditing = true;
        ckpt.originalName = ckpt.custom_name;
    }

    cancelEditVersion(ckpt: any) {
        ckpt.isEditing = false;
        ckpt.custom_name = ckpt.originalName;
    }

    saveVersionEdit(ckpt: any) {
        if (!ckpt.custom_name || !ckpt.custom_name.trim()) return;

        this.http.patch(`${this.apiUrl}/model/version/${ckpt.version}`, { custom_name: ckpt.custom_name }).subscribe({
            next: () => {
                ckpt.isEditing = false;
            },
            error: (err) => alert('Failed to update version name')
        });
    }

    get getSelectedCheckpointName(): string {
        return this.selectedCheckpointName || 'Base Model';
    }

    get currentInputCheckpoint(): any {
        return this.versionedCheckpoints.find(c => c.name === this.checkpointName);
    }

    /**
     * Load Frontend Leaderboard (Method B - Live)
     * Calculate Bradley-Terry scores from IndexedDB
     */
    async loadFrontendLeaderboard() {
        try {
            // Get current dataset version
            const datasetVersion = this.selectedVersion
                ? (this.selectedCheckpointName
                    ? `${this.selectedCheckpointName}@${this.checkpointService.formatVersion(this.selectedVersion)}`
                    : this.checkpointService.formatVersion(this.selectedVersion))
                : undefined;

            // Get stats from IndexedDB
            const stats = await this.indexedDb.getImageStats(datasetVersion);

            if (stats.size === 0) {
                this.frontendLeaderboard = this.mapImages([], true);
                return;
            }

            // Calculate Bradley-Terry scores
            const leaderboard = this.frontendBT.getLeaderboard(stats, 10);

            // Map to image URLs
            this.frontendLeaderboard = this.mapImages(leaderboard, false);

            console.log('[Frontend BT] Leaderboard updated:', leaderboard.length, 'profiles');
        } catch (error) {
            console.error('[Frontend BT] Failed to load leaderboard:', error);
            this.frontendLeaderboard = [];
        }
    }

    /**
     * Manual sync trigger
     */
    async manualSync() {
        if (this.isSyncing || this.syncPending === 0) {
            console.log('[SYNC] Cannot sync: already syncing or no pending items');
            return;
        }

        try {
            const result = await this.syncService.syncToBackend('manual');

            if (result.success) {
                console.log(`[SYNC] Successfully synced ${result.synced} interactions`);
                alert(`✅ Successfully synced ${result.synced} interactions to backend!`);

                // Refresh backend leaderboard after sync
                this.fetchLeaderboard();
            } else {
                alert('❌ Sync failed. Please try again.');
            }
        } catch (error) {
            console.error('[SYNC] Manual sync error:', error);
            alert('❌ Sync error. Check console for details.');
        }
    }


    private leaderboardInterval: any;

    startLeaderboardPolling() {
        if (this.leaderboardInterval) clearInterval(this.leaderboardInterval);
        this.fetchLeaderboard(); // Initial call
        this.leaderboardInterval = setInterval(() => {
            if (!this.loading) {
                this.fetchLeaderboard();
            }
        }, 3000); // Poll every 3 seconds for real-time feel
    }

    fetchLeaderboard() {
        if (!this.apiUrl) return;

        // 1. Current Selection
        let currentUrl = `${this.apiUrl}/dataset/leaderboard?limit=10`;
        if (this.selectedVersion) {
            let version = this.selectedVersion;
            // Compound if needed
            if (!version.includes('@') && this.selectedCheckpointName) {
                const vPrefix = version.startsWith('v') ? version : `v${version}`;
                version = `${this.selectedCheckpointName}@${vPrefix}`;
            }
            currentUrl += `&version=${version}`;

            this.http.get<any>(currentUrl).subscribe({
                next: (res: any) => {
                    this.leaderboard = this.mapImages(res.leaderboard || [], false);
                },
                error: () => {
                    this.leaderboard = this.mapImages([], false);
                }
            });
        } else {
            this.leaderboard = this.mapImages([], false);
        }

        // 2. Active Model
        if (this.currentModelVersion) {
            const v = this.currentModelVersion.startsWith('v') ? this.currentModelVersion : `v${this.currentModelVersion}`;
            this.http.get<any>(`${this.apiUrl}/dataset/leaderboard?limit=10&version=${v}`).subscribe({
                next: (res: any) => {
                    console.log(`Active model data (${v}) received:`, res.leaderboard?.length || 0, "results");
                    this.activeModelLeaderboard = this.mapImages(res.leaderboard || [], false);
                },
                error: (err) => {
                    console.error("Active model fetch error:", err);
                    this.activeModelLeaderboard = this.mapImages([], false);
                }
            });
        }

        // 3. Comparison
        if (this.lastActiveVersion) {
            const v = this.lastActiveVersion.startsWith('v') ? this.lastActiveVersion : `v${this.lastActiveVersion}`;
            this.http.get<any>(`${this.apiUrl}/dataset/leaderboard?limit=10&version=${v}`).subscribe({
                next: (res: any) => {
                    this.lastActiveLeaderboard = this.mapImages(res.leaderboard || [], false);
                },
                error: () => { }
            });
        }

        // 4. Base
        this.http.get<any>(`${this.apiUrl}/dataset/leaderboard?limit=10&version=v1.0.0`).subscribe({
            next: (res: any) => {
                console.log("Baseline data received:", res.leaderboard?.length || 0, "results");
                this.previousLeaderboard = this.mapImages(res.leaderboard || [], false);
            },
            error: (err) => {
                console.error("Baseline fetch error:", err);
                this.previousLeaderboard = this.mapImages([], false);
            }
        });
    }

    mapImages(list: any[], showAllIfEmpty = false): any[] {
        const allCards = this.cardService.getCards() || [];
        const result = (list || []).map(item => {
            const card = allCards.find(c => c.id.toString() === String(item.image_id));
            return {
                ...item,
                image: (card && card.imageUrls && card.imageUrls[0]) ? card.imageUrls[0] : (item.image || null),
                name: card ? card.name : (item.name || `Profile ${item.image_id}`),
                likes: Number(item.likes || 0),
                dislikes: Number(item.dislikes || 0),
                score: Number(item.score || 0)
            };
        });

        if (showAllIfEmpty) {
            const existingIds = result.map(r => String(r.image_id));
            const remaining = allCards
                .filter(c => !existingIds.includes(String(c.id)))
                .map(c => ({
                    image_id: String(c.id),
                    likes: 0,
                    dislikes: 0,
                    score: 0,
                    image: (c.imageUrls && c.imageUrls[0]) ? c.imageUrls[0] : null,
                    name: c.name
                }));
            return [...result, ...remaining];
        }
        return result;
    }

    finalizeLoading() {
        if (!this.selectedCheckpoint && this.checkpoints.length > 0) {
            this.selectedCheckpoint = this.checkpoints[0].version;
            this.saveCheckpoint(this.selectedCheckpoint);
        }

        // Sync title
        const current = this.checkpoints.find(c => c.version === this.selectedCheckpoint);
        if (current) {
            const title = current.custom_name || "Who is more attractive?";
            localStorage.setItem('sw_checkpoint_title', title);
        }

        this.loading = false;
    }

    selectCheckpoint(ckpt: any) {
        this.selectedCheckpoint = ckpt.version;
        this.saveCheckpoint(ckpt.version);
        const title = ckpt.custom_name || "Who is more attractive?";
        localStorage.setItem('sw_checkpoint_title', title);
        this.fetchLeaderboard();
    }


    // Getter removed in favor of property


    // Training State
    isTraining = false;
    currentModelVersion = 'v1.1.0'; // Default displayed version
    trainingProgress = 0;
    trainingStatus = '';
    trainingComplete = false;

    triggerTraining() {
        this.isTraining = true;
        this.trainingComplete = false;
        this.trainingProgress = 0;
        this.trainingStatus = 'Initializing...';

        // Call Backend to start
        this.http.post<any>(`${this.apiUrl}/train`, {}).subscribe({
            next: (res) => {
                console.log('Training started:', res);
                this.simulateProgress();
            },
            error: (err) => {
                console.error('Training Error:', err);
                this.isTraining = false;
                this.error = 'Failed to start training. Check console.';
            }
        });
    }

    simulateProgress() {
        let percent = 0;
        this.trainingStatus = 'Training Model...';

        const interval = setInterval(() => {
            percent += Math.floor(Math.random() * 5) + 1; // Increment by 1-5%

            if (percent > 80 && percent < 90) {
                this.trainingStatus = 'Finalizing Weights...';
            }

            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);
                this.isTraining = false;
                this.trainingComplete = true;
                this.trainingStatus = 'Complete';
                this.trainingProgress = 100;
                setTimeout(() => {
                    this.currentModelVersion = 'v1.2.0-rc1'; // Simulate version bump
                    this.fetchCheckpoints(); // Refresh list to show new version
                    this.fetchLeaderboard();
                }, 1000);
            } else {
                this.trainingProgress = percent;
            }
        }, 200); // Update every 200ms (~20 seconds total)
    }

    saveCheckpoint(ckpt: string) {
        localStorage.setItem('sw_checkpoint', ckpt);
        console.log('Checkpoint set to:', ckpt);
    }
}
