import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true, unique: true })
  templateId: string;

  @Prop({ required: true, enum: ['square', 'portrait', 'landscape'] })
  orientation: string;

  @Prop({
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    required: true,
  })
  canvas: {
    width: number;
    height: number;
  };

  @Prop({
    type: {
      assetId: { type: String, required: true },
      url: { type: String, required: true },
    },
    required: true,
  })
  backgroundImage: {
    assetId: string;
    url: string;
  };

  @Prop({
    type: [
      {
        id: String,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        fontFamily: String,
        fontWeight: Number,
        fontColor: String,
        maxFontSize: Number,
        minFontSize: Number,
        textAlign: String,
        lineHeight: Number,
        underline: Boolean,
        italic: Boolean,
        bold: Boolean,
        rotation: Number,
        outlineWidth: Number,
        outlineColor: String,
        textShadow: {
          offsetX: Number,
          offsetY: Number,
          blur: Number,
          color: String,
        },
        background: {
          enabled: Boolean,
          color: String,
          padding: Number,
          borderRadius: Number,
        },
      },
    ],
    required: true,
  })
  textAreas: Array<{
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
    textShadow?: {
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
    background?: {
      enabled: boolean;
      color: string;
      padding: number;
      borderRadius: number;
    };
  }>;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] })
  status: string;

  @Prop({ required: false })
  thumbnailUrl?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
