import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
export class RegisterDto {
  @ApiProperty({ example: "" }) @IsString() name!: string;
  @ApiProperty({ example: "" })
  @IsEmail()
  email!: string;
  @ApiProperty({ example: "Admin@123" })
  @IsString()
  @MinLength(6)
  password!: string;
  @ApiProperty({ example: "PROJECT_MANAGER", required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
