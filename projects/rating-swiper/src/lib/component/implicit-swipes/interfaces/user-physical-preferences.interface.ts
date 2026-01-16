import { ILowerUpper } from "./lower-upper.interface";
import { PreferencesField } from "./preferences-field.interface";

export interface UserPhysicalPreferences {
  [PreferencesField.Age]?: ILowerUpper;
  [PreferencesField.Height]?: ILowerUpper;
  [PreferencesField.Weight]?: ILowerUpper;
  [PreferencesField.Face]?: number;
  [PreferencesField.Ethnicity]?: string[];

  [PreferencesField.Bust]?: string[];
  [PreferencesField.Waist]?: string[];
  [PreferencesField.Hip]?: string[];

  [PreferencesField.BigSpender]?: ILowerUpper;
  [PreferencesField.Presentable]?: ILowerUpper;
  [PreferencesField.MusclePercentage]?: ILowerUpper;
  [PreferencesField.FatPercentage]?: ILowerUpper;
  [PreferencesField.BigSpender]?: ILowerUpper;

  [PreferencesField.Dominance]?: ILowerUpper;
  [PreferencesField.Power]?: ILowerUpper;
  [PreferencesField.Confidence]?: ILowerUpper;
}
