import { DummyProfile } from "../models/dummy_profile.model";

export interface DummyProfileResponse {
  docs?: DummyProfile[];
  meta?: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    pagingCounter: number;
    prevPage: number;
    totalDocs: number;
    totalPages: number;
  };
}
