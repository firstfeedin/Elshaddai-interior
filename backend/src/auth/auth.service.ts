import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Role } from '@prisma/client';

// Roles that require MFA
const MFA_REQUIRED_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const password_hash = await bcrypt.hash(dto.password, 12);

    // Build profile_data from role-specific fields
    const profile_data: Record<string, any> = {};
    if (dto.years_experience) profile_data.years_experience = dto.years_experience;
    if (dto.specialisation) profile_data.specialisation = dto.specialisation;
    if (dto.city) profile_data.city = dto.city;

    // Create or find org for non-client roles
    let org_id: string | undefined;
    if (dto.organisation_name && dto.role !== Role.CLIENT) {
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
        role: dto.role || Role.CLIENT,
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

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password_hash)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.is_active) throw new ForbiddenException('Account deactivated');

    // MFA check for admin roles
    if (MFA_REQUIRED_ROLES.includes(user.role) && user.mfa_enabled) {
      if (!dto.mfa_code) {
        return { mfa_required: true, user_id: user.id };
      }
      const isValid = authenticator.verify({
        token: dto.mfa_code,
        secret: user.mfa_secret!,
      });
      if (!isValid) throw new UnauthorizedException('Invalid MFA code');
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

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'El Shaddai', secret);
    const qr = await qrcode.toDataURL(otpauth);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfa_secret: secret },
    });

    return { secret, qr_code: qr };
  }

  async verifyMfaSetup(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfa_secret) throw new BadRequestException('MFA not initialised');

    const valid = authenticator.verify({ token, secret: user.mfa_secret });
    if (!valid) throw new BadRequestException('Invalid TOTP code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfa_enabled: true },
    });
    return { mfa_enabled: true };
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!stored || stored.expires_at < new Date())
      throw new UnauthorizedException('Refresh token expired or invalid');

    await this.prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    return { message: 'Logged out' };
  }

  async getMe(userId: string) {
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

  private async generateTokens(userId: string, email: string, role: Role) {
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
}
