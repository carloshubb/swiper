import { TranslationLanguagesType } from "../types/translation-language.type";

export interface PersonalInterest {
  _id: string;
  name: TranslationLanguagesType;
  active: boolean;
  selected?: boolean;
  createdAt: string;
}
