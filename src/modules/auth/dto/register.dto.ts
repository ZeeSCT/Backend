import { ApiProperty } from "@nestjs/swagger";
import { IsEmail,IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @ApiProperty({ example: "" }) 
  @IsString() 
  name!: string;
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
  role?: UserRole;
}
