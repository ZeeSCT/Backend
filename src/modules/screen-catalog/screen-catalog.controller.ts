import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SCREEN_CATALOG } from '@/common/dashboard/screen-catalog';
@ApiTags('Screen Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/screens')
export class ScreenCatalogController {
  @Get()
  @ApiOperation({ summary: 'Frontend screen catalog: 6 modules and 41 HTML dashboard screens' })
  findAll() {
    const modules = SCREEN_CATALOG.reduce((acc, screen) => {
      acc[screen.module] = acc[screen.module] || [];
      acc[screen.module].push(screen);
      return acc;
    }, {} as Record<string, typeof SCREEN_CATALOG>);
    return { totalScreens: SCREEN_CATALOG.length, modules };
  }
}
