export interface CropperPosition {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface ImageModel {
    image: string;
    fileName: string;
    orientation?: number;
    moreThan2mb?: boolean;
    constainsFace?: boolean;
    isSafeForWork?: boolean;
    dupName?: string;
    invalid?: boolean;
    deactivated?: boolean;
    isDark: boolean;
    croppedCoordinates?: CropperPosition;
}
