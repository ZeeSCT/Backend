import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
@ApiTags("Auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private service: AuthService) {}
  @Post("register") register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }
  @Post("login") login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Get("me") me(
    @CurrentUser() user: any,
  ) {
    return user;
  }
}
