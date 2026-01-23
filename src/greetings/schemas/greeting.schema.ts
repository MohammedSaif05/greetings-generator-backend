import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GreetingDocument = Greeting & Document;

@Schema({ timestamps: true })
export class Greeting {
  @Prop({ required: true })
  templateId: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  occasion: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({
    type: [
      {
        width: Number,
        height: Number,
        url: String,
      },
    ],
    required: false,
  })
  imageUrls?: Array<{
    width: number;
    height: number;
    url: string;
  }>;

  @Prop({ required: false })
  rowNumber?: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const GreetingSchema = SchemaFactory.createForClass(Greeting);
