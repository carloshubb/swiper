import { ICardData } from './card-data.interface';

export interface IProfileCardState {
  currentPairIndex: number;
  heartedLists: ICardData[];
  hasCompletedLoop: boolean;
  isHistoryMode: boolean;
}
