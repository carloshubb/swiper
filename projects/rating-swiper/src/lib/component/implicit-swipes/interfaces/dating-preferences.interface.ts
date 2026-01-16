import { PreferencesType } from "../enums/preferences-type.enums";
import { UserPhysicalPreferences } from "./user-physical-preferences.interface";

export interface DatingPreferences extends UserPhysicalPreferences {
  preferredType?: PreferencesType;
  friends?: boolean;
  relationships?: boolean;
  interests?: number;
  preferencesProfile?: number;
}
