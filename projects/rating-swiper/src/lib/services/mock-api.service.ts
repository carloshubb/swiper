/**
 * Mock API Service
 * Simulates API calls with 1000ms delay for testing purposes
 * 
 * Client Requirement: "Verify that observables are used to mock API calls
 * with a delay of 1000ms for testing purposes"
 * 
 * Features:
 * - All methods return Observables (no Promises)
 * - 1000ms delay on all operations
 * - Console logging for debugging
 * - Generates unique IDs for testing
 */
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';

export interface Interaction {
    user_id: string;
    image_id: string;
    action: 'like' | 'dislike' | 'superlike';
}

export interface InteractionResponse {
    status: 'success' | 'error';
    id: string;
    timestamp: string;
    interaction?: Interaction;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MockApiService {
    /**
     * Mock delay in milliseconds
     * Client requirement: 1000ms delay for testing
     */
    private readonly MOCK_DELAY_MS = 1000;

    // In-memory storage for testing
    private mockInteractions: Interaction[] = [];

    constructor() {
        console.log('🧪 MockApiService initialized - All API calls delayed by 1000ms');
    }

    /**
     * Mock: Log interaction with 1000ms delay
     * Returns Observable (not Promise)
     * 
     * @param interaction - User interaction data
     * @returns Observable<InteractionResponse> after 1000ms delay
     */
    logInteraction(interaction: Interaction): Observable<InteractionResponse> {
        console.log('🧪 [Mock API] Logging interaction:', interaction);

        const response: InteractionResponse = {
            status: 'success',
            id: this.generateMockId(),
            timestamp: new Date().toISOString(),
            interaction: interaction
        };

        // Store in memory
        this.mockInteractions.push(interaction);

        // Return Observable with 1000ms delay
        return of(response).pipe(
            delay(this.MOCK_DELAY_MS),  // ✅ 1000ms delay as required
            tap(res => console.log('✅ [Mock API] Response:', res))
        );
    }

    /**
     * Mock: Get all interactions with 1000ms delay
     * 
     * @returns Observable<Interaction[]> after 1000ms delay
     */
    getInteractions(): Observable<Interaction[]> {
        console.log('🧪 [Mock API] Fetching interactions...');

        // Return mock data if empty
        const mockData = this.mockInteractions.length > 0
            ? this.mockInteractions
            : this.generateMockInteractions();

        return of(mockData).pipe(
            delay(this.MOCK_DELAY_MS),  // ✅ 1000ms delay
            tap(data => console.log(`✅ [Mock API] Loaded ${data.length} interactions`))
        );
    }

    /**
     * Mock: Health check with 1000ms delay
     * 
     * @returns Observable<any> after 1000ms delay
     */
    checkHealth(): Observable<{ status: string; timestamp: string }> {
        console.log('🧪 [Mock API] Health check...');

        return of({
            status: 'healthy',
            timestamp: new Date().toISOString()
        }).pipe(
            delay(this.MOCK_DELAY_MS),  // ✅ 1000ms delay
            tap(() => console.log('✅ [Mock API] Health check passed'))
        );
    }

    /**
     * Mock: Simulate error scenario with delay
     * Useful for testing error handling
     * 
     * @returns Observable that errors after 1000ms
     */
    simulateError(): Observable<never> {
        console.log('🧪 [Mock API] Simulating error...');

        return throwError(() => new Error('Mock API Error')).pipe(
            delay(this.MOCK_DELAY_MS),  // ✅ Error also delayed
            tap(() => console.error('❌ [Mock API] Error thrown'))
        );
    }

    /**
     * Generate unique mock ID
     * Format: mock_timestamp_random
     */
    private generateMockId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `mock_${timestamp}_${random}`;
    }

    /**
     * Generate sample mock interactions for testing
     */
    private generateMockInteractions(): Interaction[] {
        return [
            { user_id: 'mock_user_1', image_id: '1', action: 'like' },
            { user_id: 'mock_user_1', image_id: '2', action: 'dislike' },
            { user_id: 'mock_user_1', image_id: '3', action: 'superlike' },
            { user_id: 'mock_user_2', image_id: '1', action: 'like' },
            { user_id: 'mock_user_2', image_id: '4', action: 'dislike' }
        ];
    }

    /**
     * Clear mock data (useful for testing)
     */
    clearMockData(): void {
        this.mockInteractions = [];
        console.log('🧹 [Mock API] Data cleared');
    }

    /**
     * Get current mock data count
     */
    getMockDataCount(): number {
        return this.mockInteractions.length;
    }
}
