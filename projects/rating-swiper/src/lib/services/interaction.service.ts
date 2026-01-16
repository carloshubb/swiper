/**
 * Interaction Service
 * Centralized service for logging user interactions
 * 
 * Purpose: Eliminate code duplication across components
 * Previously: Duplicated in profile-card.component and implicit-swipes.component
 * 
 * Client Requirement: "Ensure that redundant code has been avoided by creating
 * common components and classes where needed"
 * 
 * Client Requirement: "Verify that the system is working correctly when toggling
 * between TEST and STORE modes for storing and tracking labelling data"
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ModeService, DataMode } from './mode.service';
import { CheckpointVersionService } from './checkpoint-version.service';

/**
 * Interaction data structure
 */
export interface Interaction {
    user_id: string;
    image_id: string;
    action: 'like' | 'dislike' | 'superlike';
    dataset_version?: string;
}

/**
 * API response for interaction logging
 */
export interface InteractionResponse {
    status: 'success' | 'error';
    id?: string;
    timestamp?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InteractionService {
    /** Default user ID for anonymous users */
    private readonly DEFAULT_USER_ID = 'anonymous';

    /** Local storage key for TEST mode interactions */
    private readonly TEST_STORAGE_KEY = 'test_mode_interactions';

    constructor(
        private http: HttpClient,
        private modeService: ModeService,
        private checkpointService: CheckpointVersionService
    ) {
        console.log('🔧 InteractionService initialized with ModeService integration');
    }

    /**
     * Log user interaction (like, dislike, or superlike)
     * 
     * Behavior depends on current mode:
     * - TEST mode: Data logged locally only (not saved to backend)
     * - STORE mode: Data saved to backend database
     * 
     * Centralized method to avoid code duplication.
     * Previously duplicated in:
     * - profile-card.component.ts
     * - implicit-swipes.component.ts
     * 
     * @param action - User action: 'like', 'dislike', or 'superlike'
     * @param imageId - Image/profile ID being interacted with
     * @param userId - User ID (defaults to 'anonymous')
     * @returns Observable<InteractionResponse>
     */
    logInteraction(
        action: 'like' | 'dislike' | 'superlike',
        imageId: string,
        userId: string = this.DEFAULT_USER_ID
    ): Observable<InteractionResponse> {
        const currentMode = this.modeService.getCurrentMode();

        console.log(`📝 Logging ${action} for image ${imageId} in ${currentMode} mode`);

        // Route to appropriate handler based on mode
        if (currentMode === DataMode.TEST) {
            return this.logTestInteraction(action, imageId, userId);
        } else {
            return this.logStoreInteraction(action, imageId, userId);
        }
    }

    /**
     * Log interaction in TEST mode (local storage only)
     * Data is NOT sent to backend
     */
    private logTestInteraction(
        action: string,
        imageId: string,
        userId: string
    ): Observable<InteractionResponse> {
        const interaction = {
            user_id: userId,
            image_id: imageId,
            action: action,
            timestamp: new Date().toISOString(),
            mode: 'TEST'
        };

        // Store in localStorage
        this.saveTestInteractionLocally(interaction);

        const response: InteractionResponse = {
            status: 'success',
            id: `test_${Date.now()}`,
            timestamp: interaction.timestamp,
            message: 'TEST mode: Interaction logged locally only'
        };

        console.log('🧪 TEST MODE: Interaction logged locally (NOT saved to database)', response);

        // Simulate network delay for realistic UX
        return of(response).pipe(delay(100));
    }

    /**
     * Log interaction in STORE mode (save to backend database)
     * Data IS sent to backend and saved to MongoDB
     */
    private logStoreInteraction(
        action: string,
        imageId: string,
        userId: string
    ): Observable<InteractionResponse> {
        const activeVersion = this.checkpointService.getActiveCompoundVersion();
        const payload: Interaction = {
            user_id: userId,
            image_id: imageId,
            action: action as 'like' | 'dislike' | 'superlike',
            dataset_version: activeVersion || undefined
        };

        if (activeVersion) {
            console.log(`💾 STORE MODE: Sending to backend (Checkpoint: ${activeVersion})`);
        } else {
            console.log('💾 STORE MODE: Sending to backend (No active checkpoint)');
        }

        let apiUrl = localStorage.getItem('sw_api_url') || environment.apiUrl;
        if (apiUrl.includes('localhost')) {
            apiUrl = apiUrl.replace('localhost', '127.0.0.1');
        }

        return this.http.post<InteractionResponse>(
            `${apiUrl}/interaction`,
            payload
        ).pipe(
            // Auto-retry once on failure
            retry(1),

            // Log success
            tap((response) => {
                console.log(`✅ STORE MODE: ${action} saved to database successfully`, response);
            }),

            // Handle errors
            catchError((error: HttpErrorResponse) => {
                console.error(`❌ STORE MODE: Failed to save ${action} to database`, error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Save test interaction to localStorage
     */
    private saveTestInteractionLocally(interaction: any): void {
        try {
            const stored = localStorage.getItem(this.TEST_STORAGE_KEY);
            const interactions = stored ? JSON.parse(stored) : [];
            interactions.push(interaction);

            // Keep only last 100 interactions to avoid storage overflow
            const limited = interactions.slice(-100);

            localStorage.setItem(this.TEST_STORAGE_KEY, JSON.stringify(limited));
            console.log(`📂 Saved to localStorage (${limited.length} total test interactions)`);
        } catch (error) {
            console.error('Failed to save test interaction locally', error);
        }
    }

    /**
     * Get all test mode interactions from localStorage
     * Useful for debugging and verification
     */
    getTestInteractions(): any[] {
        try {
            const stored = localStorage.getItem(this.TEST_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load test interactions', error);
            return [];
        }
    }

    /**
     * Clear all test mode interactions from localStorage
     */
    clearTestInteractions(): void {
        try {
            localStorage.removeItem(this.TEST_STORAGE_KEY);
            console.log('🧹 Cleared all test interactions from localStorage');
        } catch (error) {
            console.error('Failed to clear test interactions', error);
        }
    }

    /**
     * Log multiple interactions in batch
     * Useful for logging history or bulk operations
     * 
     * @param interactions - Array of interactions to log
     * @returns Observable<InteractionResponse[]>
     */
    logBatchInteractions(
        interactions: Array<{ action: 'like' | 'dislike' | 'superlike', imageId: string }>
    ): Observable<InteractionResponse[]> {
        const currentMode = this.modeService.getCurrentMode();
        console.log(`📝 Logging ${interactions.length} interactions in batch (${currentMode} mode)`);

        const requests = interactions.map(({ action, imageId }) =>
            this.logInteraction(action, imageId)
        );

        // Could use forkJoin here for parallel requests
        // For now, return array of individual observables
        // Component can handle them as needed
        return new Observable(observer => {
            let completed = 0;
            const results: InteractionResponse[] = [];

            requests.forEach((request, index) => {
                request.subscribe({
                    next: (response) => {
                        results[index] = response;
                        completed++;

                        if (completed === requests.length) {
                            observer.next(results);
                            observer.complete();
                        }
                    },
                    error: (error) => {
                        observer.error(error);
                    }
                });
            });
        });
    }
}
