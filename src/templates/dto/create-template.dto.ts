import {
  IsString,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  ArrayMinSize,
  ArrayUnique,
  IsHexColor,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Orientation {
  SQUARE = 'square',
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export class CanvasDto {
  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;
}

export class BackgroundImageDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class TextShadowDto {
  @IsNumber()
  offsetX: number;

  @IsNumber()
  offsetY: number;

  @IsNumber()
  @Min(0)
  blur: number;

  @IsString()
  @IsNotEmpty()
  // Accepts hex colors (#ffffff), rgba (rgba(0,0,0,0.6)), rgb, or named colors
  color: string;
}

export class TextBackgroundDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @Min(0)
  padding: number;

  @IsNumber()
  @Min(0)
  borderRadius: number;
}

export class TextAreaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @Min(0)
  x: number;

  @IsNumber()
  @Min(0)
  y: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @IsNumber()
  @Min(100)
  @Max(900)
  @IsOptional()
  fontWeight?: number;

  @IsString()
  @IsHexColor()
  fontColor: string;

  @IsNumber()
  @Min(1)
  maxFontSize: number;

  @IsNumber()
  @Min(1)
  minFontSize: number;

  @IsString()
  @IsEnum(['left', 'center', 'right', 'justify'])
  textAlign: string;

  @IsNumber()
  @Min(0.5)
  @Max(3)
  lineHeight: number;

  @IsObject()
  @ValidateNested()
  @Type(() => TextShadowDto)
  @IsOptional()
  textShadow?: TextShadowDto;

  @IsObject()
  @ValidateNested()
  @Type(() => TextBackgroundDto)
  @IsOptional()
  background?: TextBackgroundDto;
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsEnum(Orientation)
  orientation: Orientation;

  @IsObject()
  @ValidateNested()
  @Type(() => CanvasDto)
  canvas: CanvasDto;

  @IsObject()
  @ValidateNested()
  @Type(() => BackgroundImageDto)
  backgroundImage: BackgroundImageDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TextAreaDto)
  @ArrayUnique((textArea: TextAreaDto) => textArea.id)
  textAreas: TextAreaDto[];
}
