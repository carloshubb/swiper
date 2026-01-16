import { ICardData } from './card-data.interface';

export type PairwiseMethod = 'heart' | 'swipe' | 'skip';

export interface PairwiseProfileRef {
  id: number;
  name: string;
  age: number;
}

export interface PairwisePairRef {
  left: PairwiseProfileRef;
  right: PairwiseProfileRef;
}

export interface PairwiseSelectionEvent {
  pairIndex: number;
  pair: PairwisePairRef;
  selectedCard: 'left' | 'right' | null;
  rejectedCard: 'left' | 'right' | null;
  method: PairwiseMethod;
  timestamp: string; // ISO
  revision: number; // 0 = original, 1+ = revised
}

export interface PairwiseExport {
  sessionId: string;
  datasetVersion: string;
  titleVariantId: string;
  titleText: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  totalTimeMs: number;
  totalPairs: number;
  selections: PairwiseSelectionEvent[];
  skippedPairs: number[];
  revisedPairs: number[];
}


