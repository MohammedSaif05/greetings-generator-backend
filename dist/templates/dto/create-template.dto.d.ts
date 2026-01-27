export declare enum Orientation {
    SQUARE = "square",
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}
export declare class CanvasDto {
    width: number;
    height: number;
}
export declare class BackgroundImageDto {
    assetId: string;
    url: string;
}
export declare class TextShadowDto {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
}
export declare class TextBackgroundDto {
    enabled: boolean;
    color: string;
    padding: number;
    borderRadius: number;
}
export declare class TextAreaDto {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontWeight?: number;
    fontColor: string;
    maxFontSize: number;
    minFontSize: number;
    textAlign: string;
    lineHeight: number;
    underline?: boolean;
    italic?: boolean;
    bold?: boolean;
    rotation?: number;
    outlineWidth?: number;
    outlineColor?: string;
    textShadow?: TextShadowDto;
    background?: TextBackgroundDto;
}
export declare class CreateTemplateDto {
    templateId: string;
    orientation: Orientation;
    canvas: CanvasDto;
    backgroundImage: BackgroundImageDto;
    textAreas: TextAreaDto[];
}
