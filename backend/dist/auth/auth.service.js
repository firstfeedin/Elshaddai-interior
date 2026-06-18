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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const otplib_1 = require("otplib");
const qrcode = require("qrcode");
const client_1 = require("@prisma/client");
const MFA_REQUIRED_ROLES = [client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN];
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const password_hash = await bcrypt.hash(dto.password, 12);
        const profile_data = {};
        if (dto.years_experience)
            profile_data.years_experience = dto.years_experience;
        if (dto.specialisation)
            profile_data.specialisation = dto.specialisation;
        if (dto.city)
            profile_data.city = dto.city;
        let org_id;
        if (dto.organisation_name && dto.role !== client_1.Role.CLIENT) {
            const slug = dto.organisation_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const org = await this.prisma.organisation.upsert({
                where: { slug },
                create: { name: dto.organisation_name, slug, city: dto.city },
                update: {},
            });
            org_id = org.id;
        }
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password_hash,
                phone: dto.phone,
                role: dto.role || client_1.Role.CLIENT,
                profile_data,
                org_id,
            },
            select: {
                id: true, name: true, email: true, role: true,
                org_id: true, created_at: true,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user, ...tokens };
    }
    async login(dto, ip) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.password_hash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.is_active)
            throw new common_1.ForbiddenException('Account deactivated');
        if (MFA_REQUIRED_ROLES.includes(user.role) && user.mfa_enabled) {
            if (!dto.mfa_code) {
                return { mfa_required: true, user_id: user.id };
            }
            const isValid = otplib_1.authenticator.verify({
                token: dto.mfa_code,
                secret: user.mfa_secret,
            });
            if (!isValid)
                throw new common_1.UnauthorizedException('Invalid MFA code');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        const safeUser = {
            id: user.id, name: user.name, email: user.email,
            role: user.role, org_id: user.org_id, avatar: user.avatar,
            mfa_enabled: user.mfa_enabled,
        };
        return { user: safeUser, ...tokens };
    }
    async setupMfa(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(user.email, 'El Shaddai', secret);
        const qr = await qrcode.toDataURL(otpauth);
        await this.prisma.user.update({
            where: { id: userId },
            data: { mfa_secret: secret },
        });
        return { secret, qr_code: qr };
    }
    async verifyMfaSetup(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.mfa_secret)
            throw new common_1.BadRequestException('MFA not initialised');
        const valid = otplib_1.authenticator.verify({ token, secret: user.mfa_secret });
        if (!valid)
            throw new common_1.BadRequestException('Invalid TOTP code');
        await this.prisma.user.update({
            where: { id: userId },
            data: { mfa_enabled: true },
        });
        return { mfa_enabled: true };
    }
    async refresh(token) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!stored || stored.expires_at < new Date())
            throw new common_1.UnauthorizedException('Refresh token expired or invalid');
        await this.prisma.refreshToken.delete({ where: { token } });
        return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
    }
    async logout(token) {
        await this.prisma.refreshToken.deleteMany({ where: { token } });
        return { message: 'Logged out' };
    }
    async getMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, phone: true, avatar: true,
                role: true, org_id: true, profile_data: true, mfa_enabled: true,
                email_verified: true, created_at: true,
                organisation: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const access_token = this.jwt.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        });
        const refresh_token = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { user_id: userId, token: refresh_token, expires_at: expiresAt },
        });
        return { access_token, refresh_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map