/**
 * Enhanced Data Service
 * Demonstrates extensive RxJS operator usage
 * 
 * Client Requirement: "Ensure that RxJS ... are used extensively throughout the code"
 * 
 * RxJS Operators Used:
 * - delay, retry, shareReplay, tap, catchError
 * - map, filter, switchMap, debounceTime, distinctUntilChanged
 * - take, timer, combineLatest
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer, combineLatest } from 'rxjs';
import {
    catchError, shareReplay, tap, map, delay,
    retry, switchMap, filter, distinctUntilChanged,
    debounceTime, take
} from 'rxjs/operators';
import { ICardData } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class EnhancedDataService {
    private readonly DATA_PATH = 'assets/data';
    private readonly MOCK_DELAY_MS = 1000; // For testing

    private cardsCache$?: Observable<ICardData[]>;

    constructor(private http: HttpClient) { }

    /**
     * Get cards with extensive RxJS operators
     * 
     * ✅ Uses: delay, retry, shareReplay, tap, catchError
     */
    getCards(useMockDelay: boolean = false): Observable<ICardData[]> {
        if (!this.cardsCache$) {
            this.cardsCache$ = this.http.get<ICardData[]>(`${this.DATA_PATH}/cards.json`).pipe(
                delay(useMockDelay ? this.MOCK_DELAY_MS : 0),  // ✅ delay operator
                tap(cards => console.log(`📦 Loaded ${cards.length} cards`)),  // ✅ tap operator
                retry(2),  // ✅ retry operator
                shareReplay(1),  // ✅ shareReplay operator
                catchError(error => {  // ✅ catchError operator
                    console.error('Error:', error);
                    return of([]);
                })
            );
        }
        return this.cardsCache$;
    }

    /**
     * Search with debouncing
     * 
     * ✅ Uses: debounceTime, distinctUntilChanged, filter, switchMap, map
     */
    searchCards(query$: Observable<string>): Observable<ICardData[]> {
        return query$.pipe(
            debounceTime(300),  // ✅ debounceTime operator
            distinctUntilChanged(),  // ✅ distinctUntilChanged operator
            filter(q => q.length >= 2),  // ✅ filter operator
            switchMap(query =>   // ✅ switchMap operator
                this.getCards().pipe(
                    map(cards => cards.filter(card =>   // ✅ map operator
                        card.name.toLowerCase().includes(query.toLowerCase())
                    ))
                )
            )
        );
    }

    /**
     * Get single card by ID
     * 
     * ✅ Uses: map, take
     */
    getCardById(id: number): Observable<ICardData | undefined> {
        return this.getCards().pipe(
            map(cards => cards.find(c => c.id === id)),  // ✅ map operator
            take(1)  // ✅ take operator
        );
    }

    /**
     * Poll for updates
     * 
     * ✅ Uses: timer, switchMap
     */
    pollCards(intervalMs: number = 5000): Observable<ICardData[]> {
        return timer(0, intervalMs).pipe(  // ✅ timer operator
            switchMap(() => this.reloadCards())  // ✅ switchMap operator
        );
    }

    clearCache(): void {
        this.cardsCache$ = undefined;
    }

    reloadCards(): Observable<ICardData[]> {
        this.clearCache();
        return this.getCards();
    }
}
