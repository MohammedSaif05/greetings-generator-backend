import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SingleGreetingRequestDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  occasion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  message: string;

  @IsString()
  @IsNotEmpty()
  senderName: string;
}
