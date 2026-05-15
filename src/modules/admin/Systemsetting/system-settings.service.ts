import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";

@Injectable()
export class SystemSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const settings = await this.prisma.systemSetting.findMany();

    const total = settings.length;
    const enabled = settings.filter((s) => s.status === "Active").length;
    const pending = settings.filter((s) => s.status === "Pending").length;
    const securitySettings = settings.filter((s) => s.category === "Security");
    const hasSecurityPending = securitySettings.some((s) => s.status !== "Active");

    return {
      settings: String(total),
      enabled: String(enabled),
      pending: String(pending),
      security: hasSecurityPending ? "Review" : "High",
    };
  }

  async findAll() {
    return this.prisma.systemSetting.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
  }

  async updateMany(dto: UpdateSystemSettingsDto) {
    await this.prisma.$transaction(
      dto.settings.map((setting) =>
        this.prisma.systemSetting.update({
          where: { id: setting.id },
          data: {
            value: setting.value,
            status: setting.status,
          },
        }),
      ),
    );

    return {
      message: "System settings saved successfully",
      settings: await this.findAll(),
      summary: await this.getSummary(),
    };
  }
}