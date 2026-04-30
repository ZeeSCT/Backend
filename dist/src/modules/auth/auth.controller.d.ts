import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private service;
    constructor(service: AuthService);
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
    me(user: any): any;
}
