import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            org_id: string;
            created_at: Date;
        };
    }>;
    login(dto: LoginDto, ip?: string): Promise<{
        mfa_required: boolean;
        user_id: string;
    } | {
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            org_id: string;
            avatar: string;
            mfa_enabled: boolean;
        };
        mfa_required?: undefined;
        user_id?: undefined;
    }>;
    setupMfa(userId: string): Promise<{
        secret: string;
        qr_code: string;
    }>;
    verifyMfaSetup(userId: string, token: string): Promise<{
        mfa_enabled: boolean;
    }>;
    refresh(token: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        organisation: {
            name: string;
            id: string;
            slug: string;
        };
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        org_id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
        mfa_enabled: boolean;
        email_verified: boolean;
        created_at: Date;
    }>;
    private generateTokens;
}
