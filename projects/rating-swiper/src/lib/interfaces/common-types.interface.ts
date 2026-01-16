/**
 * Local type definitions for types previously from @naniteninja/ionic-lib
 * These are defined locally to remove external dependency
 */

export interface ImageModel {
    id?: string;
    url?: string;
    image?: string;
    fileName?: string;
    isDark?: boolean;
    thumbnail?: string;
    width?: number;
    height?: number;
    name?: string;
    type?: string;
    size?: number;
    order?: number;
    uploading?: boolean;
    progress?: number;
    error?: string;
}


export interface IPosition {
    lat: number;
    lng: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
}

export interface ChangeData {
    number?: string;
    countryCode?: string;
    dialCode?: string;
    formatted?: string;
    internationalNumber?: string;
    nationalNumber?: string;
    valid?: boolean;
    e164Number?: string;
}
