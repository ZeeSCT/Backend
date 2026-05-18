import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }

  async create(dto: CreateClientDto) {
    const name = dto.name.trim();

    const existing = await this.prisma.client.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new ConflictException(`Client "${name}" already exists.`);
    }

    return this.prisma.client.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
        contactName: dto.contactName?.trim() || null,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingClient) {
      throw new NotFoundException("Client not found.");
    }

    if (dto.name) {
      const name = dto.name.trim();

      const duplicateClient = await this.prisma.client.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateClient) {
        throw new ConflictException(`Client "${name}" already exists.`);
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.contactName !== undefined && {
          contactName: dto.contactName?.trim() || null,
        }),

        ...(dto.email !== undefined && {
          email: dto.email?.trim() || null,
        }),

        ...(dto.phone !== undefined && {
          phone: dto.phone?.trim() || null,
        }),

        ...(dto.address !== undefined && {
          address: dto.address?.trim() || null,
        }),
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
  }

  async deleteClient(id: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client "${id}" not found.`);
    }

    await this.prisma.client.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "Client deleted successfully.",
      id: client.id,
      name: client.name,
    };
  }
}
