import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { SystemSettingsService } from "./system-settings.service";
import { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";

@ApiTags("Admin - System Settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/admin/system-settings")
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get("summary")
  getSummary() {
    return this.service.getSummary();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put()
  updateMany(@Body() dto: UpdateSystemSettingsDto) {
    return this.service.updateMany(dto);
  }
}