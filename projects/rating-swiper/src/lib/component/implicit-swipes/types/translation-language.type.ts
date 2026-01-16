import { TranslationLanguages } from "../enums/translation-languages.enum";

export type TranslationLanguagesType = {
  [key in TranslationLanguages]: string;
};
