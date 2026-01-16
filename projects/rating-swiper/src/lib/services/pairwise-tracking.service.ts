import { Injectable } from '@angular/core';
import {
  PairwiseExport,
  PairwisePairRef,
  PairwiseSelectionEvent,
  PairwiseMethod,
} from '../interfaces/pairwise-tracking.interface';

@Injectable({ providedIn: 'root' })
export class PairwiseTrackingService {
  private startedAt = new Date();
  private sessionId = '';
  private datasetVersion = 'v1.0.0';
  private titleVariantId = 'default';
  private titleText = '';
  private totalPairs = 0;

  // keep full history per pairIndex to support revisions
  private eventsByPairIndex = new Map<number, PairwiseSelectionEvent[]>();

  startSession(params: {
    sessionId: string;
    datasetVersion: string;
    titleVariantId: string;
    titleText: string;
    totalPairs: number;
  }): void {
    this.startedAt = new Date();
    this.sessionId = params.sessionId;
    this.datasetVersion = params.datasetVersion;
    this.titleVariantId = params.titleVariantId;
    this.titleText = params.titleText;
    this.totalPairs = params.totalPairs;
    this.eventsByPairIndex.clear();
  }

  updateMetadata(params: Partial<Pick<PairwiseExport, 'datasetVersion' | 'titleVariantId' | 'titleText'>>): void {
    if (typeof params.datasetVersion === 'string') this.datasetVersion = params.datasetVersion;
    if (typeof params.titleVariantId === 'string') this.titleVariantId = params.titleVariantId;
    if (typeof params.titleText === 'string') this.titleText = params.titleText;
  }

  record(params: {
    pairIndex: number;
    pair: PairwisePairRef;
    selectedCard: 'left' | 'right' | null;
    rejectedCard: 'left' | 'right' | null;
    method: PairwiseMethod;
    timestamp?: Date;
  }): void {
    const history = this.eventsByPairIndex.get(params.pairIndex) ?? [];
    const revision = history.length;

    const event: PairwiseSelectionEvent = {
      pairIndex: params.pairIndex,
      pair: params.pair,
      selectedCard: params.selectedCard,
      rejectedCard: params.rejectedCard,
      method: params.method,
      timestamp: (params.timestamp ?? new Date()).toISOString(),
      revision,
    };

    history.push(event);
    this.eventsByPairIndex.set(params.pairIndex, history);
  }

  getLatestEvents(): PairwiseSelectionEvent[] {
    // latest event per pairIndex (in pair order)
    const indices = Array.from(this.eventsByPairIndex.keys()).sort((a, b) => a - b);
    return indices
      .map((i) => {
        const history = this.eventsByPairIndex.get(i) ?? [];
        return history[history.length - 1];
      })
      .filter(Boolean) as PairwiseSelectionEvent[];
  }

  export(): PairwiseExport {
    const endedAt = new Date();
    const totalTimeMs = endedAt.getTime() - this.startedAt.getTime();

    const latest = this.getLatestEvents();
    const skippedPairs = latest.filter((e) => e.method === 'skip').map((e) => e.pairIndex);
    const revisedPairs = Array.from(this.eventsByPairIndex.entries())
      .filter(([, history]) => history.length > 1)
      .map(([pairIndex]) => pairIndex)
      .sort((a, b) => a - b);

    return {
      sessionId: this.sessionId,
      datasetVersion: this.datasetVersion,
      titleVariantId: this.titleVariantId,
      titleText: this.titleText,
      startedAt: this.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      totalTimeMs,
      totalPairs: this.totalPairs,
      selections: latest,
      skippedPairs,
      revisedPairs,
    };
  }

  exportJson(pretty: boolean = true): string {
    return JSON.stringify(this.export(), null, pretty ? 2 : 0);
  }

  downloadJson(filename: string = 'pairwise-results.json'): void {
    const json = this.exportJson(true);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}


