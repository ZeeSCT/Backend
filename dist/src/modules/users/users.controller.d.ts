import { UsersService } from './users.service';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
}
