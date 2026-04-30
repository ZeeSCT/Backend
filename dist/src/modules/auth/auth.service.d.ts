import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        tokenType: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        tokenType: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    response(user: any): Promise<{
        accessToken: string;
        tokenType: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
}
