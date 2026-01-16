import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Interaction {
    user_id: string;
    image_id: string;
    action: 'like' | 'dislike' | 'superlike';
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private get apiUrl(): string {
        let url = localStorage.getItem('sw_api_url') || environment.apiUrl;
        if (url.includes('localhost')) {
            url = url.replace('localhost', '127.0.0.1');
        }
        return url;
    }

    constructor(private http: HttpClient) { }

    logInteraction(interaction: Interaction): Observable<any> {
        console.log('Logging interaction:', interaction);
        return this.http.post(`${this.apiUrl}/interaction`, interaction).pipe(
            catchError(error => {
                console.error('Error logging interaction:', error);
                return of(null);
            })
        );
    }

    getInteractions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/interactions`);
    }

    checkHealth(): Observable<any> {
        return this.http.get(`${this.apiUrl}/health`);
    }
}
