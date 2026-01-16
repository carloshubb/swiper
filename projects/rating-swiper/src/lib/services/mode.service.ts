/**
 * Data Mode Service
 * Manages TEST vs STORE modes for data labeling
 * 
 * Client Requirement: "Verify that the system is working correctly when toggling
 * between TEST and STORE modes for storing and tracking labelling data"
 * 
 * Modes:
 * - TEST: Data logged locally only, not saved to backend database
 * - STORE: Data saved to backend database for ML training
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Data storage modes
 */
export enum DataMode {
    /** Test mode: Data not saved to database (for practice/testing) */
    TEST = 'TEST',

    /** Store mode: Data saved to database (for production labeling) */
    STORE = 'STORE'
}

@Injectable({
    providedIn: 'root'
})
export class ModeService {
    /** Local storage key for persisting mode */
    private readonly MODE_STORAGE_KEY = 'dataLabelingMode';

    /** Current mode observable */
    private currentMode$: BehaviorSubject<DataMode>;

    constructor() {
        // Initialize mode from localStorage or environment
        const savedMode = this.loadModeFromStorage();
        const initialMode = savedMode || this.getDefaultMode();

        this.currentMode$ = new BehaviorSubject<DataMode>(initialMode);

        console.log(`🎯 ModeService initialized: ${initialMode}`);
    }

    /**
     * Get default mode based on environment
     */
    private getDefaultMode(): DataMode {
        // Default to STORE mode so that interactions are saved to backend by default
        // This ensures the leaderboard updates as users expect.
        return DataMode.STORE;
    }

    /**
     * Load mode from localStorage
     */
    private loadModeFromStorage(): DataMode | null {
        try {
            const stored = localStorage.getItem(this.MODE_STORAGE_KEY);
            if (stored === DataMode.TEST || stored === DataMode.STORE) {
                console.log(`📂 Loaded mode from storage: ${stored}`);
                return stored as DataMode;
            }
        } catch (error) {
            console.warn('Failed to load mode from storage', error);
        }
        return null;
    }

    /**
     * Save mode to localStorage
     */
    private saveModeToStorage(mode: DataMode): void {
        try {
            localStorage.setItem(this.MODE_STORAGE_KEY, mode);
            console.log(`💾 Saved mode to storage: ${mode}`);
        } catch (error) {
            console.error('Failed to save mode to storage', error);
        }
    }

    /**
     * Get current mode as Observable
     * Subscribe to this to react to mode changes
     * 
     * @returns Observable<DataMode>
     */
    getMode(): Observable<DataMode> {
        return this.currentMode$.asObservable();
    }

    /**
     * Get current mode value (synchronous)
     * 
     * @returns Current DataMode
     */
    getCurrentMode(): DataMode {
        return this.currentMode$.value;
    }

    /**
     * Toggle between TEST and STORE modes
     */
    toggleMode(): void {
        const currentMode = this.currentMode$.value;
        const newMode = currentMode === DataMode.TEST
            ? DataMode.STORE
            : DataMode.TEST;

        this.setMode(newMode);
    }

    /**
     * Set specific mode
     * 
     * @param mode - Mode to set (TEST or STORE)
     */
    setMode(mode: DataMode): void {
        const previousMode = this.currentMode$.value;

        if (previousMode === mode) {
            console.log(`ℹ️ Mode already set to ${mode}`);
            return;
        }

        console.log(`🔄 Switching mode: ${previousMode} → ${mode}`);

        // Update observable
        this.currentMode$.next(mode);

        // Persist to storage
        this.saveModeToStorage(mode);

        // Log success
        console.log(`✅ Mode switched to: ${mode}`);

        // Show user notification (optional)
        this.showModeNotification(mode);
    }

    /**
     * Check if currently in TEST mode
     * 
     * @returns true if TEST mode
     */
    isTestMode(): boolean {
        return this.currentMode$.value === DataMode.TEST;
    }

    /**
     * Check if currently in STORE mode
     * 
     * @returns true if STORE mode
     */
    isStoreMode(): boolean {
        return this.currentMode$.value === DataMode.STORE;
    }

    /**
     * Get mode description for UI
     * 
     * @returns Human-readable mode description
     */
    getModeDescription(): string {
        const mode = this.getCurrentMode();

        if (mode === DataMode.TEST) {
            return '🧪 TEST Mode: Data logged locally only (not saved to database)';
        } else {
            return '💾 STORE Mode: Data saved to database for ML training';
        }
    }

    /**
     * Show notification when mode changes (optional)
     */
    private showModeNotification(mode: DataMode): void {
        // You can implement a toast notification here
        const message = mode === DataMode.TEST
            ? '🧪 Switched to TEST mode - Data will not be saved'
            : '💾 Switched to STORE mode - Data will be saved to database';

        console.log(`📢 Notification: ${message}`);
    }

    /**
     * Reset to default mode
     */
    resetToDefault(): void {
        const defaultMode = this.getDefaultMode();
        this.setMode(defaultMode);
    }

    /**
     * Clear persisted mode (will use default on next load)
     */
    clearPersistedMode(): void {
        try {
            localStorage.removeItem(this.MODE_STORAGE_KEY);
            console.log('🧹 Cleared persisted mode');
        } catch (error) {
            console.error('Failed to clear persisted mode', error);
        }
    }
}
