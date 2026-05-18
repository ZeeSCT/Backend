import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/users")
export class UsersController {
  constructor(private service: UsersService) {}
  @Get() findAll() {
    return this.service.findAll();
  }
}
