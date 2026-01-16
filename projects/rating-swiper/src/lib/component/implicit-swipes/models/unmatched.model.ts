import { ChangeData, ImageModel, IPosition } from '../../../interfaces/common-types.interface';
import { AccountStatuses } from '../enums/account-status.enum';
import { AccountTypes } from '../enums/account-type.enum';
import { Genders } from '../enums/genders.enum';
import { IDeviceIdentity } from '../interfaces/device-identity.interface';
import { BaseModel } from './base.model';
import { DatingPreferences } from '../interfaces/dating-preferences.interface';
import { ISettings } from '../interfaces/settings.interface';
import { PersonalInterest } from './personal-interest.model';
import { RouteStatuses } from '../interfaces/route-statuses.interface';

export interface Unmatched extends BaseModel {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
  phoneDetails?: ChangeData;
  location?: IPosition;
  skipLocation?: boolean;
  username?: string;
  referralCode?: string;
  preferredLocations?: PreferredLocations[];
  address?: {
    addressLine1: string;
    addressLine2: string;
  };
  birthDate?: Date;
  gender?: Genders;
  interestedIn?: Genders;
  verified?: boolean;
  acceptedConditions?: boolean;
  personalInterests?: PersonalInterest[];
  preferredLanguages?: string[];
  images?: ImageModel[];
  percentage?: number;
  phoneOtp?: Otp;
  emailOtp?: Otp;
  datingPreferences?: DatingPreferences;
  lastActiveRoute?: string;
  registrationComplete?: boolean;
  rejectedPhotos?: ImageModel[];
  farthestRoute?: string;
  farthestProgress?: number;
  dynamicRoutes?: string[];
  fakeProfilesSwipeHistory?: string[];
  visitedSwipeIndexes?: number[];
  superLikeCount?: number;
  recommendedUsernames?: string[];
  swipingDecisions?: { id: string; decision: number }[];
  bio?: string;
  work?: string;
  education?: string;
  pronoun?: string;
  homeTown?: string;
  smoking?: boolean;
  drinking?: boolean;
  kids?: boolean;
  political?: boolean;
  height?: number;
  impromptuImages?: ImageModel[];
  settings?: ISettings;
  itineraryUpvotes?: string[]; // Array of the ids of itinearies a user has upvoted
  itineraryDownvotes?: string[]; // Array of the ids of itinearies a user has downvoted
  appLanguage?: string;
  socketId?: string;
  status?: AccountStatuses;
  deviceIdentities?: IDeviceIdentity[];
  userType?: AccountTypes;
  routeStatuses?: (typeof RouteStatuses)[AccountTypes.unmatched];
  skipOptionalScreens?: boolean;
  currency1?: number;
  currency2?: number;
  hasSleepingEvent?: boolean;
  profileInfo?: string;
  preferencesInfo?: string;
  scheduleInfo?: string;
  membership?: string;
}

export interface PreferredLocations {
  radius: number;
  lat: number;
  lng: number;
  address?: string;
}

export interface Otp {
  code?: string;
  retries?: number;
}
