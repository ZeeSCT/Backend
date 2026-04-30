"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) { const email = dto.email.trim().toLowerCase(); if (await this.prisma.user.findUnique({ where: { email } }))
        throw new common_1.BadRequestException('Email already exists'); const passwordHash = await bcrypt.hash(dto.password, 10); const user = await this.prisma.user.create({ data: { name: dto.name, email, passwordHash, role: dto.role || client_1.UserRole.ENGINEER } }); return this.response(user); }
    async login(dto) { const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } }); if (!user || !user.isActive)
        throw new common_1.UnauthorizedException('Invalid credentials'); if (!await bcrypt.compare(dto.password, user.passwordHash))
        throw new common_1.UnauthorizedException('Invalid credentials'); return this.response(user); }
    async response(user) { const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, name: user.name }); return { accessToken, tokenType: 'Bearer', user: { id: user.id, name: user.name, email: user.email, role: user.role } }; }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map