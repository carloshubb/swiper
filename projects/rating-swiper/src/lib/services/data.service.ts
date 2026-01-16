/**
 * Data Service
 * Fetches data from JSON files and returns as Observables
 * Follows best practices: No hardcoded data, reactive programming
 * 
 * Client Requirement: "Confirm that any hardcoded data is moved into JSON files
 * and fetched through services as observables"
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { ICardData } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private readonly DATA_PATH = 'assets/data';
    private cardsCache$?: Observable<ICardData[]>;

    constructor(private http: HttpClient) { }

    /**
     * Get profile cards data from JSON file
     * Returns Observable for reactive programming
     * Uses caching to avoid multiple HTTP requests
     * 
     * @returns Observable<ICardData[]> Stream of card data
     */
    getCards(): Observable<ICardData[]> {
        if (!this.cardsCache$) {
            this.cardsCache$ = this.http.get<ICardData[]>(`${this.DATA_PATH}/cards.json`).pipe(
                tap(cards => console.log('✅ Loaded cards from JSON:', cards.length)),
                shareReplay(1), // Cache the result
                catchError(error => {
                    console.error('❌ Error loading cards:', error);
                    // Return fallback empty array
                    return of([]);
                })
            );
        }
        return this.cardsCache$;
    }

    /**
     * Clear cache (useful for testing or forcing reload)
     */
    clearCache(): void {
        this.cardsCache$ = undefined;
    }

    /**
     * Reload data from server
     * @returns Observable<ICardData[]>
     */
    reloadCards(): Observable<ICardData[]> {
        this.clearCache();
        return this.getCards();
    }
}
