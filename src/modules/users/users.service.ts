import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/common/prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";

import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(
      "Welcome@123",
      10
    );

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        department: dto.department,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: { id },
      });

    if (!existingUser) {
      throw new NotFoundException(
        "User not found"
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  }
}