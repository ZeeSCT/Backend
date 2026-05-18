import { Module } from "@nestjs/common";
import { MaterialResourceController } from "./controller";
import { MaterialResourceService } from "./service";
import { PrismaService } from "@/common/prisma/prisma.service";

@Module({
  controllers: [MaterialResourceController],
  providers: [MaterialResourceService, PrismaService],
})
export class MaterialResourceModule {}