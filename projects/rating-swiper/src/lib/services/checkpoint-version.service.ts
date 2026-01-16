import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Checkpoint interfaces matching backend schema
 */
export interface CheckpointVersion {
    checkpoint_name: string;
    title: string;
    version: string;
    swiper_title: string | null;
    training_date: string;
    data_path: string;
    versions_available: string[];
    is_latest: boolean;
}

export interface CheckpointListItem {
    name: string;
    title: string;
    versions: string[];
    latest_version: string;
    created_at: string;
    updated_at?: string;
}

/**
 * Checkpoint Version Service
 * 
 * Manages versioned checkpoints similar to npm packages
 * - Each checkpoint has a title and multiple versions
 * - Never overwrites existing versions
 * - Defaults to latest version if not specified
 */
@Injectable({
    providedIn: 'root'
})
export class CheckpointVersionService {
    private get baseUrl(): string {
        let url = localStorage.getItem('sw_api_url') || environment.apiUrl;
        if (url.includes('localhost')) {
            url = url.replace('localhost', '127.0.0.1');
        }
        return `${url}/v2`;
    }

    // Track active checkpoint state
    private activeCheckpointName: string | null = null;
    private activeVersion: string | null = null;

    constructor(private http: HttpClient) {
        // Load from localStorage on initialization
        // Check new keys first, then fall back to legacy keys
        this.activeCheckpointName = localStorage.getItem('sw_active_checkpoint_name') ||
            localStorage.getItem('sw_checkpoint_name');

        this.activeVersion = localStorage.getItem('sw_active_checkpoint_version') ||
            localStorage.getItem('sw_checkpoint_version') ||
            localStorage.getItem('sw_checkpoint');

        // If we have a version but no name, default to '00' (common default)
        if (this.activeVersion && !this.activeCheckpointName) {
            this.activeCheckpointName = '00';
        }

        console.log(`[CheckpointVersionService] Initialized. Active: ${this.activeCheckpointName}@${this.activeVersion}`);
    }

    /**
     * Set the active checkpoint and version
     */
    setActiveCheckpoint(name: string, version: string): void {
        this.activeCheckpointName = name;
        this.activeVersion = version;

        localStorage.setItem('sw_active_checkpoint_name', name);
        localStorage.setItem('sw_active_checkpoint_version', version);

        // Also update legacy keys for compatibility
        localStorage.setItem('sw_checkpoint_name', name);
        localStorage.setItem('sw_checkpoint_version', version);
        localStorage.setItem('sw_checkpoint', version);

        console.log(`[CheckpointVersionService] Active checkpoint set to: ${name}@${version}`);
    }

    /**
     * Get the active checkpoint compound version string
     * Format: checkpoint_name@v1.0.0
     */
    getActiveCompoundVersion(): string | null {
        if (!this.activeCheckpointName || !this.activeVersion) {
            return null;
        }
        return `${this.activeCheckpointName}@${this.formatVersion(this.activeVersion)}`;
    }

    /**
     * Get raw active values
     */
    getActiveInfo() {
        return {
            name: this.activeCheckpointName,
            version: this.activeVersion
        };
    }

    /**
     * List all available checkpoints with their versions
     */
    listCheckpoints(): Observable<{ checkpoints: CheckpointListItem[] }> {
        return this.http.get<{ checkpoints: CheckpointListItem[] }>(
            `${this.baseUrl}/checkpoints`
        );
    }

    /**
     * Get checkpoint data
     * @param checkpointName Name of the checkpoint
     * @param version Optional version number (defaults to latest if not specified)
     */
    getCheckpoint(
        checkpointName: string,
        version?: string
    ): Observable<CheckpointVersion> {
        let url = `${this.baseUrl}/checkpoint?checkpoint_name=${encodeURIComponent(checkpointName)}`;
        if (version) {
            url += `&version=${encodeURIComponent(version)}`;
        }
        return this.http.get<CheckpointVersion>(url);
    }

    /**
     * Get all versions for a specific checkpoint
     * @param checkpointName Name of the checkpoint
     */
    getVersions(checkpointName: string): Observable<{ checkpoint_name: string; versions: string[] }> {
        return this.http.get<{ checkpoint_name: string; versions: string[] }>(
            `${this.baseUrl}/checkpoint/${encodeURIComponent(checkpointName)}/versions`
        );
    }

    /**
     * Update checkpoint title (affects all versions)
     * @param checkpointName Name of the checkpoint
     * @param title New title
     */
    updateTitle(
        checkpointName: string,
        title: string
    ): Observable<{ status: string; message: string }> {
        return this.http.patch<{ status: string; message: string }>(
            `${this.baseUrl}/checkpoint/${encodeURIComponent(checkpointName)}/title`,
            { title }
        );
    }

    /**
     * Migrate legacy checkpoints to versioned format
     */
    migrateLegacyCheckpoints(): Observable<{ status: string; message: string }> {
        return this.http.post<{ status: string; message: string }>(
            `${this.baseUrl}/migrate`,
            {}
        );
    }

    /**
     * Format version for display (e.g., "v1.0.0")
     */
    formatVersion(version: string): string {
        return version.startsWith('v') ? version : `v${version}`;
    }

    /**
     * Parse version string (remove 'v' prefix if present)
     */
    parseVersion(version: string): string {
        return version.startsWith('v') ? version.substring(1) : version;
    }

    /**
     * Compare two versions
     * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
     */
    compareVersions(v1: string, v2: string): number {
        const parts1 = this.parseVersion(v1).split('.').map(Number);
        const parts2 = this.parseVersion(v2).split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;

            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }

        return 0;
    }

    /**
     * Sort versions in descending order (newest first)
     */
    sortVersionsDescending(versions: string[]): string[] {
        return [...versions].sort((a, b) => this.compareVersions(b, a));
    }
}
