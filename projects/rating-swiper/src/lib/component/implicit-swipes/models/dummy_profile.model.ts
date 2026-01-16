import { ImageModel } from './image.model';
import { Genders } from '../enums/genders.enum';
import { BaseModel } from './base.model';
import { PersonalInterest } from './personal-interest.model';

export interface DummyProfile extends BaseModel {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profession?: string;
  about?: string;
  gender?: Genders;
  interestedIn?: Genders;
  personalInterests?: PersonalInterest[];
  interestNames: string[];
  images?: ImageModel[];
  bust?: string[];
  hip?: string[];
  face?: number;
  ethnicity?: string[];
  age?: number;
  height?: number;
  friends: boolean;
  relationships: boolean;
  interests?: number;
  matchingPercentage?: number;
  index?: number;
  imageUrl?: string;
  profileImageIndex?: number; // Stores the index of the current image being switched to
}
