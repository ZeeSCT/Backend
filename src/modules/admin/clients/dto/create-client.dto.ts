import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { SanitizeString } from "@/common/decorators/sanitize-string.decorator";

export class CreateClientDto {
  @ApiProperty({ example: "EMAAR" })
  @SanitizeString()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "projects@emaar.ae" })
  @IsOptional()
  @SanitizeString({ lowercase: true })
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: "+971 4 123 4567" })
  @IsOptional()
  @SanitizeString()
  @IsString()
  @MaxLength(40)
  @Matches(/^[+0-9 ()-]*$/, {
    message: "Phone can only contain numbers, spaces, +, -, and brackets.",
  })
  phone?: string;

  @ApiPropertyOptional({ example: "Dubai, UAE" })
  @IsOptional()
  @SanitizeString()
  @IsString()
  @MaxLength(240)
  address?: string;

  @ApiPropertyOptional({ example: "Ahmed Karim" })
  @IsOptional()
  @SanitizeString()
  @IsString()
  @MaxLength(120)
  contactName?: string;
}