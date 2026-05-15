import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class UpdateSystemSettingItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsString()
  status: string;
}

export class UpdateSystemSettingsDto {
  @ApiProperty({ type: [UpdateSystemSettingItemDto] })
  @IsArray()
  settings: UpdateSystemSettingItemDto[];
}